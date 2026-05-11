import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RehabService } from './rehab.service';
import { CreateRehabDto } from './dto/create-rehab.dto';
import { UpdateRehabDto } from './dto/update-rehab.dto';
import { LogRehabSessionDto } from './dto/log-rehab-session.dto';

@Controller('rehab')
@UseGuards(JwtAuthGuard)
export class RehabController {
  constructor(private service: RehabService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.service.getAll(req.user.id);
  }

  @Post()
  @Throttle({ default: { limit: 3, ttl: seconds(60) } })
  create(@Request() req: any, @Body() dto: CreateRehabDto) {
    return this.service.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRehabDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Post(':id/session')
  logSession(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: LogRehabSessionDto,
  ) {
    return this.service.logSession(req.user.id, id, dto);
  }

  @Get(':id/sessions')
  getSessions(@Request() req: any, @Param('id') id: string) {
    return this.service.getSessions(req.user.id, id);
  }
}
