import type { ChoreographyJson, PoseCheckpoint } from '@fitai/shared';
export declare function loadChoreography(choreographyUrl: string | null): Promise<ChoreographyJson>;
export declare function getCurrentCheckpoint(choreography: ChoreographyJson | null, currentTimeSeconds: number): PoseCheckpoint | null;
//# sourceMappingURL=choreography.d.ts.map