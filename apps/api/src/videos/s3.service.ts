import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client | null = null;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_VIDEOS || 'fitai-videos';
    const region = process.env.AWS_REGION || 'eu-west-1';

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.client = new S3Client({ region });
      this.logger.log('S3 client initialized');
    } else {
      this.logger.warn('AWS credentials not configured — S3 uploads will return mock URLs');
    }
  }

  async getPresignedUploadUrl(filename: string, contentType: string) {
    const key = `raw/${randomUUID()}/${filename}`;

    if (!this.client) {
      this.logger.warn('Returning mock presigned URL (no AWS credentials)');
      return {
        uploadUrl: `https://${this.bucket}.s3.amazonaws.com/${key}?mock=true`,
        s3Key: key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });
    return { uploadUrl, s3Key: key };
  }
}
