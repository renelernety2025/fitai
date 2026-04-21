import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateBloodworkDto } from './dto/create-bloodwork.dto';

const REFERENCE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  testosterone: { min: 300, max: 1000, unit: 'ng/dL' },
  iron: { min: 60, max: 170, unit: 'mcg/dL' },
  vitaminD: { min: 30, max: 100, unit: 'ng/mL' },
  crp: { min: 0, max: 3, unit: 'mg/L' },
  cholesterol: { min: 0, max: 200, unit: 'mg/dL' },
  glucose: { min: 70, max: 100, unit: 'mg/dL' },
  hba1c: { min: 4, max: 5.7, unit: '%' },
};

@Injectable()
export class BloodworkService {
  private readonly logger = new Logger(BloodworkService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getAll(userId: string) {
    return this.prisma.bloodworkEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateBloodworkDto) {
    const ref = REFERENCE_RANGES[dto.testType];
    return this.prisma.bloodworkEntry.create({
      data: {
        userId,
        testType: dto.testType,
        value: dto.value,
        unit: dto.unit,
        date: new Date(dto.date),
        lab: dto.lab,
        notes: dto.notes,
        referenceMin: ref?.min ?? null,
        referenceMax: ref?.max ?? null,
      },
    });
  }

  async delete(userId: string, id: string) {
    const entry = await this.prisma.bloodworkEntry.findUnique({
      where: { id },
    });
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.userId !== userId) throw new ForbiddenException();
    await this.prisma.bloodworkEntry.delete({ where: { id } });
    return { deleted: true };
  }

  async getAnalysis(userId: string) {
    return this.cache.getOrSet(
      `bloodwork-analysis:${userId}`,
      3600,
      () => this.generateAnalysis(userId),
    );
  }

  private async generateAnalysis(userId: string) {
    const entries = await this.prisma.bloodworkEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (!entries.length) {
      return {
        summary: 'No bloodwork data yet.',
        markers: [],
        recommendations: [],
      };
    }

    const markers = this.analyzeMarkers(entries);

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Analyze these bloodwork results for a fitness user. Reply in Czech, JSON format: {"summary":"...","recommendations":["..."]}\n\nMarkers:\n${JSON.stringify(markers)}`,
        }],
      });

      const text = msg.content[0]?.type === 'text'
        ? msg.content[0].text : '{}';
      const parsed = JSON.parse(text);

      return { ...parsed, markers };
    } catch (err: any) {
      this.logger.warn(`Claude bloodwork analysis failed: ${err.message}`);
      return {
        summary: 'AI analysis unavailable.',
        markers,
        recommendations: this.fallbackRecommendations(markers),
      };
    }
  }

  private analyzeMarkers(entries: any[]) {
    const latest = new Map<string, any>();
    for (const e of entries) {
      if (!latest.has(e.testType)) latest.set(e.testType, e);
    }

    return Array.from(latest.values()).map((e) => {
      const ref = REFERENCE_RANGES[e.testType];
      let status: 'low' | 'normal' | 'high' = 'normal';
      if (ref) {
        if (e.value < ref.min) status = 'low';
        else if (e.value > ref.max) status = 'high';
      }
      return {
        testType: e.testType,
        value: e.value,
        unit: e.unit,
        status,
        date: e.date,
        referenceMin: ref?.min,
        referenceMax: ref?.max,
      };
    });
  }

  private fallbackRecommendations(markers: any[]): string[] {
    const recs: string[] = [];
    for (const m of markers) {
      if (m.status === 'low' && m.testType === 'vitaminD') {
        recs.push('Consider vitamin D supplementation (2000-4000 IU daily).');
      }
      if (m.status === 'low' && m.testType === 'iron') {
        recs.push('Increase iron-rich foods (red meat, spinach, legumes).');
      }
      if (m.status === 'high' && m.testType === 'cholesterol') {
        recs.push('Focus on heart-healthy fats and increase cardio.');
      }
    }
    if (!recs.length) recs.push('All markers within range. Keep it up!');
    return recs;
  }
}
