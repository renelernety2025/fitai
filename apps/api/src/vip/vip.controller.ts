import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VipService } from './vip.service';

@Controller('vip')
@UseGuards(JwtAuthGuard)
export class VipController {
  constructor(private service: VipService) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.service.getStatus(req.user.id);
  }

  @Post('accept')
  accept(@Request() req: any) {
    return this.service.accept(req.user.id);
  }

  @Get('check-eligibility')
  checkEligibility(@Request() req: any) {
    return this.service.checkEligibility(req.user.id);
  }

  @Get('lounge')
  getLounge(@Request() req: any) {
    return this.service.getLounge(req.user.id);
  }
}
