import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ResponseMagicLinkDto } from './dto/response-magic-link.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

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
    await this.authService.requestMagicLink(dto);
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
    console.log('Logging out user:', user);
    return await this.authService.logout(user.id);
  }
}
