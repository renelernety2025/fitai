import { Module } from '@nestjs/common';
import { WrappedController } from './wrapped.controller';
import { WrappedService } from './wrapped.service';

@Module({
  controllers: [WrappedController],
  providers: [WrappedService],
})
export class WrappedModule {}
