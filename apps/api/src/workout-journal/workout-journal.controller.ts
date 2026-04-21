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
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutJournalService } from './workout-journal.service';
import { UpsertJournalDto } from './dto/upsert-journal.dto';
import { PhotoUrlDto } from './dto/photo-url.dto';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class WorkoutJournalController {
  constructor(private service: WorkoutJournalService) {}

  /** List journal entries + gym sessions for a month. */
  @Get()
  getMonth(
    @Request() req: any,
    @Query('month') month: string,
  ) {
    return this.service.getMonth(req.user.id, month);
  }

  /** Upsert journal entry for a specific date. */
  @Put(':date')
  upsertEntry(
    @Request() req: any,
    @Param('date') date: string,
    @Body() dto: UpsertJournalDto,
  ) {
    return this.service.upsertEntry(req.user.id, date, dto);
  }

  /** Get presigned S3 upload URL for a journal photo. */
  @Post(':date/photo-url')
  photoUrl(
    @Request() req: any,
    @Param('date') date: string,
    @Body() dto: PhotoUrlDto,
  ) {
    return this.service.getPhotoUploadUrl(
      req.user.id,
      date,
      dto.contentType,
    );
  }

  /** Delete a journal photo (S3 + DB). */
  @Delete('photo/:id')
  deletePhoto(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.service.deletePhoto(req.user.id, id);
  }

  /** AI-generated monthly summary. Throttled: 10/day. */
  @Get('monthly-summary')
  @Throttle({ default: { limit: 10, ttl: seconds(86400) } })
  monthlySummary(
    @Request() req: any,
    @Query('month') month: string,
  ) {
    return this.service.getMonthlySummary(
      req.user.id,
      month,
    );
  }

  /** Training milestones for the user. */
  @Get('milestones')
  milestones(@Request() req: any) {
    return this.service.getMilestones(req.user.id);
  }

  /** Generate AI insight for a specific day. Throttled: 20/day. */
  @Post(':date/ai-insight')
  @Throttle({ default: { limit: 20, ttl: seconds(86400) } })
  aiInsight(
    @Request() req: any,
    @Param('date') date: string,
  ) {
    return this.service.generateAiInsight(
      req.user.id,
      date,
    );
  }
}
