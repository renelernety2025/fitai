import { ClaudeService } from './claude.service';

jest.mock('@anthropic-ai/sdk', () => {
  const create = jest.fn();
  return { default: jest.fn(() => ({ messages: { create, stream: jest.fn() } })), __create: create };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sdkMock = require('@anthropic-ai/sdk');

function makeService(over: { cacheHit?: string | null } = {}) {
  const cache = {
    get: jest.fn().mockResolvedValue(over.cacheHit ?? null),
    set: jest.fn().mockResolvedValue(undefined),
  };
  const metrics = {
    trackClaudeUsage: jest.fn(),
    recordCacheHit: jest.fn().mockResolvedValue(undefined),
  };
  const svc = new ClaudeService(cache as never, metrics as never);
  return { svc, cache, metrics };
}

const textResponse = (text: string) => ({
  content: [{ type: 'text', text }],
  usage: { input_tokens: 10, output_tokens: 5 },
});

describe('ClaudeService', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    sdkMock.__create.mockReset();
  });

  it('isAvailable reflects ANTHROPIC_API_KEY presence', () => {
    const { svc } = makeService();
    expect(svc.isAvailable()).toBe(true);
    delete process.env.ANTHROPIC_API_KEY;
    expect(svc.isAvailable()).toBe(false);
  });

  it('complete() returns text, tracks usage, defaults to haiku', async () => {
    const { svc, metrics } = makeService();
    sdkMock.__create.mockResolvedValue(textResponse('hello'));
    const out = await svc.complete('test/endpoint', {
      messages: [{ role: 'user', content: 'hi' }],
      maxTokens: 100,
    });
    expect(out).toBe('hello');
    expect(sdkMock.__create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-haiku-4-5', max_tokens: 100 }),
    );
    expect(metrics.trackClaudeUsage).toHaveBeenCalledWith('test/endpoint', expect.anything());
  });

  it('complete() maps model keys to registry ids', async () => {
    const { svc } = makeService();
    sdkMock.__create.mockResolvedValue(textResponse('x'));
    await svc.complete('e', { model: 'sonnet', messages: [], maxTokens: 10 });
    expect(sdkMock.__create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-sonnet-4-6' }),
    );
  });

  it('complete() serves from cache without calling the API', async () => {
    const { svc, cache } = makeService({ cacheHit: 'cached-answer' });
    const out = await svc.complete('e', {
      messages: [],
      maxTokens: 10,
      cacheKey: 'abc',
    });
    expect(out).toBe('cached-answer');
    expect(sdkMock.__create).not.toHaveBeenCalled();
    expect(cache.get).toHaveBeenCalledWith('claude:e:abc');
  });

  it('complete() stores fresh responses in cache with TTL', async () => {
    const { svc, cache } = makeService();
    sdkMock.__create.mockResolvedValue(textResponse('fresh'));
    await svc.complete('e', { messages: [], maxTokens: 10, cacheKey: 'k', cacheTtlSeconds: 60 });
    expect(cache.set).toHaveBeenCalledWith('claude:e:k', 'fresh', 60);
  });

  it('complete() retries once on 429/5xx and succeeds', async () => {
    const { svc } = makeService();
    sdkMock.__create
      .mockRejectedValueOnce(Object.assign(new Error('overloaded'), { status: 529 }))
      .mockResolvedValueOnce(textResponse('recovered'));
    const out = await svc.complete('e', { messages: [], maxTokens: 10 });
    expect(out).toBe('recovered');
    expect(sdkMock.__create).toHaveBeenCalledTimes(2);
  }, 10000);

  it('complete() does not retry on 4xx client errors', async () => {
    const { svc } = makeService();
    sdkMock.__create.mockRejectedValue(Object.assign(new Error('bad request'), { status: 400 }));
    await expect(svc.complete('e', { messages: [], maxTokens: 10 })).rejects.toThrow('bad request');
    expect(sdkMock.__create).toHaveBeenCalledTimes(1);
  });

  it('complete() throws when API key is missing (callers keep fallbacks)', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { svc } = makeService();
    await expect(svc.complete('e', { messages: [], maxTokens: 10 })).rejects.toThrow(
      'ANTHROPIC_API_KEY',
    );
  });

  it('hashKey is stable and input-sensitive', () => {
    expect(ClaudeService.hashKey('a', 1, 'b')).toBe(ClaudeService.hashKey('a', 1, 'b'));
    expect(ClaudeService.hashKey('a')).not.toBe(ClaudeService.hashKey('b'));
    expect(ClaudeService.hashKey('a').length).toBe(32);
  });
});
