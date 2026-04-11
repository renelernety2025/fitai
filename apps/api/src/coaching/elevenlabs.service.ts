import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  private apiKey: string;
  private voiceId: string;
  private cache = new Map<string, string>(); // text → audioUrl

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default multilingual voice
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async synthesize(text: string): Promise<{ audioBase64: string } | null> {
    if (!this.apiKey) {
      this.logger.warn('No ELEVENLABS_API_KEY — skipping TTS');
      return null;
    }

    // Check cache
    const cached = this.cache.get(text);
    if (cached) return { audioBase64: cached };

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
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
        this.cache.set(text, audioBase64);
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
