import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteBossDto } from './dto/complete-boss.dto';

export interface BossDefinition {
  code: string;
  nameCs: string;
  description: string;
  targetTime: number;
  xpReward: number;
}

const BOSSES: BossDefinition[] = [
  { code: 'minotaur', nameCs: 'Minotaurus', description: '100 drepu, 50 kliku, 30 vypadu', targetTime: 1200, xpReward: 500 },
  { code: 'hydra', nameCs: 'Hydra', description: '5 kol: 10 burpees, 20 KB swings, 30 skoku', targetTime: 1800, xpReward: 750 },
  { code: 'atlas', nameCs: 'Atlas', description: 'Deadlift 1.5x bodyweight x 20 repu', targetTime: 600, xpReward: 1000 },
  { code: 'sparta', nameCs: 'Spartan', description: '300 repu mix (50 pull-upy, 50 dipy, 50 kliku, 50 drepy, 50 vypady, 50 sit-upy)', targetTime: 2400, xpReward: 1500 },
  { code: 'olymp', nameCs: 'Olymp', description: 'Marathon treninku: 60 min nonstop s RPE 7+', targetTime: 3600, xpReward: 2000 },
];

@Injectable()
export class BossFightsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    const attempts = await this.prisma.bossAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    return BOSSES.map((boss) => {
      const userAttempts = attempts.filter(
        (a) => a.bossCode === boss.code,
      );
      const bestAttempt = userAttempts.find((a) => a.defeated);
      return {
        ...boss,
        attempts: userAttempts.length,
        defeated: !!bestAttempt,
        bestScore: bestAttempt?.score ?? null,
        lastAttempt: userAttempts[0]?.startedAt ?? null,
      };
    });
  }

  async start(userId: string, code: string) {
    const boss = BOSSES.find((b) => b.code === code);
    if (!boss) throw new NotFoundException('Boss not found');

    const attempt = await this.prisma.bossAttempt.create({
      data: { userId, bossCode: code },
    });

    return { attemptId: attempt.id, boss };
  }

  async complete(userId: string, code: string, dto: CompleteBossDto) {
    const boss = BOSSES.find((b) => b.code === code);
    if (!boss) throw new NotFoundException('Boss not found');

    const pending = await this.prisma.bossAttempt.findFirst({
      where: {
        userId,
        bossCode: code,
        completedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!pending) {
      throw new BadRequestException('No active attempt');
    }

    await this.prisma.bossAttempt.update({
      where: { id: pending.id },
      data: {
        completedAt: new Date(),
        score: dto.score,
        defeated: dto.defeated,
      },
    });

    let xpAwarded = 0;
    if (dto.defeated) {
      xpAwarded = boss.xpReward;
      await this.prisma.userProgress.upsert({
        where: { userId },
        update: { totalXP: { increment: xpAwarded } },
        create: { userId, totalXP: xpAwarded },
      });
    }

    return {
      defeated: dto.defeated,
      score: dto.score,
      xpAwarded,
      bossName: boss.nameCs,
    };
  }
}
