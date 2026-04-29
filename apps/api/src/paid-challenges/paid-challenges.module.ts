import { Module } from '@nestjs/common';
import { PaidChallengesController } from './paid-challenges.controller';
import { PaidChallengesService } from './paid-challenges.service';

@Module({
  controllers: [PaidChallengesController],
  providers: [PaidChallengesService],
  exports: [PaidChallengesService],
})
export class PaidChallengesModule {}
