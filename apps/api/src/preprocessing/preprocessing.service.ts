import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { start: 3, end: 8, text: 'Začneme s postojem hory. Postavte se rovně, nohy na šířku boků.' },
  { start: 10, end: 18, text: 'Nyní přejdeme do bojovníka jedna. Vykročte levou nohou dopředu, pokrčte koleno do devadesáti stupňů.' },
  { start: 20, end: 28, text: 'Zvedněte ruce nad hlavu, dlaně k sobě. Držte tuto pozici pět sekund.' },
  { start: 32, end: 40, text: 'Přejdeme do předklonu. Pomalu se skloňte dopředu, ruce směrem k zemi.' },
  { start: 45, end: 55, text: 'Výborně, nyní si odpočineme v dětské pozici. Klekněte si a natáhněte ruce dopředu.' },
];

function getMockChoreography(videoId: string) {
  return {
    video_id: videoId,
    poses: [
      {
        timestamp_start: 3,
        timestamp_end: 8,
        name: 'Postoj hory',
        rules: [
          { joint: 'left_knee', angle_min: 160, angle_max: 180 },
          { joint: 'right_knee', angle_min: 160, angle_max: 180 },
        ],
        feedback_wrong: 'Narovnej kolena, stůj zpříma',
        feedback_correct: 'Výborně, perfektní postoj!',
      },
      {
        timestamp_start: 10,
        timestamp_end: 18,
        name: 'Bojovník I',
        rules: [
          { joint: 'left_knee', angle_min: 80, angle_max: 100 },
          { joint: 'left_hip', angle_min: 160, angle_max: 180 },
        ],
        feedback_wrong: 'Pokrč přední koleno více do 90 stupňů',
        feedback_correct: 'Skvělý bojovník, drž pozici!',
      },
      {
        timestamp_start: 20,
        timestamp_end: 28,
        name: 'Vzpažení',
        rules: [
          { joint: 'left_shoulder', angle_min: 150, angle_max: 180 },
          { joint: 'right_shoulder', angle_min: 150, angle_max: 180 },
        ],
        feedback_wrong: 'Zvedni ruce výše nad hlavu',
        feedback_correct: 'Krásné vzpažení, ruce rovně!',
      },
      {
        timestamp_start: 32,
        timestamp_end: 40,
        name: 'Předklon',
        rules: [
          { joint: 'left_hip', angle_min: 45, angle_max: 90 },
          { joint: 'right_hip', angle_min: 45, angle_max: 90 },
        ],
        feedback_wrong: 'Skloň se více, uvolni záda',
        feedback_correct: 'Skvělý předklon!',
      },
      {
        timestamp_start: 45,
        timestamp_end: 55,
        name: 'Dětská pozice',
        rules: [
          { joint: 'left_knee', angle_min: 30, angle_max: 60 },
          { joint: 'right_knee', angle_min: 30, angle_max: 60 },
        ],
        feedback_wrong: 'Pokrč kolena více, uvolni se',
        feedback_correct: 'Perfektní odpočinková pozice!',
      },
    ],
  };
}

@Injectable()
export class PreprocessingService {
  private readonly logger = new Logger(PreprocessingService.name);
  private s3Client: S3Client | null = null;
  private bucket: string;
  private cloudfrontUrl: string;

