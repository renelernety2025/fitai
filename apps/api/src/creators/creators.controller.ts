import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApplyCreatorDto } from './dto/apply-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Controller('creators')
@UseGuards(JwtAuthGuard)
export class CreatorsController {
  constructor(private service: CreatorsService) {}

  @Get()
  list() {
    return this.service.listApproved();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  @Post('apply')
  apply(@Request() req: any, @Body() dto: ApplyCreatorDto) {
    return this.service.apply(req.user.id, dto);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateCreatorDto) {
    return this.service.updateProfile(req.user.id, dto);
  }
}
