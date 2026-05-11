import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BloodworkService } from './bloodwork.service';
import { CreateBloodworkDto } from './dto/create-bloodwork.dto';

@Controller('bloodwork')
@UseGuards(JwtAuthGuard)
export class BloodworkController {
  constructor(private service: BloodworkService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.service.getAll(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateBloodworkDto) {
    return this.service.create(req.user.id, dto);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.service.delete(req.user.id, id);
  }

  @Get('analysis')
  @Throttle({ default: { limit: 3, ttl: seconds(60) } })
  getAnalysis(@Request() req: any) {
    return this.service.getAnalysis(req.user.id);
  }
}
