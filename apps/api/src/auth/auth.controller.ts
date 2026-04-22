import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  /** Password reset request — 3 per hour per IP. */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: seconds(3600) } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /** Password reset execution — 5 per hour per IP. */
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: seconds(3600) } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
