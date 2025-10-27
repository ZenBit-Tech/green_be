import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { AuthService } from './auth.service';
import { OAuthProfile } from '@app-types/oauth-profile.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ResponseMagicLinkDto } from './dto/response-magic-link.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { LinkedInOAuthGuard } from './guards/linkedin-oauth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== Magic Link ====================

  @Public()
  @Post('magic-link/request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a magic link' })
  @ApiOkResponse({
    description: 'Magic link was successfully sent',
    type: ResponseMagicLinkDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  public async requestMagicLink(
    @Body() dto: RequestMagicLinkDto,
  ): Promise<ResponseMagicLinkDto> {
    await this.authService.requestMagicLink(dto.email);
    return { success: true };
  }

  @Public()
  @Get('magic-link/consume')
  @ApiOperation({ summary: 'Consume magic link token and get JWT' })
  @ApiOkResponse({
    description: 'Auth response (token + user)',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  public async consumeMagicLink(
    @Query('token') token: string,
  ): Promise<AuthResponseDto> {
    return this.authService.consumeMagicLink(token);
  }

  // ==================== Google OAuth ====================

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to Google authorization page',
  })
  public async googleAuth(): Promise<void> {
    // Guard automatically redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to frontend with tokens',
  })
  public async googleAuthCallback(
    @CurrentUser() profile: OAuthProfile,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.handleOAuthLogin(profile);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${authResponse.accessToken}&refresh_token=${authResponse.refreshToken}`;

    res.redirect(redirectUrl);
  }

  // ==================== LinkedIn OAuth ====================

  @Public()
  @Get('linkedin')
  @UseGuards(LinkedInOAuthGuard)
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth flow' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to LinkedIn authorization page',
  })
  public async linkedinAuth(): Promise<void> {
    // Guard automatically redirects to LinkedIn
  }

  @Public()
  @Get('linkedin/callback')
  @UseGuards(LinkedInOAuthGuard)
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to frontend with tokens',
  })
  public async linkedinAuthCallback(
    @CurrentUser() profile: OAuthProfile,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.handleOAuthLogin(profile);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${authResponse.accessToken}&refresh_token=${authResponse.refreshToken}`;

    res.redirect(redirectUrl);
  }

  // ==================== Token Management ====================

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
}
