import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
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
  async create(@Request() req: any, @Body() dto: CreateBundleDto) {
    const user = await this.service.getUser(req.user.id);
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create bundles');
    }
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/purchase')
  purchase(@Request() req: any, @Param('id') id: string) {
    return this.service.purchase(req.user.id, id);
  }
}
