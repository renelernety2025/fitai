import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** Spam protection — 5 new accounts per hour per IP. */
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: seconds(3600) } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** Brute-force protection — 10 login attempts per minute per IP. */
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
