import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Загружаем .env

export default new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_DATABASE || './lab_ai_dev.sqlite',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: ['error', 'warn', 'migration'],
});
