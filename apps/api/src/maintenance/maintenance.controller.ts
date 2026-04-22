import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get()
  getStatus(@Request() req: any) {
    return this.maintenanceService.getStatus(req.user.id);
  }

  @Get('alerts')
  getAlerts(@Request() req: any) {
    return this.maintenanceService.getAlerts(req.user.id);
  }

  @Get('mileage')
  getMileage(@Request() req: any) {
    return this.maintenanceService.getMileage(req.user.id);
  }

  @Post(':muscleGroup/deload')
  markDeload(
    @Request() req: any,
    @Param('muscleGroup') muscleGroup: string,
  ) {
    return this.maintenanceService.markDeload(req.user.id, muscleGroup);
  }

  @Post('alerts/:id/dismiss')
  dismissAlert(@Request() req: any, @Param('id') id: string) {
    return this.maintenanceService.dismissAlert(req.user.id, id);
  }
}
