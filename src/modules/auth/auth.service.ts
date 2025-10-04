import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async register(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { username: dto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepo.create({
        username: dto.username,
        password: hashedPassword,
      });

      await this.userRepo.save(user);

      const tokens = await this.generateTokens(user.id, user.username);

      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        user: UserResponseDto.fromEntity(user),
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Register failed', (error as Error).message);
      throw error;
    }
  }

  public async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.username);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: UserResponseDto.fromEntity(user),
      ...tokens,
    };
  }

  public async refreshTokensWithValidation(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET');

      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
      }

      // Explicitly specify the return type
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        { secret },
      );

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // TODO: Add hash comparison to production
      // const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      // if (!isValid) throw new UnauthorizedException('Token mismatch');

      const tokens = await this.generateTokens(user.id, user.username);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      this.logger.error('Refresh token failed', (error as Error).message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  public async logout(userId: string): Promise<{ message: string }> {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  public async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.username'])
      .getMany();

    return users.map((user) => UserResponseDto.fromEntity(user));
  }

  private async generateTokens(
    userId: string,
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: userId, username };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    const jwtRefreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtRefreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // TODO: In production, hash the refresh token before saving it.
    // const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, { refreshToken });
  }
}
