import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GymFinderService } from './gym-finder.service';
import { CreateGymReviewDto } from './dto/create-gym-review.dto';

@Controller('gym-finder')
@UseGuards(JwtAuthGuard)
export class GymFinderController {
  constructor(private service: GymFinderService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateGymReviewDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('nearby')
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.service.getNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius || '10'),
    );
  }
}
