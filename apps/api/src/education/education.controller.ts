import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EducationService } from './education.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('education')
export class EducationController {
  constructor(private educationService: EducationService) {}

  @Get('lessons')
  getAllLessons(@Query('category') category?: string) {
    return this.educationService.getAllLessons(category);
  }

  @Get('lessons/of-the-week')
  getLessonOfTheWeek() {
    return this.educationService.getLessonOfTheWeek();
  }

  @Get('lessons/:slug')
  getLesson(@Param('slug') slug: string) {
    return this.educationService.getLessonBySlug(slug);
  }

  @Get('glossary')
  getGlossary(@Query('q') query?: string) {
    return this.educationService.getGlossary(query);
  }

  @Get('briefing/:gymSessionId')
  @UseGuards(JwtAuthGuard)
  getBriefing(@Request() req: any, @Param('gymSessionId') id: string) {
    return this.educationService.getPreWorkoutBriefing(req.user.id, id);
  }

  @Get('debrief/:gymSessionId')
  @UseGuards(JwtAuthGuard)
  getDebrief(@Request() req: any, @Param('gymSessionId') id: string) {
    return this.educationService.getPostWorkoutDebrief(req.user.id, id);
  }
}
