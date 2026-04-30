import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMarketplaceItemDto } from './dto/create-marketplace-item.dto';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  // URL Import
  @Post('import')
  importUrl(@Request() req: any, @Body('sourceUrl') sourceUrl: string) {
    return this.contentService.importFromUrl(req.user.id, sourceUrl);
  }

  @Get('import/:id')
  getImportStatus(@Param('id') id: string) {
    return this.contentService.getImportStatus(id);
  }

  @Get('my-imports')
  getMyImports(@Request() req: any) {
    return this.contentService.getMyImports(req.user.id);
  }

  // Marketplace
  @Get('marketplace')
  getMarketplace(@Query('type') type?: string) {
    return this.contentService.getMarketplaceItems(type);
  }

  @Post('marketplace')
  createItem(@Request() req: any, @Body() dto: CreateMarketplaceItemDto) {
    return this.contentService.createMarketplaceItem(req.user.id, dto);
  }

  @Post('marketplace/:id/publish')
  publishItem(@Request() req: any, @Param('id') id: string) {
    return this.contentService.publishMarketplaceItem(id, req.user.id);
  }

  @Get('my-items')
  getMyItems(@Request() req: any) {
    return this.contentService.getMyMarketplaceItems(req.user.id);
  }
}
