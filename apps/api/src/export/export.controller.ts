import { Controller, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { ExportWorkoutsDto } from './dto/export-workouts.dto';
import { ExportJournalDto } from './dto/export-journal.dto';
import { ExportNutritionDto } from './dto/export-nutrition.dto';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('workouts')
  async exportWorkouts(
    @Request() req: any,
    @Query() dto: ExportWorkoutsDto,
    @Res() res: Response,
  ) {
    if (dto.format === 'pdf') {
      const html = await this.exportService.exportWorkoutsHTML(
        req.user.id,
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
      return;
    }

    const csv = await this.exportService.exportWorkoutsCSV(req.user.id);
    const filename = `fitai-workouts-${formatDate(new Date())}.csv`;
    sendCSV(res, csv, filename);
  }

  @Get('journal')
  async exportJournal(
    @Request() req: any,
    @Query() dto: ExportJournalDto,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportJournalCSV(
      req.user.id,
      dto.month,
    );
    const filename = `fitai-journal-${dto.month}.csv`;
    sendCSV(res, csv, filename);
  }

  @Get('nutrition')
  async exportNutrition(
    @Request() req: any,
    @Query() dto: ExportNutritionDto,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportNutritionCSV(
      req.user.id,
      dto.from,
      dto.to,
    );
    const filename = `fitai-nutrition-${dto.from}_${dto.to}.csv`;
    sendCSV(res, csv, filename);
  }
}

/** Send CSV response with UTF-8 BOM for Excel compatibility. */
function sendCSV(res: Response, csv: string, filename: string): void {
  const BOM = '\uFEFF';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(BOM + csv);
}

/** Format date as YYYY-MM-DD. */
function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
