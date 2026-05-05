import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';

const AUTHORIZE_URL = 'https://cloud.ouraring.com/oauth/authorize';
const TOKEN_URL = 'https://api.ouraring.com/oauth/token';
const SCOPES = ['daily', 'heartrate', 'session', 'sleep', 'workout'];
const STATE_TTL = '2m';
const STATE_AUDIENCE = 'oauth-state';
const STATE_ISSUER = 'fitai-oauth';

interface OuraTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

@Injectable()
export class OuraOAuthService {
  private readonly logger = new Logger(OuraOAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  generateAuthUrl(userId: string): { url: string; state: string } {
    const clientId = this.requireEnv('OURA_CLIENT_ID');
    const redirectUri = this.requireEnv('OURA_REDIRECT_URI');
    const state = this.jwtService.sign(
      { userId, provider: 'oura' },
      { expiresIn: STATE_TTL, audience: STATE_AUDIENCE, issuer: STATE_ISSUER },
    );
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: SCOPES.join(' '),
      state,
    });
    return { url: `${AUTHORIZE_URL}?${params.toString()}`, state };
  }

  async exchangeCode(code: string, state: string): Promise<{ userId: string }> {
    const decoded = this.verifyState(state);
    const tokens = await this.requestTokens({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.requireEnv('OURA_REDIRECT_URI'),
    });
    await this.upsertConnection(decoded.userId, tokens);
    return { userId: decoded.userId };
  }

  async refreshIfNeeded(connectionId: string): Promise<void> {
    const conn = await this.prisma.wearableConnection.findUnique({ where: { id: connectionId } });
    if (!conn || !conn.refreshToken) return;
    const buffer = 5 * 60 * 1000;
    if (conn.expiresAt && conn.expiresAt.getTime() - buffer > Date.now()) return;

    const tokens = await this.requestTokens({
      grant_type: 'refresh_token',
      refresh_token: conn.refreshToken,
    });
    await this.prisma.wearableConnection.update({
      where: { id: connectionId },
      data: this.toUpdateData(tokens),
    });
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.wearableConnection.deleteMany({ where: { userId, provider: 'oura' } });
  }

  private verifyState(state: string): { userId: string; provider: string } {
    try {
      const payload = this.jwtService.verify<{ userId: string; provider: string }>(state, {
        audience: STATE_AUDIENCE,
        issuer: STATE_ISSUER,
      });
      if (payload.provider !== 'oura') throw new Error('provider mismatch');
      return payload;
    } catch (err) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }
  }

  private async requestTokens(body: Record<string, string>): Promise<OuraTokenResponse> {
    const clientId = this.requireEnv('OURA_CLIENT_ID');
    const clientSecret = this.requireEnv('OURA_CLIENT_SECRET');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.warn(`Oura token request failed: ${res.status} ${text.slice(0, 200)}`);
      throw new InternalServerErrorException('Oura token exchange failed');
    }
    return (await res.json()) as OuraTokenResponse;
  }

  private toUpdateData(tokens: OuraTokenResponse) {
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scopes: tokens.scope ? tokens.scope.split(' ') : SCOPES,
    };
  }

  private async upsertConnection(userId: string, tokens: OuraTokenResponse): Promise<void> {
    const data = this.toUpdateData(tokens);
    await this.prisma.wearableConnection.upsert({
      where: { userId_provider: { userId, provider: 'oura' } },
      create: { userId, provider: 'oura', ...data, refreshToken: data.refreshToken ?? null },
      update: data,
    });
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new InternalServerErrorException(`${name} not configured`);
    return value;
  }
}
