import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from './user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '../../types/jwt-payload.interface';

/**
 * Authentication service
 * Handles user authentication, registration, and token management
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
   * Register a new user
   * @param loginDto - User credentials
   * @returns Authentication response with tokens
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
   * Login existing user
   * @param loginDto - User credentials
   * @returns Authentication response with tokens
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
   * @param refreshToken - Current refresh token
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid or expired
   */
  public async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify and decode refresh token with explicit type
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find user by ID from token payload
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token in database
      await this.userRepo.update(user.id, {
        refreshToken: tokens.refreshToken,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      // Catch block without unused variable
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   * Removes refresh token from database
   * @param userId - User ID to logout
   * @returns Success message
   */
  public async logout(userId: string): Promise<{ message: string }> {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  /**
   * Get user profile by ID
   * @param userId - User ID
   * @returns User profile data
   * @throws UnauthorizedException if user not found
   */
  public async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  /**
   * Get all users
   * Demo endpoint - should be removed in production
   * @returns List of all users
   */
  public async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepo.find();

    return users.map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }

  /**
   * Generate JWT access and refresh tokens
   * @param user - User entity
   * @returns Object with access and refresh tokens
   */
  private async generateTokens(
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
}
