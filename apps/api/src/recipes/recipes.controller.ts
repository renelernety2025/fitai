import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private service: RecipesService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.service.getAll(req.user.id);
  }

  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.service.getOne(req.user.id, id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateRecipeDto) {
    return this.service.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post(':id/favorite')
  toggleFavorite(@Request() req: any, @Param('id') id: string) {
    return this.service.toggleFavorite(req.user.id, id);
  }

  @Post(':id/photo-url')
  getPhotoUploadUrl(@Request() req: any, @Param('id') id: string) {
    return this.service.getPhotoUploadUrl(req.user.id, id);
  }

  /** Generate recipe estimate from food photo via Claude Vision */
  @Post('from-photo')
  @Throttle({ default: { limit: 10, ttl: seconds(86400) } })
  generateFromPhoto(
    @Request() req: any,
    @Body() body: { s3Key: string },
  ) {
    return this.service.generateFromPhoto(req.user.id, body.s3Key);
  }
}
