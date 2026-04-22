import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from './users.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private progressService: ProgressService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/reminder-status')
  getReminderStatus(@Request() req: any) {
    return this.progressService.getReminderStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/name')
  updateName(@Request() req: any, @Body() dto: UpdateNameDto) {
    return this.usersService.updateName(req.user.id, dto.name);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Request() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
