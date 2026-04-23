import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FormCheckController } from './form-check.controller';
import { FormCheckService } from './form-check.service';

@Module({
  imports: [PrismaModule],
  controllers: [FormCheckController],
  providers: [FormCheckService],
  exports: [FormCheckService],
})
export class FormCheckModule {}
