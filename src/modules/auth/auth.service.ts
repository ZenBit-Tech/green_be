import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from './user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../types/jwt-payload.interface';

/**
 * Authentication service
 * Provides JWT token management and authentication infrastructure
 * for all authentication methods (OAuth, Magic Link, etc.)
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user (TEMPORARY - for testing JWT infrastructure)
   * TODO: Remove in production - users will authenticate via OAuth/Magic Link
   * @param loginDto - User credentials
   * @returns Authentication response with JWT tokens
   * @throws ConflictException if username already exists
   */
  public async register(loginDto: LoginDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepo.findOne({
      where: { username: loginDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(
      loginDto.password,
      this.SALT_ROUNDS,
    );

    const user = this.userRepo.create({
      username: loginDto.username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepo.save(user);

    const tokens = await this.generateTokens(savedUser);

    await this.userRepo.update(savedUser.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: {
        id: savedUser.id,
        username: savedUser.username,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login existing user (TEMPORARY - for testing JWT infrastructure)
   * TODO: Remove in production - users will authenticate via OAuth/Magic Link
   * @param loginDto - User credentials
   * @returns Authentication response with JWT tokens
   * @throws UnauthorizedException if credentials are invalid
   */
  public async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    await this.userRepo.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access and refresh tokens
   * Used by ALL authentication methods (OAuth, Magic Link, etc.)
   * @param refreshToken - Current refresh token
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid or expired
   */
  public async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      await this.userRepo.update(user.id, {
        refreshToken: tokens.refreshToken,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   * Removes refresh token from database
   * Used by ALL authentication methods
   * @param userId - User ID to logout
   * @returns Success message
   */
  public async logout(userId: string): Promise<{ message: string }> {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT access and refresh tokens
   * Core method used by ALL authentication methods:
   * - OAuth (Google, Facebook) will call this after user verification
   * - Magic Link will call this after email verification
   * - Traditional login (temporary) uses this
   *
   * @param user - User entity
   * @returns Object with access and refresh tokens
   */
  public async generateTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Find or create user by OAuth provider
   * Will be used by Google OAuth and Facebook OAuth strategies
   *
   * @param provider - OAuth provider name (google, facebook)
   * @param providerId - User ID from OAuth provider
   * @param email - User email from OAuth provider
   * @returns User entity
   *
   * TODO: Implement in Sprint 2 when adding OAuth
   */
  // public async findOrCreateOAuthUser(
  //   provider: string,
  //   providerId: string,
  //   email: string,
  // ): Promise<UserEntity> {
  //   // Implementation for future OAuth integration
  // }

  /**
   * Verify magic link token and authenticate user
   * Will be used by Magic Link strategy (Den's task)
   *
   * @param token - Magic link token from email
   * @returns Authentication response with JWT tokens
   *
   * TODO: Coordinate with Den on implementation
   */
  // public async verifyMagicLink(
  //   token: string,
  // ): Promise<AuthResponseDto> {
  //   // Implementation for magic link (Den's task)
  // }
}
