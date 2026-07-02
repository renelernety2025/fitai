import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { CacheService } from '../cache/cache.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  CLAUDE_MODELS,
  ClaudeCompleteOptions,
  ClaudeStreamOptions,
} from './claude.models';

/**
 * Central Anthropic client wrapper. One lazy client, model registry,
 * one retry on transient failures, CloudWatch usage metrics, and an
 * opt-in Redis response cache.
 *
 * Callers keep their own domain fallbacks: complete() THROWS on failure
 * (after retry), exactly like the raw SDK did.
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private client: { messages: { create: Function; stream: Function } } | null = null;

  constructor(
    private cache: CacheService,
    private metrics: MetricsService,
  ) {}

  isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  /** Stable cache key from arbitrary prompt inputs. */
  static hashKey(...parts: Array<string | number | null | undefined>): string {
    return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);
  }

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
      // Lazy require keeps boot fast when the key is absent (dev/CI).
      const Anthropic = require('@anthropic-ai/sdk').default;
      this.client = new Anthropic({ apiKey });
    }
    return this.client!;
  }

  /** Non-streaming completion → response text. Throws on failure. */
  async complete(endpoint: string, opts: ClaudeCompleteOptions): Promise<string> {
    const cacheKey = opts.cacheKey ? `claude:${endpoint}:${opts.cacheKey}` : null;
    if (cacheKey) {
      const hit = await this.cache.get<string>(cacheKey);
      if (hit != null) {
        this.metrics.recordCacheHit(cacheKey).catch(() => {});
        return hit;
      }
    }

    const response = await this.createWithRetry(endpoint, opts);
    this.metrics.trackClaudeUsage(endpoint, response);

    const text = response.content?.[0]?.type === 'text' ? response.content[0].text : '';
    if (cacheKey && text) {
      await this.cache.set(cacheKey, text, opts.cacheTtlSeconds ?? 3600);
    }
    return text;
  }

  /**
   * Streaming completion — returns the SDK MessageStream (async-iterable
   * over events, `finalMessage()` for usage). Caller drives the stream;
   * usage metrics are tracked automatically when the stream finishes.
   */
  stream(endpoint: string, opts: ClaudeStreamOptions) {
    const stream = this.getClient().messages.stream(this.toRequest(opts));
    stream
      .finalMessage()
      .then((msg: unknown) => this.metrics.trackClaudeUsage(endpoint, msg as never))
      .catch(() => {});
    return stream;
  }

  private toRequest(opts: ClaudeCompleteOptions | ClaudeStreamOptions) {
    return {
      model: CLAUDE_MODELS[opts.model ?? 'haiku'],
      max_tokens: opts.maxTokens,
      ...(opts.system ? { system: opts.system } : {}),
      ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
      messages: opts.messages,
    };
  }

  private async createWithRetry(endpoint: string, opts: ClaudeCompleteOptions) {
    const request = this.toRequest(opts);
    try {
      return await this.getClient().messages.create(request);
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const retriable = status == null || status === 429 || status >= 500;
      if (!retriable) throw err;
      this.logger.warn(`Claude ${endpoint} failed (status=${status}), retrying once`);
      await new Promise((r) => setTimeout(r, 1500));
      return await this.getClient().messages.create(request);
    }
  }
}
