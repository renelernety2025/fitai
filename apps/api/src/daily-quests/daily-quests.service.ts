import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface QuestTemplate {
  id: string;
  titleCs: string;
  xpReward: number;
  checkType: 'manual';
}

const QUEST_TEMPLATES: QuestTemplate[] = [
  { id: 'log_food', titleCs: 'Zaloguj jidlo', xpReward: 20, checkType: 'manual' },
  { id: 'do_pushups', titleCs: 'Udelej 20 kliku', xpReward: 30, checkType: 'manual' },
  { id: 'drink_water', titleCs: 'Vypij 2L vody', xpReward: 15, checkType: 'manual' },
  { id: 'give_props', titleCs: 'Dej props kamaradovi', xpReward: 15, checkType: 'manual' },
  { id: 'stretch_5min', titleCs: 'Protahni se 5 minut', xpReward: 20, checkType: 'manual' },
  { id: 'log_sleep', titleCs: 'Zaloguj spanek', xpReward: 15, checkType: 'manual' },
  { id: 'check_records', titleCs: 'Podivej se na sve rekordy', xpReward: 10, checkType: 'manual' },
  { id: 'add_supplement', titleCs: 'Vezmi si suplementy', xpReward: 15, checkType: 'manual' },
  { id: 'read_lesson', titleCs: 'Precti si lekci', xpReward: 20, checkType: 'manual' },
  { id: 'complete_workout', titleCs: 'Dokonci trenink', xpReward: 50, checkType: 'manual' },
  { id: 'check_maintenance', titleCs: 'Zkontroluj servis tela', xpReward: 10, checkType: 'manual' },
  { id: 'log_mood', titleCs: 'Zaloguj naladu', xpReward: 15, checkType: 'manual' },
  { id: 'explore_exercise', titleCs: 'Prozkoumej novy cvik', xpReward: 20, checkType: 'manual' },
  { id: 'view_progress', titleCs: 'Podivej se na pokrok', xpReward: 10, checkType: 'manual' },
  { id: 'breathing_exercise', titleCs: 'Dechove cviceni 1 min', xpReward: 15, checkType: 'manual' },
];

@Injectable()
export class DailyQuestsService {
  constructor(private prisma: PrismaService) {}

  async getTodayQuests(userId: string) {
    const dateStr = this.getTodayDateStr();
    const selected = this.selectQuestsForUser(userId, dateStr);
    const todayDate = new Date(dateStr);

    const completions = await (
      this.prisma as any
    ).dailyQuestCompletion.findMany({
      where: { userId, date: todayDate },
      select: { questId: true },
    });
    const doneIds = new Set(completions.map((c: any) => c.questId));

    return selected.map((q) => ({
      id: q.id,
      titleCs: q.titleCs,
      xpReward: q.xpReward,
      completed: doneIds.has(q.id),
    }));
  }

  async completeQuest(userId: string, questId: string) {
    const dateStr = this.getTodayDateStr();
    const selected = this.selectQuestsForUser(userId, dateStr);
    const quest = selected.find((q) => q.id === questId);
    if (!quest) {
      throw new NotFoundException('Quest not found for today');
    }

    const todayDate = new Date(dateStr);

    const existing = await (
      this.prisma as any
    ).dailyQuestCompletion.findUnique({
      where: {
        userId_questId_date: { userId, questId, date: todayDate },
      },
    });
    if (existing) {
      return { alreadyCompleted: true, xpAwarded: 0 };
    }

    await (this.prisma as any).dailyQuestCompletion.create({
      data: {
        userId,
        questId,
        date: todayDate,
        xpAwarded: quest.xpReward,
      },
    });

    // Award XP
    await this.prisma.userProgress.upsert({
      where: { userId },
      update: { totalXP: { increment: quest.xpReward } },
      create: { userId, totalXP: quest.xpReward },
    });

    return { alreadyCompleted: false, xpAwarded: quest.xpReward };
  }

  private getTodayDateStr(): string {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
  }

  private selectQuestsForUser(
    userId: string,
    dateStr: string,
  ): QuestTemplate[] {
    const seed = this.hashCode(`${userId}:${dateStr}`);
    const indices = new Set<number>();
    let attempt = 0;
    while (indices.size < 3 && attempt < 100) {
      const idx =
        Math.abs(this.hashCode(`${seed}:${attempt}`)) %
        QUEST_TEMPLATES.length;
      indices.add(idx);
      attempt++;
    }
    return [...indices].map((i) => QUEST_TEMPLATES[i]);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = (hash << 5) - hash + ch;
      hash |= 0;
    }
    return hash;
  }
}
