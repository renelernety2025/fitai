import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('wearables/connections')
@UseGuards(JwtAuthGuard)
export class WearablesConnectionsController {
  constructor(private prisma: PrismaService) {}

  /** List active wearable provider OAuth connections for the user (Oura, Whoop, …). */
  @Get()
  async list(@Request() req: any) {
    const conns = await this.prisma.wearableConnection.findMany({
      where: { userId: req.user.id },
      select: { provider: true, lastSyncAt: true, expiresAt: true, scopes: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return conns;
  }
}
