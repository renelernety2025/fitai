import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { CoachingService } from './coaching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskCoachDto } from './dto/ask-coach.dto';

@Controller('coaching')
@UseGuards(JwtAuthGuard)
export class CoachingController {
  constructor(private coachingService: CoachingService) {}

  @Post('feedback')
  generateFeedback(@Request() req: any, @Body() dto: any) {
    return this.coachingService.generateFeedback({
      userId: req.user.id,
      ...dto,
    });
  }

  @Post('safety-event')
  logSafetyEvent(@Request() req: any, @Body() dto: any) {
    return this.coachingService.logSafetyEvent({
      userId: req.user.id,
      ...dto,
    });
  }

  @Post('tts')
  synthesize(@Body('text') text: string) {
    return this.coachingService.synthesize(text);
  }

  @Post('precache')
  precache() {
    return this.coachingService.precache();
  }

  /** Voice Q&A — user asks a question during workout, Claude answers */
  @Throttle({ default: { limit: 30, ttl: seconds(3600) } }) // 30 voice questions/hour/user
  @Post('ask')
  askCoach(@Request() req: any, @Body() dto: AskCoachDto) {
    return this.coachingService.answerQuestion(
      req.user.id,
      dto.question,
      dto.exerciseName,
      dto.formScore,
      dto.completedReps,
      dto.audioFormat,
    );
  }
}
