import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';

@Controller('promo')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(
    private promoService: PromoService,
    private prisma: PrismaService,
  ) {}

  @Get('for-feed')
  async getForFeed(@Request() req) {
    return this.promoService.getForFeed(req.user.id);
  }

  @Post(':id/dismiss')
  async dismiss(@Param('id') id: string, @Request() req) {
    return this.promoService.dismiss(req.user.id, id);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreatePromoDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isAdmin) throw new ForbiddenException();
    return this.promoService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: CreatePromoDto) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isAdmin) throw new ForbiddenException();
    return this.promoService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isAdmin) throw new ForbiddenException();
    return this.promoService.remove(id);
  }
}
