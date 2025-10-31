import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { EmailService } from '@common/services/email.service';
import { JwtPayload } from '@app-types/jwt-payload.interface';
import { OAuthProfile } from '../../types/oauth-profile.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ResponseMagicLinkDto } from './dto/response-magic-link.dto';
import { MagicLinkTokenEntity } from './entities/magic-link-token.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  public constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(MagicLinkTokenEntity)
    private readonly tokenRepo: Repository<MagicLinkTokenEntity>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly jwtService: NestJwtService,
  ) {}

  // ========================================
  // Magic Link Authentication (Existing)
  // ========================================

  public async requestMagicLink(
    emailAddress: string,
  ): Promise<ResponseMagicLinkDto> {
    try {
      const token = String(uuidv4());
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expirySeconds =
        this.configService.get<number>('MAGIC_LINK_EXPIRY_SECONDS') ?? 3600;
      const expiresAt = nowSeconds + expirySeconds;

      await this.dataSource.transaction(async (manager) => {
        let userFound = await manager.findOne(UserEntity, {
          where: { email: emailAddress },
        });

        if (!userFound) {
          userFound = manager.create(UserEntity, {
            email: emailAddress,
            provider: 'magic_link',
          });
          await manager.save(UserEntity, userFound);
        }

        const tokenEntity = manager.create(MagicLinkTokenEntity, {
          token,
          user: userFound,
          expiresAt,
        });

        await manager.save(MagicLinkTokenEntity, tokenEntity);
      });

      const backendUrl = this.configService.getOrThrow<string>('BACKEND_URL');
      const link = `${backendUrl}/auth/magic-link/consume?token=${token}`;
      const from =
        this.configService.get<string>('EMAIL_FROM') ?? 'noreply@lab-ai.com';

      await this.emailService.sendMagicLink({
        to: emailAddress,
        from,
        link,
        expiresInSeconds: expirySeconds,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(
        'requestMagicLink failed',
        (error as Error).message ?? 'Unknown error',
      );
      throw new InternalServerErrorException(
        'Failed to process magic link request',
      );
    }
  }

  public async consumeMagicLink(token: string): Promise<AuthResponseDto> {
    try {
      const nowSeconds = Math.floor(Date.now() / 1000);

      const tokenEntity = await this.tokenRepo.findOne({
        where: { token },
        relations: ['user'],
      });

      if (!tokenEntity) {
        throw new NotFoundException('Magic link not found or already used');
      }

      if (tokenEntity.expiresAt < nowSeconds) {
        await this.tokenRepo.delete({ id: tokenEntity.id });
        throw new UnauthorizedException('Magic link expired');
      }

      const user = tokenEntity.user;
      if (!user) {
        throw new NotFoundException('User not found for this magic link');
      }

      await this.tokenRepo.delete({ id: tokenEntity.id });

      const tokens = await this.generateTokens(user);

      await this.userRepo.update(user.id, {
        refreshToken: tokens.refreshToken,
      });

      const expiresIn = this.configService.getOrThrow<number>(
        'JWT_EXPIRES_IN_SECONDS',
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn,
        user: user,
      };
    } catch (err) {
      this.logger.error('consumeMagicLink failed', (err as Error).message);
      throw err;
    }
  }

  // ========================================
  // OAuth Authentication
  // ========================================

  public async handleOAuthLogin(
    profile: OAuthProfile,
  ): Promise<AuthResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `OAuth login attempt for ${profile.email} via ${profile.provider}`,
      );

      // Find existing user
      let user = await queryRunner.manager.findOne(UserEntity, {
        where: { email: profile.email },
      });

      if (!user) {
        this.logger.log(`Creating new user for ${profile.email}`);

        // Create new user with OAuth data
        user = queryRunner.manager.create(UserEntity, {
          email: profile.email,
          provider: profile.provider,
          providerId: profile.providerId,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          picture: profile.picture || null,
        });

        await queryRunner.manager.save(user);
      } else {
        this.logger.log(
          `User ${profile.email} already exists, updating OAuth data`,
        );

        // Update existing user with OAuth data
        await queryRunner.manager.update(UserEntity, user.id, {
          provider: profile.provider,
          providerId: profile.providerId,
          firstName: profile.firstName || user.firstName,
          lastName: profile.lastName || user.lastName,
          picture: profile.picture || user.picture,
        });

        // Reload user after update
        const updatedUser = await queryRunner.manager.findOne(UserEntity, {
          where: { id: user.id },
        });

        if (!updatedUser) {
          throw new NotFoundException('User not found after update');
        }

        user = updatedUser;
      }

      // Generate JWT tokens
      const tokens = await this.generateTokens(user);

      // Save refresh token
      await queryRunner.manager.update(UserEntity, user.id, {
        refreshToken: tokens.refreshToken,
      });

      await queryRunner.commitTransaction();

      const expiresIn = this.configService.get<number>(
        'JWT_EXPIRES_IN_SECONDS',
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn,
        user: user,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('handleOAuthLogin failed', (err as Error).message);
      throw new InternalServerErrorException('OAuth login failed');
    } finally {
      await queryRunner.release();
    }
  }

  // ========================================
  // Token Management
  // ========================================

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

  public async logout(id: string): Promise<{ message: string }> {
    await this.userRepo.update(id, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  public async generateTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: `${this.configService.get<number>('JWT_EXPIRES_IN_SECONDS')}s`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS')}s`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
