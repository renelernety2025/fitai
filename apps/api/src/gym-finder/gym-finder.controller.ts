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
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const parsedRadius = radius != null ? Number(radius) : 10;
    if (
      !Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90 ||
      !Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180 ||
      !Number.isFinite(parsedRadius) || parsedRadius <= 0 || parsedRadius > 500
    ) {
      return { error: 'Invalid lat/lng/radius', results: [] };
    }
    return this.service.getNearby(parsedLat, parsedLng, parsedRadius);
  }
}
