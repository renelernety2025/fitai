import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MessageValidator = require('sns-validator');

export type SnsMessageType =
  | 'Notification'
  | 'SubscriptionConfirmation'
  | 'UnsubscribeConfirmation';

export interface SnsMessage {
  Type: SnsMessageType;
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  SubscribeURL?: string;
  Token?: string;
  Subject?: string;
}

@Injectable()
export class SnsVerificationService {
  private readonly logger = new Logger(SnsVerificationService.name);
  private readonly validator = new MessageValidator();
  private readonly allowedTopicArn = process.env.MEDIACONVERT_SNS_TOPIC_ARN;

  async verify(payload: unknown): Promise<SnsMessage> {
    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid SNS payload');
    }
    const message = payload as SnsMessage;

    await new Promise<void>((resolve, reject) => {
      this.validator.validate(message, (err: Error | null) => {
        if (err) {
          this.logger.warn(`SNS signature verification failed: ${err.message}`);
          reject(new UnauthorizedException('Invalid SNS signature'));
        } else {
          resolve();
        }
      });
    });

    if (this.allowedTopicArn && message.TopicArn !== this.allowedTopicArn) {
      this.logger.warn(`SNS message from unexpected topic: ${message.TopicArn}`);
      throw new UnauthorizedException('SNS topic not authorized');
    }

    return message;
  }

  async confirmSubscription(message: SnsMessage): Promise<void> {
    if (!message.SubscribeURL) {
      throw new UnauthorizedException('SubscribeURL missing in SubscriptionConfirmation');
    }
    const url = new URL(message.SubscribeURL);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.amazonaws.com')) {
      throw new UnauthorizedException(`Invalid SubscribeURL host: ${url.hostname}`);
    }
    const res = await fetch(message.SubscribeURL);
    if (!res.ok) {
      throw new UnauthorizedException(`SubscribeURL GET failed: ${res.status}`);
    }
    this.logger.log(`SNS subscription confirmed for topic ${message.TopicArn}`);
  }
}
