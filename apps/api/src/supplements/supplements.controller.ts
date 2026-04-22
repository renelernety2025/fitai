import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupplementsService } from './supplements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToStackDto } from './dto/add-to-stack.dto';
import { LogSupplementDto } from './dto/log-supplement.dto';

@Controller('supplements')
@UseGuards(JwtAuthGuard)
export class SupplementsController {
  constructor(private supplementsService: SupplementsService) {}

  @Get('catalog')
  getCatalog() {
    return this.supplementsService.getCatalog();
  }

  @Get('stack')
  getStack(@Request() req: any) {
    return this.supplementsService.getStack(req.user.id);
  }

  @Post('stack')
  addToStack(@Request() req: any, @Body() dto: AddToStackDto) {
    return this.supplementsService.addToStack(req.user.id, dto);
  }

  @Delete('stack/:id')
  deactivate(@Request() req: any, @Param('id') id: string) {
    return this.supplementsService.deactivate(req.user.id, id);
  }

  @Post('log')
  logTaken(@Request() req: any, @Body() dto: LogSupplementDto) {
    return this.supplementsService.logTaken(req.user.id, dto);
  }

  @Get('log/:date')
  getLogForDate(
    @Request() req: any,
    @Param('date') date: string,
  ) {
    return this.supplementsService.getLogForDate(req.user.id, date);
  }
}
