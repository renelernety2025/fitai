/**
 * Single source of truth for Claude model ids (ADR pending — was 27
 * hardcoded strings across 13 services).
 *
 * Convention (see .claude/rules/api.md):
 * - haiku: coaching, tips, daily brief, plan generation, structured JSON
 * - sonnet: vision (food recognition, body photos, form check)
 * - opus: video preprocessing / choreography pipeline
 */
export const CLAUDE_MODELS = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-5',
} as const;

export type ClaudeModelKey = keyof typeof CLAUDE_MODELS;

export interface ClaudeCompleteOptions {
  /** Model tier; defaults to 'haiku'. */
  model?: ClaudeModelKey;
  system?: string;
  /** Anthropic messages array (may include vision image blocks). */
  messages: Array<{ role: 'user' | 'assistant'; content: unknown }>;
  maxTokens: number;
  temperature?: number;
  /**
   * Opt-in response cache. Provide a stable key (caller hashes its own
   * inputs); identical prompts within TTL skip the API call entirely.
   */
  cacheKey?: string;
  /** Cache TTL in seconds; default 3600 (1h). */
  cacheTtlSeconds?: number;
}

export interface ClaudeStreamOptions {
  model?: ClaudeModelKey;
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: unknown }>;
  maxTokens: number;
  temperature?: number;
}
