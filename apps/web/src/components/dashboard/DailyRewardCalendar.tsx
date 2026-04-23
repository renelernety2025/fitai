'use client';

import { useMemo } from 'react';

const REWARDS = [10, 15, 20, 30, 50, 75, 100];
const DAYS = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];

function todayKey(): string {
  return `fitai_login_day_${new Date().toISOString().slice(0, 10)}`;
}

function getLoginStreak(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `fitai_login_day_${d.toISOString().slice(0, 10)}`;
    if (localStorage.getItem(key)) streak++;
    else break;
  }
  return streak;
}

function markToday(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(todayKey(), '1');
}

export default function DailyRewardCalendar() {
  const streak = useMemo(() => {
    markToday();
    return getLoginStreak();
  }, []);

  const currentDayIndex = Math.min(streak, 7) - 1;

  return (
    <section className="mb-12">
      <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Denni odmeny
      </div>
      <div className="grid grid-cols-7 gap-2">
        {REWARDS.map((xp, i) => {
          const isPast = i < currentDayIndex;
          const isCurrent = i === currentDayIndex;
          const isFuture = i > currentDayIndex;

          return (
            <div
              key={i}
              className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                isCurrent
                  ? 'border-[#A8FF00]/40 bg-[#A8FF00]/10'
                  : isPast
                    ? 'border-white/15 bg-white/5'
                    : 'border-white/8'
              }`}
              style={isCurrent ? { boxShadow: '0 0 20px rgba(168,255,0,0.15)' } : undefined}
            >
              <span className="text-[10px] font-semibold text-white/40">{DAYS[i]}</span>
              {isPast && (
                <span className="text-lg text-[#A8FF00]">&#10003;</span>
              )}
              {isCurrent && (
                <span className="text-lg font-bold text-[#A8FF00]">&#9733;</span>
              )}
              {isFuture && (
                <span className="text-lg text-white/20">&#128274;</span>
              )}
              <span className={`text-[10px] font-bold tabular-nums ${
                isCurrent ? 'text-[#A8FF00]' : isPast ? 'text-white/50' : 'text-white/20'
              }`}>
                +{xp} XP
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
