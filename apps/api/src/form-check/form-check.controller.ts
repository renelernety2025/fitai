import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FormCheckService } from './form-check.service';
import { AnalyzeFormDto } from './dto/analyze-form.dto';
import { UploadFormVideoDto } from './dto/upload-form-video.dto';

@Controller('form-check')
@UseGuards(JwtAuthGuard)
export class FormCheckController {
  constructor(private service: FormCheckService) {}

  @Post('upload-url')
  uploadUrl(
    @Request() req: any,
    @Body() dto: UploadFormVideoDto,
  ) {
    return this.service.getUploadUrl(
      req.user.id,
      dto.fileName,
      dto.contentType,
    );
  }

  @Post('analyze')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  analyze(@Request() req: any, @Body() dto: AnalyzeFormDto) {
    return this.service.analyze(
      req.user.id,
      dto.s3Key,
      dto.exerciseId,
    );
  }

  @Get('history')
  history(@Request() req: any) {
    return this.service.getHistory(req.user.id);
  }
}
