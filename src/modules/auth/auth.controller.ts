import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';

/**
 * Authentication controller
 * Provides endpoints for JWT token management
 *
 * NOTE: Login/Register endpoints will be added by:
 * - OAuth team (Google, Facebook, LinkedIn) - Sprint 2
 * - Magic Link team (Den) - Sprint 1
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Refresh JWT tokens
   * Public endpoint - no auth required
   */
  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * Logout current user
   * Requires valid JWT access token
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.logout(user.id);
  }

  // ========================================
  // FUTURE ENDPOINTS (Sprint 2+)
  // ========================================

  /**
   * Google OAuth callback
   * TODO: Implement in Sprint 2
   */
  // @Public()
  // @Get('google')
  // async googleAuth() {
  //   // OAuth redirect
  // }

  /**
   * Facebook OAuth callback
   * TODO: Implement in Sprint 2
   */
  // @Public()
  // @Get('facebook')
  // async facebookAuth() {
  //   // OAuth redirect
  // }

  /**
   * Magic Link login
   * TODO: Coordinate with Den's team
   */
  // @Public()
  // @Post('magic-link')
  // async magicLink(@Body() dto: MagicLinkDto) {
  //   // Send magic link email
  // }
}
