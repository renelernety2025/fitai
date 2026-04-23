import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRehabDto } from './dto/create-rehab.dto';
import { UpdateRehabDto } from './dto/update-rehab.dto';
import { LogRehabSessionDto } from './dto/log-rehab-session.dto';

@Injectable()
export class RehabService {
  private readonly logger = new Logger(RehabService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  async getAll(userId: string) {
    return this.prisma.rehabPlan.findMany({
      where: { userId },
      include: { sessions: { orderBy: { date: 'desc' }, take: 3 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateRehabDto) {
    const aiPlan = await this.generatePlan(dto);

    return this.prisma.rehabPlan.create({
      data: {
        userId,
        injuryType: dto.injuryType,
        bodyPart: dto.bodyPart,
        severity: dto.severity,
        startDate: new Date(),
        aiPlan,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRehabDto) {
    const plan = await this.findOwned(userId, id);
    return this.prisma.rehabPlan.update({
      where: { id: plan.id },
      data: { status: dto.status, notes: dto.notes },
    });
  }

  async logSession(
    userId: string,
    planId: string,
    dto: LogRehabSessionDto,
  ) {
    await this.findOwned(userId, planId);
    return this.prisma.rehabSession.create({
      data: {
        rehabPlanId: planId,
        date: new Date(),
        exercises: dto.exercises as any,
        painLevel: dto.painLevel,
        notes: dto.notes,
        completed: true,
      },
    });
  }

  async getSessions(userId: string, planId: string) {
    await this.findOwned(userId, planId);
    return this.prisma.rehabSession.findMany({
      where: { rehabPlanId: planId },
      orderBy: { date: 'desc' },
    });
  }

  private async findOwned(userId: string, id: string) {
    const plan = await this.prisma.rehabPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Rehab plan not found');
    if (plan.userId !== userId) throw new ForbiddenException();
    return plan;
  }

  private async generatePlan(dto: CreateRehabDto) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Create a structured rehab plan for:
Injury: ${dto.injuryType}
Body part: ${dto.bodyPart}
Severity: ${dto.severity}

Reply in Czech, JSON format:
{"phases":[{"name":"...","weekStart":1,"weekEnd":2,"exercises":[{"name":"...","sets":3,"reps":"10-12","notes":"..."}],"goals":["..."]}],"timeline":"...","precautions":["..."]}`,
        }],
      });

      const text = msg.content[0]?.type === 'text'
        ? msg.content[0].text : '{}';
      return JSON.parse(text);
    } catch (err: any) {
      this.logger.warn(`Claude rehab plan failed: ${err.message}`);
      return this.fallbackPlan(dto);
    }
  }

  private fallbackPlan(dto: CreateRehabDto) {
    return {
      phases: [
        {
          name: 'Phase 1 - Rest & Recovery',
          weekStart: 1,
          weekEnd: 2,
          exercises: [
            { name: 'Ice application', sets: 3, reps: '15 min', notes: 'Every 2-3 hours' },
            { name: 'Gentle range of motion', sets: 2, reps: '10', notes: 'Pain-free range only' },
          ],
          goals: ['Reduce inflammation', 'Maintain mobility'],
        },
        {
          name: 'Phase 2 - Strengthening',
          weekStart: 3,
          weekEnd: 4,
          exercises: [
            { name: 'Isometric holds', sets: 3, reps: '10s hold', notes: 'No pain' },
            { name: 'Resistance band work', sets: 3, reps: '12-15', notes: 'Light resistance' },
          ],
          goals: ['Rebuild strength', 'Improve stability'],
        },
      ],
      timeline: `${dto.severity === 'severe' ? '6-8' : dto.severity === 'moderate' ? '4-6' : '2-4'} weeks`,
      precautions: ['Stop if sharp pain occurs', 'Consult a physiotherapist'],
    };
  }
}
