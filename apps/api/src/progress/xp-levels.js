export const XP_LEVELS = [
    { level: 1, minXP: 0, name: 'Začátečník' },
    { level: 2, minXP: 200, name: 'Pokročilý' },
    { level: 3, minXP: 500, name: 'Expert' },
    { level: 4, minXP: 1000, name: 'Mistr' },
    { level: 5, minXP: 2000, name: 'Legenda' },
];
export function getLevelForXP(xp) {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
        if (xp >= XP_LEVELS[i].minXP)
            return XP_LEVELS[i];
    }
    return XP_LEVELS[0];
}
//# sourceMappingURL=xp-levels.js.map