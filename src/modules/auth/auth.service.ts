import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  magicLinkExpirySeconds,
  jwtExpiresDefaultSeconds,
  backendUrlEnvKey,
  emailFromEnvKey,
} from '@common/constants/app.constants';
import { EmailService } from '@common/services/email.service';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ResponseMagicLinkDto } from './dto/response-magic-link.dto';
import { MagicLinkTokenEntity } from './entities/magic-link-token.entity';
import { UserEntity } from './entities/user.entity';
import { JwtPayload } from '../../types/jwt-payload.interface';

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

  private mapToUserResponse(user: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    return dto;
  }

  public async requestMagicLink(
    dto: RequestMagicLinkDto,
  ): Promise<ResponseMagicLinkDto> {
    try {
      const token = uuidv4();
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expirySeconds =
        this.configService.get<number>('MAGIC_LINK_EXPIRY_SECONDS') ??
        magicLinkExpirySeconds;
      const expiresAt = nowSeconds + expirySeconds;

      await this.dataSource.transaction(async (manager) => {
        await manager
          .createQueryBuilder()
          .delete()
          .from(MagicLinkTokenEntity)
          .where('email = :email', { email: dto.email })
          .execute();

        await manager
          .createQueryBuilder()
          .insert()
          .into(MagicLinkTokenEntity)
          .values({ token, email: dto.email, expiresAt })
          .execute();
      });

      const backendUrl =
        this.configService.get<string>('BACKEND_URL') ?? backendUrlEnvKey;
      const link = `${backendUrl}/auth/magic-link/consume?token=${token}`;
      const from =
        this.configService.get<string>('EMAIL_FROM') ?? emailFromEnvKey;

      await this.emailService.sendMagicLink({
        to: dto.email,
        from,
        link,
        expiresInSeconds: expirySeconds,
      });

      return { success: true };
    } catch (err) {
      this.logger.error('requestMagicLink failed', (err as Error).message);
      throw new InternalServerErrorException(
        'Failed to process magic link request',
      );
    }
  }

  public async consumeMagicLink(token: string): Promise<AuthResponseDto> {
    try {
      const nowSeconds = Math.floor(Date.now() / 1000);

      const tokenEntity = await this.tokenRepo
        .createQueryBuilder('t')
        .where('t.token = :token', { token })
        .getOne();

      if (!tokenEntity) {
        throw new NotFoundException('Magic link not found or already used');
      }

      if (tokenEntity.expiresAt < nowSeconds) {
        await this.tokenRepo.delete({ id: tokenEntity.id });
        throw new UnauthorizedException('Magic link expired');
      }

      const user = await this.dataSource.transaction(async (manager) => {
        let userFound = await manager.findOne(UserEntity, {
          where: { email: tokenEntity.email },
        });

        if (!userFound) {
          userFound = manager.create(UserEntity, {
            email: tokenEntity.email,
            provider: 'magic_link',
          });
          try {
            await manager.save(UserEntity, userFound);
          } catch (saveErr) {
            this.logger.error('User save error', (saveErr as Error).message);
            throw new ConflictException('User creation conflict');
          }
        }
        await manager.delete(MagicLinkTokenEntity, { id: tokenEntity.id });

        return userFound;
      });

      const tokens = await this.generateTokens(user);

      await this.userRepo.update(user.id, {
        refreshToken: tokens.refreshToken,
      });

      const expiresIn =
        this.configService.get<number>('JWT_EXPIRES_IN_SECONDS') ??
        jwtExpiresDefaultSeconds;

      const response: AuthResponseDto = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn,
        user: this.mapToUserResponse(user),
      };

      return response;
    } catch (err) {
      this.logger.error('consumeMagicLink failed', (err as Error).message);
      throw err;
    }
  }

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
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN_SECONDS'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN_SECONDS',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
