import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GearService } from './gear.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGearDto } from './dto/create-gear.dto';
import { UpdateGearDto } from './dto/update-gear.dto';
import { GearReviewDto } from './dto/gear-review.dto';

@Controller('gear')
@UseGuards(JwtAuthGuard)
export class GearController {
  constructor(private gearService: GearService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.gearService.getAll(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateGearDto) {
    return this.gearService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateGearDto,
  ) {
    return this.gearService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.gearService.remove(req.user.id, id);
  }

  @Post(':id/review')
  review(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: GearReviewDto,
  ) {
    return this.gearService.review(req.user.id, id, dto);
  }

  @Post(':id/increment-session')
  incrementSession(@Request() req: any, @Param('id') id: string) {
    return this.gearService.incrementSession(req.user.id, id);
  }
}
