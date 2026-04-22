import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.recordsService.getAll(req.user.id);
  }

  @Get(':exerciseId')
  getForExercise(
    @Request() req: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.recordsService.getForExercise(req.user.id, exerciseId);
  }

  @Get('sectors/:exerciseSetId')
  getSectorTimes(
    @Request() req: any,
    @Param('exerciseSetId') exerciseSetId: string,
  ) {
    return this.recordsService.getSectorTimes(
      req.user.id,
      exerciseSetId,
    );
  }
}
