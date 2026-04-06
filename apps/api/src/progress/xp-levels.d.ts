export declare const XP_LEVELS: readonly [{
    readonly level: 1;
    readonly minXP: 0;
    readonly name: "Začátečník";
}, {
    readonly level: 2;
    readonly minXP: 200;
    readonly name: "Pokročilý";
}, {
    readonly level: 3;
    readonly minXP: 500;
    readonly name: "Expert";
}, {
    readonly level: 4;
    readonly minXP: 1000;
    readonly name: "Mistr";
}, {
    readonly level: 5;
    readonly minXP: 2000;
    readonly name: "Legenda";
}];
export declare function getLevelForXP(xp: number): {
    readonly level: 1;
    readonly minXP: 0;
    readonly name: "Začátečník";
} | {
    readonly level: 2;
    readonly minXP: 200;
    readonly name: "Pokročilý";
} | {
    readonly level: 3;
    readonly minXP: 500;
    readonly name: "Expert";
} | {
    readonly level: 4;
    readonly minXP: 1000;
    readonly name: "Mistr";
} | {
    readonly level: 5;
    readonly minXP: 2000;
    readonly name: "Legenda";
};
//# sourceMappingURL=xp-levels.d.ts.map