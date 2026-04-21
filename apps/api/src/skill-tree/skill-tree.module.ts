import { Module } from '@nestjs/common';
import { SkillTreeController } from './skill-tree.controller';
import { SkillTreeService } from './skill-tree.service';

@Module({
  controllers: [SkillTreeController],
  providers: [SkillTreeService],
})
export class SkillTreeModule {}
