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
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { ReviewExperienceDto } from './dto/review-experience.dto';

@Controller('experiences')
@UseGuards(JwtAuthGuard)
export class ExperiencesController {
  constructor(private service: ExperiencesService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    return this.service.list({
      category,
      difficulty,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      date,
      search,
    });
  }

  @Get('my-bookings')
  myBookings(@Request() req: any) {
    return this.service.myBookings(req.user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateExperienceDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Post(':id/book')
  book(@Request() req: any, @Param('id') id: string) {
    return this.service.book(req.user.id, id);
  }

  @Post('bookings/:id/cancel')
  cancelBooking(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.service.cancelBooking(req.user.id, id);
  }

  @Post('bookings/:id/checkin')
  checkin(@Request() req: any, @Param('id') id: string) {
    return this.service.checkin(req.user.id, id);
  }

  @Post('bookings/:id/review')
  review(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewExperienceDto,
  ) {
    return this.service.review(
      req.user.id,
      id,
      dto.rating,
      dto.reviewText,
    );
  }
}
