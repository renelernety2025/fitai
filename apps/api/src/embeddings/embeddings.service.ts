import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import OpenAI from 'openai';

const MODEL = 'text-embedding-3-small';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (this.client) return this.client;
    if (!process.env.OPENAI_API_KEY) {
      this.logger.error('OPENAI_API_KEY not configured');
      throw new InternalServerErrorException('Embeddings service unavailable');
    }
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return this.client;
  }

  async embed(text: string): Promise<number[]> {
    const res = await this.getClient().embeddings.create({ model: MODEL, input: text });
    return res.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await this.getClient().embeddings.create({ model: MODEL, input: texts });
    return res.data.map((d) => d.embedding);
  }

  toVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }
}
