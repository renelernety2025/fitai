export interface SafetyRule {
    joint: string;
    exercisePattern: string;
    dangerMin: number;
    dangerMax: number;
    severity: 'warning' | 'critical';
    messageCs: string;
}
export declare const SAFETY_RULES: SafetyRule[];
export declare function checkSafetyRules(jointAngles: {
    joint: string;
    angle: number;
}[], exerciseName: string): {
    joint: string;
    measuredAngle: number;
    severity: 'warning' | 'critical';
    messageCs: string;
}[];
//# sourceMappingURL=safety-rules.d.ts.map