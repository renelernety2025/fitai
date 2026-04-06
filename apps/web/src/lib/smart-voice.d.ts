type Priority = 'safety' | 'correction' | 'encouragement' | 'info';
export declare function initSmartVoice(): void;
export declare function setAudioDuckingTarget(videoElement: HTMLVideoElement): void;
export declare function speakCoaching(text: string, priority: Priority, audioBase64?: string | null): void;
export declare function speakRepCount(count: number): void;
export declare function cleanup(): void;
export {};
//# sourceMappingURL=smart-voice.d.ts.map