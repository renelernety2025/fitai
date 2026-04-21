import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { RateListingDto } from './dto/rate-listing.dto';

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private service: MarketplaceService) {}

  @Get()
  browse(
    @Query('type') type?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ) {
    return this.service.browse({ type, sort, search });
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.service.getDetail(id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateListingDto) {
    return this.service.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Post(':id/purchase')
  purchase(@Request() req: any, @Param('id') id: string) {
    return this.service.purchase(req.user.id, id);
  }

  @Post(':id/rate')
  rate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RateListingDto,
  ) {
    return this.service.rate(req.user.id, id, dto.rating);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.softDelete(req.user.id, id);
  }
}
