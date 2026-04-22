import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BundlesService } from './bundles.service';
import { CreateBundleDto } from './dto/create-bundle.dto';

@Controller('bundles')
@UseGuards(JwtAuthGuard)
export class BundlesController {
  constructor(private service: BundlesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateBundleDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/purchase')
  purchase(@Request() req: any, @Param('id') id: string) {
    return this.service.purchase(req.user.id, id);
  }
}
