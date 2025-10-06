import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
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
 * Handles user registration, login, logout, token refresh, and profile retrieval
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param loginDto - User credentials (username and password)
   * @returns Authentication response with JWT tokens
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
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
   * Login existing user
   * @param loginDto - User credentials (username and password)
   * @returns Authentication response with JWT tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
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
   * @param refreshTokenDto - Current refresh token
   * @returns New access and refresh tokens
   */
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
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
   * @param user - Current authenticated user from JWT
   * @returns Success message
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
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

  /**
   * Get current user profile
   * @param user - Current authenticated user from JWT
   * @returns User profile data
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  public async getProfile(
    @CurrentUser() user: UserEntity,
  ): Promise<UserResponseDto> {
    return await this.authService.getProfile(user.id);
  }

  /**
   * Get all users (demo endpoint)
   * Public endpoint for testing purposes
   * @returns List of all users
   */
  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all users (demo endpoint)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  public async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.authService.getAllUsers();
  }
}
