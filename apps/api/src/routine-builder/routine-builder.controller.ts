import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoutineBuilderService } from './routine-builder.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AddRoutineItemDto } from './dto/add-routine-item.dto';
import { UpdateRoutineItemDto } from './dto/update-routine-item.dto';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutineBuilderController {
  constructor(private service: RoutineBuilderService) {}

  @Get('mine')
  listMine(@Request() req: any) {
    return this.service.listMine(req.user.id);
  }

  @Get('public')
  listPublic() {
    return this.service.listPublic();
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateRoutineDto) {
    return this.service.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.id, id);
  }

  @Post(':id/items')
  addItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddRoutineItemDto,
  ) {
    return this.service.addItem(req.user.id, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Request() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateRoutineItemDto,
  ) {
    return this.service.updateItem(req.user.id, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Request() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.service.removeItem(req.user.id, id, itemId);
  }
}
