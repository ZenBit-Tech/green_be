import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'magic_link_tokens' })
export class MagicLinkTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public token: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'bigint' })
  public expiresAt: number;

  @CreateDateColumn()
  public createdAt: Date;
}
