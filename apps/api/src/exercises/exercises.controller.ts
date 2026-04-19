import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';

@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get()
  findAll(
    @Query('muscleGroup') muscleGroup?: MuscleGroup,
    @Query('difficulty') difficulty?: VideoDifficulty,
  ) {
    return this.exercisesService.findAll({ muscleGroup, difficulty });
  }

  @Get('micro-workout')
  getMicroWorkout() {
    return this.exercisesService.getMicroWorkout();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: any) {
    return this.exercisesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.exercisesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.exercisesService.delete(id);
  }
}
