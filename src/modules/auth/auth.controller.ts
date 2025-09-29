import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: LoginDto) {
    return this.authService.register(dto);
  }

  @Get('all')
  async findAll() {
    return this.authService.findAll();
  }
}
