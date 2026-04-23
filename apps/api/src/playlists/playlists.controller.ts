import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Controller('playlists')
@UseGuards(JwtAuthGuard)
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get()
  getAll(
    @Request() req: any,
    @Query('exerciseId') exerciseId?: string,
    @Query('workoutType') workoutType?: string,
  ) {
    return this.playlistsService.getAll(
      req.user.id,
      exerciseId,
      workoutType,
    );
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.playlistsService.remove(req.user.id, id);
  }
}
