import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  public async register(dto: LoginDto): Promise<UserEntity> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  public async findAll(): Promise<UserEntity[]> {
    return this.userRepo.createQueryBuilder('u').getMany();
  }
}
