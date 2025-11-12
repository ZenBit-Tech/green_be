import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from '../modules/auth/entities/user.entity';
import { MagicLinkTokenEntity } from '../modules/auth/entities/magic-link-token.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: [UserEntity, MagicLinkTokenEntity],

  migrations: ['src/database/migrations/*.ts'],
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
});

export default AppDataSource;
