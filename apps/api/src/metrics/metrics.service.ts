import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

/**
 * MetricsService — publishes custom metrics to CloudWatch under FitAI/AI namespace.
 *
 * Why: Out-of-the-box CloudWatch tracks AWS infra metrics (CPU, RDS, ALB),
 * but NOT our 3rd-party API usage (Claude tokens, ElevenLabs characters).
 * Without this we can't estimate monthly AI spend or catch runaway usage.
 *
 * Graceful: if CloudWatch SDK fails (credentials, network), we silently log
 * the warning. Never blocks the business logic.
 */
@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private client: CloudWatchClient | null = null;

  onModuleInit() {
    try {
      this.client = new CloudWatchClient({
        region: process.env.AWS_REGION || 'eu-west-1',
      });
      this.logger.log('CloudWatch metrics client initialized');
    } catch (e: any) {
      this.logger.warn(`Metrics init failed: ${e.message}`);
    }
  }

  /** Record Claude API token usage (input + output) per endpoint. */
  async recordClaudeTokens(endpoint: string, inputTokens: number, outputTokens: number) {
    await this.put('ClaudeTokens', inputTokens + outputTokens, 'Count', {
      Endpoint: endpoint,
      Type: 'total',
    });
    // Dimensionless aggregate so a single CloudWatch alarm can watch total
    // spend across all endpoints (a dimensioned metric can't be summed by a
    // plain alarm). Spend tripwire lives in the monitoring TF module.
    await this.put('ClaudeTokensTotal', inputTokens + outputTokens, 'Count');
    // Track input/output separately for cost analysis
    await this.put('ClaudeInputTokens', inputTokens, 'Count', { Endpoint: endpoint });
    await this.put('ClaudeOutputTokens', outputTokens, 'Count', { Endpoint: endpoint });
  }

  /**
   * Fire-and-forget convenience for Claude responses. Reads `.usage` and records.
   * Never throws — caller doesn't need to wrap in try/catch.
   */
  trackClaudeUsage(endpoint: string, response: { usage?: { input_tokens?: number; output_tokens?: number } } | null | undefined) {
    const u = response?.usage;
    if (!u || u.input_tokens == null || u.output_tokens == null) return;
    this.recordClaudeTokens(endpoint, u.input_tokens, u.output_tokens).catch(() => {});
  }

  /** Record ElevenLabs TTS character usage. */
  async recordElevenLabsCharacters(chars: number) {
    await this.put('ElevenLabsCharacters', chars, 'Count');
  }

  /** Record cache hit/miss for diagnostics. */
  async recordCacheHit(key: string) {
    await this.put('CacheHit', 1, 'Count', { KeyPrefix: this.keyPrefix(key) });
  }

  async recordCacheMiss(key: string) {
    await this.put('CacheMiss', 1, 'Count', { KeyPrefix: this.keyPrefix(key) });
  }

  /** Custom event counter (auth failures, 429 throttles, etc.) */
  async recordEvent(name: string, dimensions: Record<string, string> = {}) {
    await this.put(name, 1, 'Count', dimensions);
  }

  // ── helpers ──

  private keyPrefix(key: string): string {
    // Strip per-user/per-id parts: "user:abc-123" → "user"
    return key.split(':')[0] || 'unknown';
  }

  private async put(
    metricName: string,
    value: number,
    unit: 'Count' | 'Seconds' | 'Bytes' = 'Count',
    dimensions: Record<string, string> = {},
  ) {
    if (!this.client) return;
    try {
      await this.client.send(
        new PutMetricDataCommand({
          Namespace: 'FitAI/AI',
          MetricData: [
            {
              MetricName: metricName,
              Value: value,
              Unit: unit,
              Timestamp: new Date(),
              Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
            },
          ],
        }),
      );
    } catch (e: any) {
      // Silent — never break business logic on metric publish failure
      if (Math.random() < 0.01) {
        // Only log ~1% to avoid log spam
        this.logger.warn(`Metric ${metricName} publish failed: ${e.message}`);
      }
    }
  }
}
