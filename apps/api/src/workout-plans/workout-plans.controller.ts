import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('workout-plans')
@UseGuards(JwtAuthGuard)
export class WorkoutPlansController {
  constructor(private plansService: WorkoutPlansService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.plansService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.plansService.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, req.user.id, dto);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @Request() req: any) {
    return this.plansService.clone(id, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.plansService.delete(id, req.user.id);
  }
}
