import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { S3Service } from './s3.service';
import { MediaConvertService } from './mediaconvert.service';
import { SnsVerificationService } from './sns-verification.service';
import { PreprocessingModule } from '../preprocessing/preprocessing.module';

@Module({
  imports: [PreprocessingModule],
  controllers: [VideosController],
  providers: [VideosService, S3Service, MediaConvertService, SnsVerificationService],
  exports: [VideosService],
})
export class VideosModule {}
