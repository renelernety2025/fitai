import {
  Controller,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getAnalytics();
  }
}
