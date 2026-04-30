import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type PhotoSide = 'FRONT' | 'SIDE' | 'BACK';

export interface BodyPhotoDto {
  id: string;
  side: PhotoSide;
  takenAt: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  notes: string | null;
  isAnalyzed: boolean;
  url: string; // presigned GET url
  analysis?: {
    estimatedBodyFatPct: number | null;
    estimatedMuscleMass: string | null;
    postureNotes: string | null;
    visibleStrengths: string[];
    areasToWork: string[];
    comparisonNotes: string | null;
  } | null;
}

@Injectable()
export class ProgressPhotosService {
  private readonly logger = new Logger(ProgressPhotosService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET_ASSETS || 'fitai-assets-production';
    const region = process.env.AWS_REGION || 'eu-west-1';
    // Disable AWS SDK v3 auto-checksum middleware. Otherwise the SDK signs an
    // empty-body CRC32 checksum into the presigned URL, browser PUT then sends
    // a real body and S3 returns 400 BadDigest. Cast to any because option is
    // only typed in @aws-sdk/client-s3 v3.730+; older runtimes ignore it safely.
    this.client = new S3Client({
      region,
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    } as any);
    this.logger.log(`Progress photos S3 ready (bucket=${this.bucket})`);
  }

  /** Get presigned upload URL for a new photo. Client uploads JPEG/PNG directly to S3. */
  async getUploadUrl(userId: string, opts: { contentType: string; side: PhotoSide; weightKg?: number; bodyFatPct?: number; notes?: string }) {
    const id = randomUUID();
    const ext = opts.contentType.includes('png') ? 'png' : 'jpg';
    const s3Key = `progress-photos/${userId}/${id}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: opts.contentType,
      Metadata: {
        userId,
        side: opts.side,
      },
    });
    const uploadUrl = await getSignedUrl(this.client as any, command as any, { expiresIn: 900 });

    // Pre-create DB row so client can finalize after upload
    const photo = await (this.prisma as any).bodyPhoto.create({
      data: {
        id,
        userId,
        s3Key,
        side: opts.side,
        weightKg: opts.weightKg ?? null,
        bodyFatPct: opts.bodyFatPct ?? null,
        notes: opts.notes ?? null,
      },
    });

    return { uploadUrl, photoId: photo.id, s3Key };
  }

  /** List all photos for a user, optionally filtered by side, with presigned GET urls. */
  async list(userId: string, side?: PhotoSide): Promise<BodyPhotoDto[]> {
    const photos = await (this.prisma as any).bodyPhoto.findMany({
      where: { userId, ...(side ? { side } : {}) },
      orderBy: { takenAt: 'desc' },
      include: { analysis: true },
    });

    return Promise.all(
      photos.map(async (p: any) => ({
        id: p.id,
        side: p.side,
        takenAt: p.takenAt.toISOString(),
        weightKg: p.weightKg,
        bodyFatPct: p.bodyFatPct,
        notes: p.notes,
        isAnalyzed: p.isAnalyzed,
        url: await this.presignedGetUrl(p.s3Key),
        analysis: p.analysis
          ? {
              estimatedBodyFatPct: p.analysis.estimatedBodyFatPct,
              estimatedMuscleMass: p.analysis.estimatedMuscleMass,
              postureNotes: p.analysis.postureNotes,
              visibleStrengths: p.analysis.visibleStrengths || [],
              areasToWork: p.analysis.areasToWork || [],
              comparisonNotes: p.analysis.comparisonNotes,
            }
          : null,
      })),
    );
  }

  async getOne(userId: string, photoId: string): Promise<BodyPhotoDto> {
    const p = await (this.prisma as any).bodyPhoto.findUnique({
      where: { id: photoId },
      include: { analysis: true },
    });
    if (!p) throw new NotFoundException('Photo not found');
    if (p.userId !== userId) throw new ForbiddenException('Not your photo');
    return {
      id: p.id,
      side: p.side,
      takenAt: p.takenAt.toISOString(),
      weightKg: p.weightKg,
      bodyFatPct: p.bodyFatPct,
      notes: p.notes,
      isAnalyzed: p.isAnalyzed,
      url: await this.presignedGetUrl(p.s3Key),
      analysis: p.analysis
        ? {
            estimatedBodyFatPct: p.analysis.estimatedBodyFatPct,
            estimatedMuscleMass: p.analysis.estimatedMuscleMass,
            postureNotes: p.analysis.postureNotes,
            visibleStrengths: p.analysis.visibleStrengths || [],
            areasToWork: p.analysis.areasToWork || [],
            comparisonNotes: p.analysis.comparisonNotes,
          }
        : null,
    };
  }

  async delete(userId: string, photoId: string) {
    const p = await (this.prisma as any).bodyPhoto.findUnique({ where: { id: photoId } });
    if (!p) throw new NotFoundException('Photo not found');
    if (p.userId !== userId) throw new ForbiddenException('Not your photo');

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: p.s3Key }),
      );
    } catch (e: any) {
      this.logger.warn(`S3 delete failed (will still remove DB row): ${e.message}`);
    }

    await (this.prisma as any).bodyPhoto.delete({ where: { id: photoId } });
    return { deleted: true };
  }

  /** Trigger Claude Vision analysis on a single photo. Compares against
   * previous photo of same side if available. Stores result in BodyAnalysis. */
  async analyze(userId: string, photoId: string) {
    const photo = await (this.prisma as any).bodyPhoto.findUnique({
      where: { id: photoId },
      include: { analysis: true },
    });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.userId !== userId) throw new ForbiddenException('Not your photo');

    // Find previous photo of same side
    const previous = await (this.prisma as any).bodyPhoto.findFirst({
      where: {
        userId,
        side: photo.side,
        takenAt: { lt: photo.takenAt },
      },
      orderBy: { takenAt: 'desc' },
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Static fallback
      const fallback = await this.upsertAnalysis(photoId, {
        estimatedBodyFatPct: null,
        estimatedMuscleMass: 'moderate',
        postureNotes: 'Vision analysis unavailable — set ANTHROPIC_API_KEY to enable.',
        visibleStrengths: [],
        areasToWork: [],
        comparisonNotes: null,
        rawClaudeResponse: null,
        modelUsed: 'fallback',
      });
      return fallback;
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });

      // Fetch image from S3 as base64 (Claude Vision expects base64 or URL)
      const currentB64 = await this.fetchAsBase64(photo.s3Key);
      const previousB64 = previous ? await this.fetchAsBase64(previous.s3Key).catch(() => null) : null;

      const sideLabel = { FRONT: 'zepředu', SIDE: 'z boku', BACK: 'zezadu' }[photo.side as PhotoSide];
      const userMeta = photo.weightKg ? `Aktuální váha: ${photo.weightKg}kg.` : '';
      const prevMeta = previous?.takenAt
        ? `Předchozí foto pořízeno ${new Date(previous.takenAt).toISOString().slice(0, 10)}${previous.weightKg ? ` (váha ${previous.weightKg}kg)` : ''}.`
        : '';

      const messages: any[] = [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: currentB64 },
            },
            ...(previousB64
              ? [
                  {
                    type: 'image',
                    source: { type: 'base64', media_type: 'image/jpeg', data: previousB64 },
                  },
                ]
              : []),
            {
              type: 'text',
              text: `Jsi expert na body composition analýzu. Posuzuješ fotografii těla ${sideLabel}. ${userMeta} ${prevMeta}

${
  previousB64
    ? 'První obrázek je AKTUÁLNÍ stav, druhý je PŘEDCHOZÍ stav. Porovnej viditelné změny.'
    : 'Toto je první foto. Žádné porovnání.'
}

Vrať POUZE JSON v češtině:
{
  "estimatedBodyFatPct": 15.5,
  "estimatedMuscleMass": "low|moderate|high|elite",
  "postureNotes": "1-2 věty o držení těla, co vidíš",
  "visibleStrengths": ["3 silné stránky postavy"],
  "areasToWork": ["2-3 oblasti na práci"],
  "comparisonNotes": ${previousB64 ? '"1-2 věty co se změnilo vs předchozí foto"' : 'null'}
}

Buď respektující, motivační, konkrétní. Žádné medical advice. Nevypisuj nic mimo JSON.`,
            },
          ],
        },
      ];

      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        messages,
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in Claude response');
      const parsed = JSON.parse(jsonMatch[0]);

      const analysis = await this.upsertAnalysis(photoId, {
        estimatedBodyFatPct:
          typeof parsed.estimatedBodyFatPct === 'number' ? parsed.estimatedBodyFatPct : null,
        estimatedMuscleMass: parsed.estimatedMuscleMass || null,
        postureNotes: parsed.postureNotes || null,
        visibleStrengths: Array.isArray(parsed.visibleStrengths) ? parsed.visibleStrengths : [],
        areasToWork: Array.isArray(parsed.areasToWork) ? parsed.areasToWork : [],
        comparisonNotes: parsed.comparisonNotes || null,
        rawClaudeResponse: text,
        modelUsed: 'claude-haiku-4-5',
      });

      await (this.prisma as any).bodyPhoto.update({
        where: { id: photoId },
        data: { isAnalyzed: true },
      });

      return analysis;
    } catch (e: any) {
      this.logger.error(`Claude Vision analysis failed: ${e.message}`);
      throw new InternalServerErrorException('Photo analysis failed');
    }
  }

  async stats(userId: string) {
    const [total, byFront, bySide, byBack] = await Promise.all([
      (this.prisma as any).bodyPhoto.count({ where: { userId } }),
      (this.prisma as any).bodyPhoto.count({ where: { userId, side: 'FRONT' } }),
      (this.prisma as any).bodyPhoto.count({ where: { userId, side: 'SIDE' } }),
      (this.prisma as any).bodyPhoto.count({ where: { userId, side: 'BACK' } }),
    ]);
    const first = await (this.prisma as any).bodyPhoto.findFirst({
      where: { userId },
      orderBy: { takenAt: 'asc' },
    });
    const latest = await (this.prisma as any).bodyPhoto.findFirst({
      where: { userId },
      orderBy: { takenAt: 'desc' },
    });
    return {
      total,
      byAngle: { front: byFront, side: bySide, back: byBack },
      firstTakenAt: first?.takenAt?.toISOString() || null,
      latestTakenAt: latest?.takenAt?.toISOString() || null,
      daysTracked:
        first && latest
          ? Math.max(
              1,
              Math.round(
                (new Date(latest.takenAt).getTime() - new Date(first.takenAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
          : 0,
    };
  }

  // ── helpers ──

  private async presignedGetUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.client as any, command as any, { expiresIn: 3600 });
  }

  private async fetchAsBase64(s3Key: string): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    const res: any = await this.client.send(cmd);
    const stream = res.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('base64');
  }

  private async upsertAnalysis(photoId: string, data: any) {
    return (this.prisma as any).bodyAnalysis.upsert({
      where: { bodyPhotoId: photoId },
      update: data,
      create: { bodyPhotoId: photoId, ...data },
    });
  }
}
