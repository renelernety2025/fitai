import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from '../progress/progress.service';
import { UsersService } from './users.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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
  @Throttle({ default: { limit: 5, ttl: seconds(3600) } })
  @Put('me/password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: seconds(3600) } })
  @Delete('me')
  deleteAccount(@Request() req: any) {
    return this.usersService.deleteAccount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('titles')
  getTitles(@Request() req: any) {
    return this.usersService.getTitles(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('titles/:id/activate')
  activateTitle(@Request() req: any, @Param('id') id: string) {
    return this.usersService.activateTitle(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('brand')
  getBrand(@Request() req: any) {
    return this.usersService.getBrand(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('brand')
  updateBrand(@Request() req: any, @Body() dto: UpdateBrandDto) {
    return this.usersService.updateBrand(req.user.id, dto);
  }
}
