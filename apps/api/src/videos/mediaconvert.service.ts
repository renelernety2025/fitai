import { Injectable, Logger } from '@nestjs/common';
import {
  MediaConvertClient,
  CreateJobCommand,
} from '@aws-sdk/client-mediaconvert';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaConvertService {
  private readonly logger = new Logger(MediaConvertService.name);
  private client: MediaConvertClient | null = null;
  private bucket: string;
  private roleArn: string;
  private cloudfrontUrl: string;

  constructor(private prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET_VIDEOS || 'fitai-videos';
    this.roleArn = process.env.MEDIACONVERT_ROLE_ARN || '';
    this.cloudfrontUrl = process.env.CLOUDFRONT_URL || '';
    const endpoint = process.env.MEDIACONVERT_ENDPOINT;

    if (endpoint && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.client = new MediaConvertClient({
        region: process.env.AWS_REGION || 'eu-west-1',
        endpoint,
      });
      this.logger.log('MediaConvert client initialized');
    } else {
      this.logger.warn('MediaConvert not configured — transcode jobs will be skipped');
    }
  }

  async createTranscodeJob(s3RawKey: string, videoId: string) {
    if (!this.client) {
      this.logger.warn(`Skipping transcode for video ${videoId} (no MediaConvert config)`);
      return { mock: true, videoId };
    }

    const input = `s3://${this.bucket}/${s3RawKey}`;
    const outputPrefix = `s3://${this.bucket}/hls/${videoId}/`;

    const command = new CreateJobCommand({
      Role: this.roleArn,
      Settings: {
        Inputs: [
          {
            FileInput: input,
            AudioSelectors: {
              'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
            },
          },
        ],
        OutputGroups: [
          {
            Name: 'HLS',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                Destination: outputPrefix,
                SegmentLength: 6,
                MinSegmentLength: 0,
              },
            },
            Outputs: [
              this.hlsOutput(640, 360, 1_000_000, 96_000),
              this.hlsOutput(1280, 720, 3_000_000, 128_000),
              this.hlsOutput(1920, 1080, 6_000_000, 192_000),
            ],
          },
        ],
      },
      UserMetadata: { videoId },
    });

    const result = await this.client.send(command);
    this.logger.log(`MediaConvert job created: ${result.Job?.Id} for video ${videoId}`);
    return result;
  }

  async handleJobComplete(videoId: string) {
    const hlsUrl = this.cloudfrontUrl
      ? `${this.cloudfrontUrl}/hls/${videoId}/index.m3u8`
      : `https://${this.bucket}.s3.amazonaws.com/hls/${videoId}/index.m3u8`;

    await this.prisma.video.update({
      where: { id: videoId },
      data: { hlsUrl },
    });

    this.logger.log(`Updated hlsUrl for video ${videoId}`);
  }

  async handleJobError(videoId: string, errorMessage: string) {
    this.logger.error(`MediaConvert job failed for video ${videoId}: ${errorMessage}`);
  }

  private hlsOutput(width: number, height: number, bitrate: number, audioBitrate: number) {
    return {
      ContainerSettings: { Container: 'M3U8' as const },
      VideoDescription: {
        Width: width,
        Height: height,
        CodecSettings: {
          Codec: 'H_264' as const,
          H264Settings: {
            RateControlMode: 'CBR' as const,
            Bitrate: bitrate,
            MaxBitrate: bitrate,
          },
        },
      },
      AudioDescriptions: [
        {
          CodecSettings: {
            Codec: 'AAC' as const,
            AacSettings: {
              Bitrate: audioBitrate,
              CodingMode: 'CODING_MODE_2_0' as const,
              SampleRate: 48000,
            },
          },
        },
      ],
      NameModifier: `_${height}p`,
    };
  }
}
