import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndTokensTables1735840000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        "email" varchar NOT NULL UNIQUE,
        "provider" varchar,
        "provider_id" varchar,
        "first_name" varchar,
        "last_name" varchar,
        "picture" varchar,
        "refresh_token" text,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create magic_link_tokens table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
        "id" varchar PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        "token" varchar NOT NULL UNIQUE,
        "user_id" varchar NOT NULL,
        "expires_at" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for users table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_provider" ON "users" ("provider")
    `);

    // Create indexes for magic_link_tokens table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_magic_link_tokens_token" ON "magic_link_tokens" ("token")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_magic_link_tokens_expires_at" ON "magic_link_tokens" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "magic_link_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
