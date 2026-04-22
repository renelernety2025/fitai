import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DropsService } from './drops.service';

@Controller('drops')
@UseGuards(JwtAuthGuard)
export class DropsController {
  constructor(private service: DropsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get('my-purchases')
  myPurchases(@Request() req: any) {
    return this.service.myPurchases(req.user.id);
  }

  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.service.getOne(req.user.id, id);
  }

  @Post(':id/purchase')
  purchase(@Request() req: any, @Param('id') id: string) {
    return this.service.purchase(req.user.id, id);
  }
}
