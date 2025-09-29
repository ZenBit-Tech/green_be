import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  public async register(dto: LoginDto): Promise<UserResponseDto> {
    try {
      const { identifiers } = await this.userRepo
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values(dto)
        .execute();

      const insertedId = identifiers?.[0]?.id as string;
      if (!insertedId) {
        throw new InternalServerErrorException('Failed to create user');
      }

      const created = await this.userRepo.findOneBy({ id: insertedId });
      if (!created) {
        throw new InternalServerErrorException('Created user not found');
      }

      return UserResponseDto.fromEntity(created);
    } catch (error) {
      this.logger.error('Register failed', (error as Error).message);
      throw error;
    }
  }

  public async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.username'])
      .getMany();

    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
