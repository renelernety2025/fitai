import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private service: CoursesService) {}

  @Get()
  list(@Query('category') category?: string) {
    return this.service.listPublished(category);
  }

  @Get('my-enrollments')
  myEnrollments(@Request() req: any) {
    return this.service.myEnrollments(req.user.id);
  }

  @Get(':id')
  getDetail(@Request() req: any, @Param('id') id: string) {
    return this.service.getDetail(id, req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateCourseDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/enroll')
  enroll(@Request() req: any, @Param('id') id: string) {
    return this.service.enroll(req.user.id, id);
  }

  @Post(':id/lessons/:lessonId/complete')
  completeLesson(
    @Request() req: any,
    @Param('id') id: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.service.completeLesson(req.user.id, id, lessonId);
  }
}
