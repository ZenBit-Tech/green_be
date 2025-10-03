import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'magic_link_tokens' })
export class MagicLinkTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public token: string;

  @Index({ unique: true })
  @Column()
  public email: string;

  @Column({ type: 'bigint' })
  public expiresAt: number;

  @CreateDateColumn()
  public createdAt: Date;
}
