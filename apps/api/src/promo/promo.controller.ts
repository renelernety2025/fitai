import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';

@Controller('promo')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private promoService: PromoService) {}

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
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: CreatePromoDto) {
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.remove(id);
  }
}
