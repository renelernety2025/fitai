import {
  Controller,
  Get,
  Post,
  Body,
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
}
