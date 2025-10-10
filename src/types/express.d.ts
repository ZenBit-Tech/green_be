import { UserEntity } from '@modules/auth/entities/user.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user: UserEntity;
  }
}

export {};
