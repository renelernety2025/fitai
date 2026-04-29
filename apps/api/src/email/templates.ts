const STYLE = {
  bg: '#0B0907',
  text: '#F5EDE0',
  muted: '#BFB4A2',
  dim: '#847B6B',
  accent: '#E85D2C',
  clay: '#D4A88C',
  font: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serif: 'Georgia, serif',
} as const;

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${STYLE.bg};color:${STYLE.text};font-family:${STYLE.font};">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
${content}
<p style="color:${STYLE.dim};font-size:12px;margin-top:40px;border-top:1px solid ${STYLE.dim};padding-top:16px;">
  FitAI &middot; fitai.bfevents.cz
</p>
</div>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background:${STYLE.accent};color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">${label}</a>`;
}

export function welcomeTemplate(name: string): string {
  return wrapper(`
<h1 style="font-family:${STYLE.serif};font-size:28px;font-weight:400;">
  Welcome to FitAI, <em style="color:${STYLE.clay};">${name}.</em>
</h1>
<p style="color:${STYLE.muted};line-height:1.6;">
  Your AI coach is ready. Start your first workout and discover what personalized training feels like.
</p>
${cta('https://fitai.bfevents.cz/dashboard', 'Start training &rarr;')}
`);
}

export function passwordResetTemplate(resetUrl: string): string {
  return wrapper(`
<h1 style="font-family:${STYLE.serif};font-size:28px;font-weight:400;">
  Password reset
</h1>
<p style="color:${STYLE.muted};line-height:1.6;">
  Click the button below to set a new password. This link expires in 1 hour.
</p>
${cta(resetUrl, 'Reset password &rarr;')}
<p style="color:${STYLE.dim};font-size:13px;margin-top:24px;">
  If you did not request this, you can safely ignore this email.
</p>
`);
}

export function weeklyDigestTemplate(
  name: string,
  stats: {
    workouts?: number;
    totalMinutes?: number;
    streak?: number;
    xp?: number;
  },
): string {
  const rows = [
    stats.workouts != null
      ? `<li>Workouts completed: <strong>${stats.workouts}</strong></li>`
      : '',
    stats.totalMinutes != null
      ? `<li>Total training time: <strong>${stats.totalMinutes} min</strong></li>`
      : '',
    stats.streak != null
      ? `<li>Current streak: <strong>${stats.streak} days</strong></li>`
      : '',
    stats.xp != null
      ? `<li>XP earned: <strong>+${stats.xp}</strong></li>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return wrapper(`
<h1 style="font-family:${STYLE.serif};font-size:28px;font-weight:400;">
  Your week, <em style="color:${STYLE.clay};">${name}.</em>
</h1>
<ul style="color:${STYLE.muted};line-height:2;padding-left:20px;">
  ${rows || '<li>No activity this week &mdash; let\'s change that!</li>'}
</ul>
${cta('https://fitai.bfevents.cz/dashboard', 'Plan next week &rarr;')}
`);
}

export function streakWarningTemplate(
  name: string,
  streak: number,
): string {
  return wrapper(`
<h1 style="font-family:${STYLE.serif};font-size:28px;font-weight:400;">
  Don't break it, <em style="color:${STYLE.clay};">${name}!</em>
</h1>
<p style="color:${STYLE.muted};line-height:1.6;">
  You have a <strong style="color:${STYLE.accent};">${streak}-day streak</strong>.
  One quick workout today keeps it alive.
</p>
${cta('https://fitai.bfevents.cz/micro-workout', 'Quick 5-min workout &rarr;')}
`);
}

export function achievementUnlockedTemplate(
  name: string,
  achievement: string,
): string {
  return wrapper(`
<h1 style="font-family:${STYLE.serif};font-size:28px;font-weight:400;">
  New achievement unlocked!
</h1>
<p style="color:${STYLE.muted};line-height:1.6;">
  Congratulations <em style="color:${STYLE.clay};">${name}</em>,
  you earned <strong style="color:${STYLE.accent};">${achievement}</strong>.
</p>
${cta('https://fitai.bfevents.cz/uspechy', 'View achievements &rarr;')}
`);
}
