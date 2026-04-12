import { Injectable, Logger } from '@nestjs/common';

export type ElevenLabsOutputFormat = 'mp3_44100_128' | 'pcm_16000';

export interface SynthesizeOptions {
  outputFormat?: ElevenLabsOutputFormat;
}

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  private apiKey: string;
  private voiceId: string;
  private cache = new Map<string, string>(); // `${outputFormat}:${text}` → audioBase64

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default multilingual voice
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async synthesize(
    text: string,
    options: SynthesizeOptions = {},
  ): Promise<{ audioBase64: string } | null> {
    if (!this.apiKey) {
      this.logger.warn('No ELEVENLABS_API_KEY — skipping TTS');
      return null;
    }

    const outputFormat: ElevenLabsOutputFormat = options.outputFormat ?? 'mp3_44100_128';
    const cacheKey = `${outputFormat}:${text}`;

    // Check cache (keyed by format so MP3 and PCM variants don't collide)
    const cached = this.cache.get(cacheKey);
    if (cached) return { audioBase64: cached };

    try {
      const url =
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}` +
        `?output_format=${outputFormat}`;
      const accept = outputFormat === 'pcm_16000' ? 'audio/pcm' : 'audio/mpeg';

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': accept,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          language_code: 'cs',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.2,
          },
        }),
      });

      if (!res.ok) {
        this.logger.error(`ElevenLabs error: ${res.status} ${await res.text()}`);
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const audioBase64 = buffer.toString('base64');

      // Cache short phrases (under 50 chars)
      if (text.length < 50) {
        this.cache.set(cacheKey, audioBase64);
        // Limit cache size
        if (this.cache.size > 200) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
      }

      return { audioBase64 };
    } catch (err: any) {
      this.logger.error(`ElevenLabs synthesis failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Streaming variant of synthesize — yields raw PCM chunks as they arrive
   * from ElevenLabs instead of buffering the full audio blob. Target: first
   * audio byte <500ms after the request. Used by the /coaching/ask-stream
   * pipeline (Phase E-2) to interleave Claude text tokens with audio
   * chunks on the same SSE output.
   *
   * Always PCM 16 kHz mono int16 to match the iOS VoiceProcessingIO hw
   * format. `optimize_streaming_latency=3` trades a bit of quality for
   * ~300ms lower first-byte latency per ElevenLabs docs.
   */
  async *synthesizeStream(text: string): AsyncGenerator<Buffer> {
    if (!this.apiKey) {
      this.logger.warn('No ELEVENLABS_API_KEY — skipping TTS stream');
      return;
    }
    const url =
      `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream` +
      `?optimize_streaming_latency=3&output_format=pcm_16000`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/pcm',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'cs',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.2,
        },
      }),
    });

    if (!res.ok || !res.body) {
      this.logger.error(`ElevenLabs stream error: ${res.status} ${await res.text()}`);
      return;
    }

    // Node 18+ fetch body is a web ReadableStream; read it chunk-by-chunk.
    // Each chunk is a Uint8Array of raw PCM bytes; upstream callers
    // base64-encode for the SSE wire.
    const reader = res.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.length > 0) {
          yield Buffer.from(value);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async precacheCommonPhrases() {
    const phrases = [
      'Výborně!', 'Skvělé!', 'Perfektní!', 'Super forma!',
      'Pokračuj!', 'Drž!', 'Nahoru!', 'Dolů!',
      'Set hotový!', 'Odpočinek.',
      'Pozor!', 'Narovnej záda!', 'Kolena ven!',
      'Jdeme na to!', 'Poslední rep!',
      ...Array.from({ length: 20 }, (_, i) => `${i + 1}`),
    ];

    let cached = 0;
    for (const phrase of phrases) {
      const result = await this.synthesize(phrase);
      if (result) cached++;
    }
    this.logger.log(`Pre-cached ${cached}/${phrases.length} phrases`);
    return { cached, total: phrases.length };
  }
}
