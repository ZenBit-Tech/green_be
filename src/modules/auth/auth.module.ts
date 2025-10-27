import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from './entities/user.entity';
import { MagicLinkTokenEntity } from './entities/magic-link-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.getOrThrow<number>(
          'JWT_EXPIRES_IN_SECONDS',
        );
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn, // 👈 Передаём как number (в секундах)
          },
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity, MagicLinkTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    LinkedInStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
