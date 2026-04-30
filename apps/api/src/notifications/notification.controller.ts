import { Controller, Get, Post, Put, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
  ) {}

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
  async sendStreakReminders(@Request() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.isAdmin) throw new ForbiddenException();
    return this.notificationService.sendStreakReminders();
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testNotification(@Request() req: any) {
    const web = await this.notificationService.sendToUser(req.user.id, {
      title: 'FitAI Test',
      body: 'Push notifikace fungují! 💪',
      url: '/dashboard',
    });
    const expo = await this.notificationService.sendExpoToUser(req.user.id, {
      title: 'FitAI Test',
      body: 'Push notifikace fungují! 💪',
    });
    return { web, expo };
  }

  @Post('expo-subscribe')
  @UseGuards(JwtAuthGuard)
  registerExpo(@Request() req: any, @Body() body: { token: string }) {
    return this.notificationService.registerExpoPushToken(req.user.id, body.token);
  }
}
