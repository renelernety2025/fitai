import { Module } from '@nestjs/common';
import { SmartNotificationsController } from './smart-notifications.controller';
import { SmartNotificationsService } from './smart-notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmartNotificationsController],
  providers: [SmartNotificationsService],
})
export class SmartNotificationsModule {}
