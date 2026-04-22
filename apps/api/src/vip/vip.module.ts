import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VipController } from './vip.controller';
import { VipService } from './vip.service';

@Module({
  imports: [PrismaModule],
  controllers: [VipController],
  providers: [VipService],
  exports: [VipService],
})
export class VipModule {}
