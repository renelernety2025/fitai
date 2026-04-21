import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import {
  CalendarMonthDto,
  CompleteWorkoutDto,
  CreateScheduledWorkoutDto,
  UpdateScheduledWorkoutDto,
} from './dto/calendar.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private service: CalendarService) {}

  @Get()
  getMonth(@Request() req: any, @Query() query: CalendarMonthDto) {
    return this.service.getMonth(req.user.id, query.month);
  }

  @Post()
  create(
    @Request() req: any,
    @Body() dto: CreateScheduledWorkoutDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateScheduledWorkoutDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post(':id/complete')
  complete(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CompleteWorkoutDto,
  ) {
    return this.service.complete(req.user.id, id, dto.gymSessionId);
  }
}
