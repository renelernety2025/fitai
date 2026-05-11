import { Controller, Post, Get, Param, Body, UseGuards, Request, Res } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import type { Response } from 'express';
import { CoachingService, type StreamEvent } from './coaching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AskCoachDto } from './dto/ask-coach.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { CoachingFeedbackDto } from './dto/coaching-feedback.dto';
import { SafetyEventDto } from './dto/safety-event.dto';
import { SynthesizeDto } from './dto/synthesize.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('coaching')
@UseGuards(JwtAuthGuard)
export class CoachingController {
  constructor(private coachingService: CoachingService) {}

  @Throttle({ default: { limit: 60, ttl: seconds(60) } })
  @Post('feedback')
  generateFeedback(@Request() req: any, @Body() dto: CoachingFeedbackDto) {
    return this.coachingService.generateFeedback({
      userId: req.user.id,
      ...dto,
    });
  }

  @Post('safety-event')
  logSafetyEvent(@Request() req: any, @Body() dto: SafetyEventDto) {
    return this.coachingService.logSafetyEvent({
      userId: req.user.id,
      ...dto,
    });
  }

  @Throttle({ default: { limit: 30, ttl: seconds(3600) } })
  @Post('tts')
  synthesize(@Body() dto: SynthesizeDto) {
    return this.coachingService.synthesize(dto.text, dto.audioFormat);
  }

  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 3, ttl: seconds(3600) } })
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

  /**
   * Streaming variant of /ask — emits Server-Sent Events so the mobile
   * client sees Claude text deltas (and, after Phase E-2, ElevenLabs audio
   * chunks) as they are produced. Replaces the ~4-10s request/response
   * cascade with a first-word-in <1.5s pipeline.
   *
   * Not using NestJS `@Sse()` because that decorator is GET-only and we
   * want POST for body-carried questions (question text stays out of
   * access logs and URL length limits). Manual Express SSE works fine
   * with `react-native-sse` on the client, which supports POST over SSE.
   */
  @Throttle({ default: { limit: 30, ttl: seconds(3600) } })
  @Post('ask-stream')
  async askCoachStream(
    @Request() req: any,
    @Body() dto: AskCoachDto,
    @Res() res: Response,
  ): Promise<void> {
    // SSE response headers — must be flushed before the first write so
    // intermediaries don't buffer the stream.
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx proxy buffering
    res.flushHeaders();

    const write = (event: StreamEvent): void => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    // If the client hangs up mid-stream, we stop emitting. The service
    // loop checks res.writableEnded through the write() helper so in-flight
    // Claude/ElevenLabs work can be abandoned when it's pointless.
    req.on('close', () => {
      if (!res.writableEnded) res.end();
    });

    try {
      await this.coachingService.answerQuestionStream(
        req.user.id,
        dto,
        write,
      );
    } catch (e: any) {
      write({ type: 'error', message: 'stream failed' });
    } finally {
      if (!res.writableEnded) res.end();
    }
  }

  // ── AI Chat Coach ────────────────────────────────────────────

  /** List all chat conversations for the authenticated user. */
  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.coachingService.getConversations(req.user.id);
  }

  /** Get all messages for a specific conversation. */
  @Get('conversations/:id/messages')
  getConversationMessages(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.coachingService.getConversationMessages(req.user.id, id);
  }

  /** Chat with AI coach — streaming SSE response. */
  @Throttle({ default: { limit: 30, ttl: seconds(3600) } })
  @Post('chat')
  async chat(
    @Request() req: any,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const write = (
      event: StreamEvent | { type: 'conversation_id'; id: string },
    ): void => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    };

    req.on('close', () => {
      if (!res.writableEnded) res.end();
    });

    try {
      await this.coachingService.chatStream(
        req.user.id,
        dto.message,
        dto.conversationId,
        write,
      );
    } catch (e: any) {
      write({ type: 'error', message: 'stream failed' });
    } finally {
      if (!res.writableEnded) res.end();
    }
  }
}
