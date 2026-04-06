import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('vapid-public-key')
  getVapidKey() {
    return this.notificationService.getVapidPublicKey();
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(@Request() req: any, @Body() dto: any) {
    return this.notificationService.subscribe(req.user.id, dto);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@Request() req: any) {
    return this.notificationService.getPreferences(req.user.id);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(@Request() req: any, @Body() dto: any) {
    return this.notificationService.updatePreferences(req.user.id, dto);
  }

  @Post('send-streak-reminders')
  @UseGuards(JwtAuthGuard)
  sendStreakReminders() {
    return this.notificationService.sendStreakReminders();
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testNotification(@Request() req: any) {
    return this.notificationService.sendToUser(req.user.id, {
      title: 'FitAI Test',
      body: 'Push notifikace fungují! 💪',
      url: '/dashboard',
    });
  }
}
