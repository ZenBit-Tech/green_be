import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from './user.entity';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

/**
 * Authentication controller
 * Provides JWT token management endpoints for all authentication methods
 *
 * Current endpoints:
 * - register/login: TEMPORARY - for testing JWT infrastructure
 * - refresh: Used by ALL auth methods (OAuth, Magic Link)
 * - logout: Used by ALL auth methods
 *
 * Future OAuth endpoints (Sprint 2):
 * - GET /auth/google - Initiate Google OAuth
 * - GET /auth/google/callback - Google OAuth callback
 * - GET /auth/facebook - Initiate Facebook OAuth
 * - GET /auth/facebook/callback - Facebook OAuth callback
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user (TEMPORARY - for JWT infrastructure testing)
   * TODO: Remove in production - users authenticate via OAuth/Magic Link
   * @param loginDto - User credentials (username and password)
   * @returns Authentication response with JWT tokens
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user (TEMPORARY - for testing)',
    description:
      'This endpoint is temporary and used only for testing JWT infrastructure. In production, users will authenticate via OAuth (Google, Facebook) or Magic Link.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username already exists',
  })
  public async register(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.register(loginDto);
  }

  /**
   * Login existing user (TEMPORARY - for JWT infrastructure testing)
   * TODO: Remove in production - users authenticate via OAuth/Magic Link
   * @param loginDto - User credentials (username and password)
   * @returns Authentication response with JWT tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user (TEMPORARY - for testing)',
    description:
      'This endpoint is temporary and used only for testing JWT infrastructure. In production, users will authenticate via OAuth (Google, Facebook) or Magic Link.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  public async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  /**
   * Refresh access and refresh tokens
   * Used by ALL authentication methods (OAuth, Magic Link, etc.)
   * @param refreshTokenDto - Current refresh token
   * @returns New access and refresh tokens
   */
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates new access and refresh tokens. Works for all authentication methods.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens successfully refreshed',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  public async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refresh(refreshTokenDto.refreshToken);
  }

  /**
   * Logout current user
   * Removes refresh token from database
   * Used by ALL authentication methods
   * @param user - Current authenticated user from JWT
   * @returns Success message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logs out user by removing refresh token. Works for all authentication methods.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
    schema: {
      properties: {
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  public async logout(
    @CurrentUser() user: UserEntity,
  ): Promise<{ message: string }> {
    return await this.authService.logout(user.id);
  }

  // Future OAuth endpoints (Sprint 2):

  /**
   * Initiate Google OAuth flow
   * TODO: Implement in Sprint 2
   */
  // @Public()
  // @Get('google')
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuth() {}

  /**
   * Google OAuth callback
   * TODO: Implement in Sprint 2
   */
  // @Public()
  // @Get('google/callback')
  // @UseGuards(GoogleOAuthGuard)
  // async googleAuthCallback(@Req() req) {
  //   return this.authService.generateTokens(req.user);
  // }
}
