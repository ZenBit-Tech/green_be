import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user.entity';

/**
 * Decorator to get current authenticated user from request
 * Used in protected routes to access user data
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
