import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { SemanticSearchDto } from './dto/semantic-search.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  // Public catalog — 114 KB response. Cap rate so the egress isn't free.
  @Get()
  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  findAll(
    @Query('muscleGroup') muscleGroup?: MuscleGroup,
    @Query('difficulty') difficulty?: VideoDifficulty,
  ) {
    return this.exercisesService.findAll({ muscleGroup, difficulty });
  }

  @Get('micro-workout')
  @UseGuards(JwtAuthGuard)
  getMicroWorkout() {
    return this.exercisesService.getMicroWorkout();
  }

  /** Semantic exercise search — embeds query and ranks via pgvector cosine distance. */
  @Throttle({ default: { limit: 30, ttl: seconds(60) } })
  @UseGuards(JwtAuthGuard)
  @Post('search/semantic')
  searchSemantic(@Body() dto: SemanticSearchDto) {
    return this.exercisesService.searchSemantic(dto.query, dto.limit ?? 10);
  }

  @Get(':id/personal-best')
  @UseGuards(JwtAuthGuard)
  getPersonalBest(@Param('id') id: string, @Request() req: any) {
    return this.exercisesService.getPersonalBest(id, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: CreateExerciseDto) {
    return this.exercisesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.exercisesService.delete(id);
  }
}
