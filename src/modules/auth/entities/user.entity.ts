import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ROLES } from '@common/constants/app.constants';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Index({ unique: true })
  @Column()
  public email: string;

  @Column({ default: ROLES.USER })
  public role: string;

  @Column({ nullable: true })
  public provider?: string;
}
