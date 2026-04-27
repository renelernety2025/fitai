'use client';

interface WeekStripProps {
  weeklyActivity: { date: string; minutes: number }[];
}

const DAY_LABELS = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];

function getWeekDays(): { label: string; dateStr: string; isToday: boolean }[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === now.toISOString().slice(0, 10);
    return { label, dateStr, isToday };
  });
}

export default function WeekStrip({ weeklyActivity }: WeekStripProps) {
  const days = getWeekDays();
  const activityMap = new Map(
    (weeklyActivity || []).map((a) => [a.date, a.minutes]),
  );

  return (
    <div
      style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '8px 0',
      }}
    >
      {days.map((day) => {
        const minutes = activityMap.get(day.dateStr) || 0;
        const trained = minutes > 0;
        const isPast = day.dateStr < new Date().toISOString().slice(0, 10);

        return (
          <div
            key={day.dateStr}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6, minWidth: 44,
            }}
          >
            <span
              className="v3-caption"
              style={{
                color: day.isToday ? 'var(--accent)' : 'var(--text-3)',
                fontWeight: day.isToday ? 700 : 500,
              }}
            >
              {day.label}
            </span>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: day.isToday
                  ? '2px solid var(--accent)'
                  : '1px solid var(--stroke-1)',
                background: trained
                  ? 'var(--accent)'
                  : 'transparent',
                color: trained ? '#000' : 'var(--text-3)',
                fontSize: 11, fontWeight: 600,
                transition: 'all .2s ease',
              }}
            >
              {trained ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : isPast ? (
                <span style={{ fontSize: 10, opacity: 0.4 }}>&mdash;</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
