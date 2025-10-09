import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { JwtPayload } from '../../types/jwt-payload.interface';
import { UserMockRepository } from './repositories/user.mock-repository'; // ✅ Добавили

/**
 * Authentication service
 * Provides JWT token management and authentication infrastructure
 * for all authentication methods (OAuth, Magic Link, etc.)
 *
 * NOTE: Currently using UserMockRepository for testing without database
 * TODO: Replace with TypeORM Repository when database is configured
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserMockRepository, // ✅ Используем Mock
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate JWT access and refresh tokens
   * Core method used by ALL authentication methods:
   * - OAuth (Google, Facebook) will call this after user verification
   * - Magic Link will call this after email verification
   *
   * @param user - User entity
   * @returns Object with access and refresh tokens
   */
  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
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
   * Refresh access and refresh tokens
   * Used by ALL authentication methods (OAuth, Magic Link, etc.)
   * @param refreshToken - Current refresh token
   * @returns New access and refresh tokens
   * @throws UnauthorizedException if token is invalid or expired
   */
  async refresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findById(payload.sub); // ✅ Изменили на findById

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
  async logout(userId: string): Promise<{ message: string }> {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  /**
   * Find user by email
   * Helper method for OAuth and Magic Link authentication
   * @param email - User email
   * @returns User entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  /**
   * Create new user
   * Will be used by OAuth and Magic Link strategies
   * @param userData - User data from authentication provider
   * @returns Created user entity
   */
  async createUser(userData: Partial<User>): Promise<User> {
    return this.userRepo.create(userData);
  }

  // ========================================
  // FUTURE IMPLEMENTATIONS (Sprint 2+)
  // ========================================

  /**
   * Find or create user by OAuth provider
   * TODO: Implement in Sprint 2 when adding Google/Facebook OAuth
   *
   * @param provider - OAuth provider name (google, facebook, linkedin)
   * @param providerId - User ID from OAuth provider
   * @param email - User email from OAuth provider
   * @returns User entity
   */
  // async findOrCreateOAuthUser(
  //   provider: string,
  //   providerId: string,
  //   email: string,
  // ): Promise<User> {
  //   let user = await this.userRepo.findByProvider(provider, providerId);
  //
  //   if (!user) {
  //     user = await this.createUser({
  //       email,
  //       provider,
  //       providerId,
  //     });
  //   }
  //
  //   return user;
  // }

  /**
   * Verify magic link token and authenticate user
   * TODO: Coordinate with Den on Magic Link implementation
   *
   * @param token - Magic link token from email
   * @returns Authentication response with JWT tokens
   */
  // async verifyMagicLink(token: string): Promise<{
  //   accessToken: string;
  //   refreshToken: string;
  // }> {
  //   // Implementation by Den's team
  // }
}
