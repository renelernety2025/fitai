import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrainersService } from './trainers.service';
import { ApplyTrainerDto } from './dto/apply-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Controller('trainers')
@UseGuards(JwtAuthGuard)
export class TrainersController {
  constructor(private service: TrainersService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
  ) {
    return this.service.list(search, specialization);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.service.getReviews(id);
  }

  @Post('apply')
  apply(@Request() req: any, @Body() dto: ApplyTrainerDto) {
    return this.service.apply(req.user.id, dto);
  }

  @Patch('profile')
  updateProfile(
    @Request() req: any,
    @Body() dto: UpdateTrainerDto,
  ) {
    return this.service.updateProfile(req.user.id, dto);
  }
}
