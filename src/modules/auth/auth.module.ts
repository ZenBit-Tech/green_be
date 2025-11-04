import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from './entities/user.entity';
import { MagicLinkTokenEntity } from './entities/magic-link-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { EmailService } from '@common/services/email.service';

/**
 * Authentication Module
 * Provides JWT-based authentication infrastructure for the application
 *
 * Features:
 * - JWT access and refresh token management
 * - Magic Link passwordless authentication
 * - OAuth (Google, LinkedIn)
 * - Global authentication guard with @Public() decorator support
 * - Passport strategies for token validation
 * - User entity and TypeORM integration
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, MagicLinkTokenEntity]),
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    GoogleStrategy,
    LinkedInStrategy,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
