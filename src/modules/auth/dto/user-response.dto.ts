import { User } from '../user.entity'; // ✅ Изменили UserEntity на User

/**
 * User data returned in authentication responses
 * Does not include sensitive data like password or refresh tokens
 */
export class UserResponseDto {
  id: string;
  email: string;
  provider?: string;
  createdAt: Date;

  constructor(user: User) {
    // ✅ User вместо UserEntity
    this.id = user.id;
    this.email = user.email;
    this.provider = user.provider;
    this.createdAt = user.createdAt;
  }
}
