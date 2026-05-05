import { BadRequestException, Controller, Delete, Get, Post, Query, Redirect, Request, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../prisma/prisma.service';
import { OuraOAuthService } from './oura-oauth.service';
import { OuraSyncService } from './oura-sync.service';

@Controller('wearables/oauth/oura')
export class OuraController {
  constructor(
    private oauth: OuraOAuthService,
    private sync: OuraSyncService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Get('authorize')
  authorize(@Request() req: any) {
    return this.oauth.generateAuthUrl(req.user.id);
  }

  /**
   * OAuth callback — public endpoint. CSRF protection is provided by the signed JWT
   * `state` parameter (2-minute expiry, embeds userId + provider, audience-scoped).
   */
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @Get('callback')
  @Redirect()
  async callback(@Query('code') code?: string, @Query('state') state?: string, @Query('error') error?: string) {
    const successUrl = process.env.OURA_SUCCESS_REDIRECT || 'fitai://wearables/oura/connected';
    const errorUrl = process.env.OURA_ERROR_REDIRECT || 'fitai://wearables/oura/error';
    if (error) return { url: `${errorUrl}?reason=${encodeURIComponent(error)}` };
    if (!code || !state) throw new BadRequestException('Missing code or state');
    try {
      await this.oauth.exchangeCode(code, state);
      return { url: successUrl };
    } catch {
      return { url: `${errorUrl}?reason=token_exchange_failed` };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 6, ttl: seconds(3600) } })
  @Post('sync')
  async manualSync(@Request() req: any) {
    const conn = await this.prisma.wearableConnection.findUnique({
      where: { userId_provider: { userId: req.user.id, provider: 'oura' } },
    });
    if (!conn) throw new BadRequestException('Oura is not connected');
    return this.sync.syncRecentData(conn.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async disconnect(@Request() req: any) {
    await this.oauth.disconnect(req.user.id);
    return { ok: true };
  }
}
