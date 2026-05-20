import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET environment variable is required');
        return secret;
      })(),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Reject banned users — they may have a valid JWT but no longer have access.
    // Single indexed primary-key lookup, runs on every authenticated request.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, bannedAt: true },
    });
    if (!user) throw new ForbiddenException('Account not found');
    if (user.bannedAt) throw new ForbiddenException('Account suspended');
    return { id: payload.sub, email: payload.email };
  }
}