  constructor(private prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET_VIDEOS || 'fitai-videos';
    this.cloudfrontUrl = process.env.CLOUDFRONT_URL || '';

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });
    }
  }

  async startPipeline(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    const jobId = randomUUID();
    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        preprocessingStatus: 'PROCESSING',
        preprocessingJobId: jobId,
        preprocessingError: null,
      },
    });

    // Run pipeline async
    this.runPipeline(videoId, jobId).catch((err) => {
      this.logger.error(`Pipeline failed for ${videoId}: ${err.message}`);
    });

    return { jobId, status: 'started', message: 'Pipeline spuštěna' };
  }

  async getStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        preprocessingStatus: true,
        preprocessingError: true,
        preprocessingJobId: true,
        choreographyUrl: true,
      },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  private async runPipeline(videoId: string, jobId: string) {
    try {
      this.logger.log(`[${jobId}] Starting pipeline for video ${videoId}`);

      // STEP A: Extract audio
      const transcript = await this.stepTranscribe(videoId, jobId);

      // STEP B: Claude extraction
      const choreography = await this.stepExtractChoreography(videoId, jobId, transcript);

      // STEP C: Save result
      await this.stepSaveResult(videoId, jobId, choreography);

      this.logger.log(`[${jobId}] Pipeline completed for video ${videoId}`);
    } catch (err: any) {
      this.logger.error(`[${jobId}] Pipeline error: ${err.message}`);
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          preprocessingStatus: 'FAILED',
          preprocessingError: err.message,
        },
      });
    }
  }

  private async stepTranscribe(videoId: string, jobId: string): Promise<TranscriptSegment[]> {
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      this.logger.warn(`[${jobId}] No OPENAI_API_KEY — using mock transcript`);
      return MOCK_TRANSCRIPT;
    }

    // Download video from S3
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new Error('Video not found');

    const tmpDir = os.tmpdir();
    const videoPath = path.join(tmpDir, `${videoId}.mp4`);
    const audioPath = path.join(tmpDir, `${videoId}.mp3`);

    try {
      // Download from S3
      if (this.s3Client) {
        const obj = await this.s3Client.send(
          new GetObjectCommand({ Bucket: this.bucket, Key: video.s3RawKey }),
        );
        const stream = obj.Body as any;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) chunks.push(chunk);
        fs.writeFileSync(videoPath, Buffer.concat(chunks));
      } else {
        this.logger.warn(`[${jobId}] No S3 client — using mock transcript`);
        return MOCK_TRANSCRIPT;
      }

      // Extract audio with ffmpeg
      const ffmpeg = require('fluent-ffmpeg');
      await new Promise<void>((resolve, reject) => {
        ffmpeg(videoPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .output(audioPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Send to Whisper
      const OpenAI = require('openai').default;
      const openai = new OpenAI({ apiKey: openaiKey });
      const audioFile = fs.createReadStream(audioPath);
      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
      });

      return (response.segments || []).map((s: any) => ({
        start: Math.floor(s.start),
        end: Math.ceil(s.end),
        text: s.text.trim(),
      }));
    } finally {
      // Cleanup temp files
      try { fs.unlinkSync(videoPath); } catch {}
      try { fs.unlinkSync(audioPath); } catch {}
    }
  }

  private async stepExtractChoreography(
    videoId: string,
    jobId: string,
    transcript: TranscriptSegment[],
  ) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicKey) {
      this.logger.warn(`[${jobId}] No ANTHROPIC_API_KEY — using mock choreography`);
      return getMockChoreography(videoId);
    }

    const Anthropic = require('@anthropic-ai/sdk').default;
    const client = new Anthropic({ apiKey: anthropicKey });

    const systemPrompt = `Jsi AI asistent specializovaný na analýzu fitness videí.
Dostaneš přepis cvičebního videa s časovými razítky.
Tvým úkolem je extrahovat cvičební pózy a vytvořit strukturovaná pravidla pro kontrolu správného provedení.

Vrať POUZE validní JSON bez jakéhokoliv dalšího textu, v tomto formátu:
{
  "poses": [
    {
      "timestamp_start": number,
      "timestamp_end": number,
      "name": string (český název pózy),
      "rules": [
        {
          "joint": string (jedna z: left_knee, right_knee, left_elbow, right_elbow, left_shoulder, right_shoulder, left_hip, right_hip),
          "angle_min": number (minimální správný úhel ve stupních),
          "angle_max": number (maximální správný úhel ve stupních)
        }
      ],
      "feedback_wrong": string (česky, co uživatel dělá špatně),
      "feedback_correct": string (česky, pochvala za správné provedení)
    }
  ]
}

Pravidla pro úhly kloubů:
- Přímá noha/ruka = 160-180 stupňů
- Pokrčené koleno 90° = 80-100 stupňů
- Paže vzpažené = 150-180 stupňů
- Předklon = kyčle 45-90 stupňů
- Dětská pozice = kolena 30-60 stupňů

Pokud pro danou pózu nelze určit konkrétní kloub, přidej alespoň jedno pravidlo
pro nejdůležitější kloub dané pózy.`;

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(transcript) }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    // Extract JSON from response (might have markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude response did not contain valid JSON');

    const parsed = JSON.parse(jsonMatch[0]);
    return { video_id: videoId, ...parsed };
  }

  private async stepSaveResult(videoId: string, jobId: string, choreography: any) {
    const jsonContent = JSON.stringify(choreography, null, 2);
    const s3Key = `choreography/${videoId}/choreography.json`;

    if (this.s3Client) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: jsonContent,
          ContentType: 'application/json',
        }),
      );
      this.logger.log(`[${jobId}] Saved choreography to S3: ${s3Key}`);
    } else {
      // Save locally
      const localPath = path.join(os.tmpdir(), `choreography_${videoId}.json`);
      fs.writeFileSync(localPath, jsonContent);
      this.logger.log(`[${jobId}] Saved choreography locally: ${localPath}`);
    }

    const choreographyUrl = this.cloudfrontUrl
      ? `${this.cloudfrontUrl}/${s3Key}`
      : `file:///tmp/choreography_${videoId}.json`;

    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        choreographyUrl,
        preprocessingStatus: 'COMPLETED',
      },
    });
  }
}
