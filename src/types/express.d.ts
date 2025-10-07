import { UserEntity } from '../modules/auth/user.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserEntity;
  }
}

export {};
