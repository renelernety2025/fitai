import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from '../progress/progress.service';

@Controller('users')
export class UsersController {
  constructor(private progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/reminder-status')
  getReminderStatus(@Request() req: any) {
    return this.progressService.getReminderStatus(req.user.id);
  }
}
