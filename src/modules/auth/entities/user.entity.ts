import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public email: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  @Exclude()
  public refreshToken?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  // ========================================
  // OAuth fields (added for OAuth authentication)
  // ========================================

  @Column({ nullable: true })
  public provider?: string;

  @Column({ nullable: true, name: 'provider_id' })
  public providerId?: string;

  @Column({ nullable: true, name: 'first_name' })
  public firstName?: string;

  @Column({ nullable: true, name: 'last_name' })
  public lastName?: string;

  @Column({ nullable: true })
  public picture?: string;
}
