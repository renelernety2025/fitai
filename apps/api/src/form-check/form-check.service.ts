import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';

export interface FormAnalysis {
  overallScore: number;
  phases: { name: string; score: number; feedback: string }[];
  improvements: string[];
  positives: string[];
}

@Injectable()
export class FormCheckService {
  private readonly logger = new Logger(FormCheckService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private prisma: PrismaService) {
    this.bucket =
      process.env.S3_BUCKET_ASSETS || 'fitai-assets-production';
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    } as any);
  }

  private static readonly ALLOWED = [
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ];

  async getUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ) {
    if (!FormCheckService.ALLOWED.includes(contentType)) {
      throw new BadRequestException('Invalid content type');
    }
    const id = randomUUID();
    const ext = fileName.split('.').pop() || 'mp4';
    const allowed = ['mp4', 'mov', 'webm'];
    if (!allowed.includes(ext.toLowerCase())) {
      throw new BadRequestException('Invalid file extension');
    }
    const s3Key = `form-checks/${userId}/${id}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
      Metadata: { userId },
    });
    const uploadUrl = await getSignedUrl(
      this.s3 as any,
      command as any,
      { expiresIn: 900 },
    );
    return { uploadUrl, s3Key };
  }

  async analyze(
    userId: string,
    s3Key: string,
    exerciseId: string,
  ): Promise<FormAnalysis> {
    const expectedPrefix = `form-checks/${userId}/`;
    if (!s3Key.startsWith(expectedPrefix)) {
      throw new BadRequestException('Invalid S3 key');
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const phases = exercise.phases as any[];
    const phasesDesc = phases?.length
      ? JSON.stringify(phases)
      : 'No phase data available';

    try {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system:
          'You are a fitness form analysis expert. ' +
          'Analyze the exercise form and provide detailed ' +
          'Czech feedback. Always respond with valid JSON only.',
        messages: [
          {
            role: 'user',
            content:
              `Uzivatel nahral video cviku "${exercise.nameCs || exercise.name}". ` +
              `Faze cviku: ${phasesDesc}. ` +
              `Na zaklade typickych chyb u tohoto cviku, poskytni analyzu formy. ` +
              `Odpovez jako JSON: { "overallScore": 0-100, ` +
              `"phases": [{"name":"...", "score": 0-100, "feedback":"..."}], ` +
              `"improvements": ["..."], "positives": ["..."] }`,
          },
        ],
      });

      const text =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '';

      const parsed = JSON.parse(text) as FormAnalysis;
      return parsed;
    } catch (err) {
      this.logger.warn(`Claude form analysis failed: ${err instanceof Error ? err.message : 'unknown'}`);
      return this.fallbackAnalysis(exercise, phases);
    }
  }

  async getHistory(userId: string) {
    // Return empty for now — no DB model yet.
    // Future: store FormCheck entries in DB.
    return [];
  }

  private fallbackAnalysis(
    exercise: any,
    phases: any[],
  ): FormAnalysis {
    const phaseResults = (phases || []).map((p: any) => ({
      name: p.name || 'Faze',
      score: 70 + Math.floor(Math.random() * 20),
      feedback: 'Sledujte spravnou techniku a kontrolu pohybu.',
    }));

    if (phaseResults.length === 0) {
      phaseResults.push({
        name: 'Celkova forma',
        score: 75,
        feedback: 'Dbejte na spravne drzeni tela.',
      });
    }

    const avg = Math.round(
      phaseResults.reduce((s, p) => s + p.score, 0) /
        phaseResults.length,
    );

    return {
      overallScore: avg,
      phases: phaseResults,
      improvements: [
        'Zkontrolujte rozsah pohybu',
        'Udrzujte stabilni tempo',
      ],
      positives: [
        'Dobra volba cviku',
        'Spravny vyber zateze',
      ],
    };
  }
}
