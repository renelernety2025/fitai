import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private service: WishlistService) {}

  @Get()
  list(@Request() req: any) {
    return this.service.list(req.user.id);
  }

  @Post()
  add(@Request() req: any, @Body() dto: AddWishlistItemDto) {
    return this.service.add(req.user.id, dto.itemType, dto.itemId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Get('count/:itemType/:itemId')
  count(
    @Param('itemType') itemType: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.count(itemType, itemId);
  }
}
