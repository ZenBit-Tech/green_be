import { Injectable } from '@nestjs/common';
import { User } from '../user.entity';

/**
 * Temporary in-memory repository for testing JWT authentication
 * without database connection.
 *
 * TODO: Replace with real TypeORM repository when database is configured
 */
@Injectable()
export class UserMockRepository {
  private users: User[] = [];

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  /**
   * Find user by provider and providerId
   */
  findByProvider(provider: string, providerId: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.provider === provider && u.providerId === providerId,
    );
    return Promise.resolve(user || null);
  }

  /**
   * Create new user
   */
  create(userData: Partial<User>): Promise<User> {
    const user = new User();
    user.id = this.generateId(); // ✅ Генерируем UUID
    user.email = userData.email || '';
    user.provider = userData.provider || null;
    user.providerId = userData.providerId || null;
    user.refreshToken = userData.refreshToken || null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    this.users.push(user);
    return Promise.resolve(user);
  }

  /**
   * Update user
   */
  update(id: string, userData: Partial<User>): Promise<User> {
    // ✅ string
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };

    return Promise.resolve(this.users[userIndex]);
  }

  /**
   * Find user by id
   */
  findById(id: string): Promise<User | null> {
    // ✅ string
    const user = this.users.find((u) => u.id === id);
    return Promise.resolve(user || null);
  }

  /**
   * Clear all users (for testing)
   */
  clear(): Promise<void> {
    this.users = [];
    return Promise.resolve();
  }

  /**
   * Get all users (for testing)
   */
  findAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  /**
   * Generate UUID for user ID
   * @private
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
