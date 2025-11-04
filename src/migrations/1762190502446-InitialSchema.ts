import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1762190502446 implements MigrationInterface {
  name = 'InitialSchema1762190502446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`provider\` varchar(50) NOT NULL,
                \`provider_id\` varchar(255) NULL,
                \`first_name\` varchar(255) NULL,
                \`last_name\` varchar(255) NULL,
                \`picture\` varchar(255) NULL,
                \`refresh_token\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                INDEX \`IDX_6425135effde2ab8322f846493\` (\`provider_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
            CREATE TABLE \`magic_link_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`token\` varchar(255) NOT NULL,
                \`expiresAt\` bigint NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_token\` (\`token\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

    await queryRunner.query(`
            ALTER TABLE \`magic_link_tokens\`
            ADD CONSTRAINT \`FK_magic_link_tokens_user\`
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`)
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`magic_link_tokens\`
            DROP FOREIGN KEY \`FK_magic_link_tokens_user\`
        `);
    await queryRunner.query(
      `DROP INDEX \`IDX_token\` ON \`magic_link_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`magic_link_tokens\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6425135effde2ab8322f846493\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
