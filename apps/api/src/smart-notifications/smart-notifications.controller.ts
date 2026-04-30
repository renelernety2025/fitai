import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SmartNotificationsService } from './smart-notifications.service';
import { SavePreferencesDto } from './dto/save-preferences.dto';

@Controller('smart-notifications')
export class SmartNotificationsController {
  constructor(private service: SmartNotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('upcoming')
  async getUpcoming(@Request() req: any) {
    return this.service.getUpcoming(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async savePreferences(
    @Request() req: any,
    @Body() dto: SavePreferencesDto,
  ) {
    return this.service.savePreferences(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('social')
  async getSocial(@Request() req: any, @Query('cursor') cursor?: string) {
    return this.service.getSocialNotifications(req.user.id, cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.service.getUnreadCount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.service.markAsRead(id, req.user.id);
  }
}
