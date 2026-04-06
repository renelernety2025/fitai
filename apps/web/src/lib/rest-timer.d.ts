export interface RestTimerCallbacks {
    onTick: (remainingSeconds: number) => void;
    onComplete: () => void;
}
export declare function createRestTimer(durationSeconds: number, callbacks: RestTimerCallbacks, voiceEnabled: boolean): {
    start: () => void;
    pause: () => void;
    reset: () => void;
    cancel: () => void;
};
//# sourceMappingURL=rest-timer.d.ts.map