import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoachingMemoryService } from './coaching-memory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveMemoryDto } from './dto/save-memory.dto';

@Controller('coaching-memory')
@UseGuards(JwtAuthGuard)
export class CoachingMemoryController {
  constructor(private coachingMemoryService: CoachingMemoryService) {}

  @Get()
  getAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coachingMemoryService.getAll(
      req.user.id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('search')
  search(@Request() req: any, @Query('q') query: string) {
    return this.coachingMemoryService.search(req.user.id, query || '');
  }

  @Get('progress/:exerciseId')
  getProgress(
    @Request() req: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.coachingMemoryService.getProgress(
      req.user.id,
      exerciseId,
    );
  }

  @Post()
  save(@Request() req: any, @Body() dto: SaveMemoryDto) {
    return this.coachingMemoryService.save(req.user.id, dto);
  }
}
