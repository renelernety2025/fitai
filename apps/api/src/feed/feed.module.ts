import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedProcessor } from './feed.processor';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
  imports: [HashtagsModule],
  controllers: [FeedController],
  providers: [FeedService, FeedProcessor],
  exports: [FeedService],
})
export class FeedModule {}
