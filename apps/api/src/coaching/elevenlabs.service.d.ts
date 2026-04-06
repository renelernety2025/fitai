export declare class ElevenLabsService {
    private readonly logger;
    private apiKey;
    private voiceId;
    private cache;
    constructor();
    isAvailable(): boolean;
    synthesize(text: string): Promise<{
        audioBase64: string;
    } | null>;
    precacheCommonPhrases(): Promise<{
        cached: number;
        total: number;
    }>;
}
//# sourceMappingURL=elevenlabs.service.d.ts.map