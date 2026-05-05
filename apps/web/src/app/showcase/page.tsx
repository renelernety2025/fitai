import { monthDays, weekChart } from '@fitai/shared';

export const metadata = {
  title: 'FitAI Showcase — Your Body, Your Power',
};

const PEACH = '#FFA38C';
const PEACH_DEEP = '#E15A6F';
const BLUE = '#6C70E6';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-[1400px] flex gap-6">
        <Sidebar />
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MonthActivityCard />
          </div>
          <div className="lg:col-span-7">
            <HeroCard />
          </div>
          <div className="lg:col-span-7">
            <WeekChartCard />
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <RunningCard />
            <HydrationCard />
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col items-center gap-4 py-2">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: PEACH }}
      >
        🏋️
      </div>
      <div className="flex flex-col gap-3 mt-4 px-2 py-3 rounded-2xl bg-white/[0.04] border border-white/10">
        {['🏠', '📊', '📅', '🎬'].map((icon, i) => (
          <button
            key={i}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${
              i === 0 ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-3 px-2 py-3 rounded-2xl bg-white/[0.04] border border-white/10">
        {['🔔', '⚙️'].map((icon, i) => (
          <button key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white/40 hover:bg-white/5">
            {icon}
          </button>
        ))}
      </div>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-200 to-pink-400 mt-2" />
    </aside>
  );
}

function HeroCard() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 md:p-10 min-h-[280px] md:min-h-[360px]"
      style={{ background: `linear-gradient(135deg, #FFB3A0 0%, ${PEACH_DEEP} 55%, #4D1F35 100%)` }}
    >
      <HeroDecoration />
      <h1 className="relative text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
        Your Body,
        <br />
        Your Power.
      </h1>
      <p className="relative text-white/85 text-sm md:text-base mt-4 leading-relaxed max-w-xs">
        Track your fitness journey with clarity and purpose.
      </p>
      <div className="relative flex items-center gap-3 mt-8">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-base">
          ✨
        </div>
        <div>
          <div className="text-white text-sm font-bold">AI-Powered</div>
          <div className="text-white/75 text-xs">Predict & Perform</div>
        </div>
      </div>
      <div className="absolute bottom-5 right-8 flex gap-1.5">
        <span className="w-5 h-1 rounded-full bg-white" />
        <span className="w-1.5 h-1 rounded-full bg-white/40" />
        <span className="w-1.5 h-1 rounded-full bg-white/40" />
      </div>
    </div>
  );
}

function HeroDecoration() {
  return (
    <svg className="absolute -right-10 -top-10 w-72 h-72 opacity-90" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="showcase-hero-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="80" r="80" fill="url(#showcase-hero-halo)" />
      <circle cx="170" cy="40" r="3" fill="#FFFFFF" opacity="0.6" />
      <circle cx="155" cy="65" r="2" fill="#FFFFFF" opacity="0.4" />
      <circle cx="180" cy="100" r="1.5" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

function MonthActivityCard() {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <div className="rounded-3xl p-6 md:p-7 bg-white/[0.04] border border-white/10 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg md:text-xl font-bold">Month activity</h2>
        <button className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white/60">
          ↗
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 mb-2">
        {labels.map((l) => (
          <div key={l} className="text-center text-xs font-semibold text-white/40">
            {l}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {monthDays.map((cell, i) => (
          <DayCell key={i} cell={cell} />
        ))}
      </div>
      <div className="flex gap-4 mt-6 pt-5 border-t border-white/10">
        <Stat label="Active time" value="4 h 32 m" />
        <Stat label="Recovery avg." value="17 hours" />
        <Stat label="Best day" value="Monday" />
      </div>
      <div className="mt-6">
        <ProgressRow icon="💧" label="Water" current="2.2 / 3.28 L" percent={67} tint="rgba(108, 112, 230, 0.18)" color={BLUE} />
        <div className="h-2" />
        <ProgressRow icon="🏃" label="Steps" current="6,000 / 12,000" percent={50} tint="rgba(255, 163, 140, 0.10)" color={PEACH_DEEP} />
        <div className="h-2" />
        <ProgressRow icon="⚡" label="Calories" current="1,420 / 1,680 Cal" percent={85} tint="rgba(255, 200, 100, 0.10)" color="#FFC470" />
      </div>
    </div>
  );
}

function DayCell({ cell }: { cell: (typeof monthDays)[number] }) {
  const highlighted = cell.highlighted;
  return (
    <div className="flex flex-col items-center py-1">
      <div
        className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition"
        style={{ backgroundColor: highlighted ? PEACH : 'transparent' }}
      >
        <span className={`text-sm font-medium ${highlighted ? 'text-[#1a0e10] font-bold' : cell.muted ? 'text-white/30' : 'text-white'}`}>
          {cell.day}
        </span>
      </div>
      <div className="flex gap-[3px] h-1.5 mt-1.5">
        {cell.activity ? (
          <>
            {Array.from({ length: cell.activity.workouts }).map((_, i) => (
              <span key={`w-${i}`} className="w-1 h-1 rounded-full" style={{ backgroundColor: PEACH_DEEP }} />
            ))}
            {Array.from({ length: cell.activity.recovery }).map((_, i) => (
              <span key={`r-${i}`} className="w-1 h-1 rounded-full" style={{ backgroundColor: BLUE }} />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-sm font-bold mt-1">{value}</div>
    </div>
  );
}

function ProgressRow({ icon, label, current, percent, tint, color }: {
  icon: string; label: string; current: string; percent: number; tint: string; color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
      <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${percent}%`, backgroundColor: tint }} />
      <div className="relative w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-base">{icon}</div>
      <div className="relative flex-1 min-w-0">
        <div className="text-sm font-bold">{label}</div>
        <div className="text-xs text-white/50">{current}</div>
      </div>
      <div className="relative text-sm font-extrabold" style={{ color }}>
        {percent}%
      </div>
    </div>
  );
}

function WeekChartCard() {
  const max = Math.max(...weekChart.flatMap((d) => [d.current, d.previous]));
  return (
    <div className="rounded-3xl p-6 md:p-7 bg-white/[0.04] border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-bold">This week</h2>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PEACH_DEEP }} />
          <span className="text-xs text-white/50">Last week</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 h-40">
        {weekChart.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center">
            <div className="flex items-end gap-1 h-32">
              <ChartBar value={d.previous} max={max} color="rgba(255,255,255,0.08)" />
              <ChartBar value={d.current} max={max} color={d.active ? PEACH_DEEP : PEACH} highlighted={d.active} />
            </div>
            <div className={`text-xs mt-2 ${d.active ? 'text-white font-bold' : 'text-white/40'}`}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartBar({ value, max, color, highlighted }: { value: number; max: number; color: string; highlighted?: boolean }) {
  const heightPct = max ? Math.max(value > 0 ? 6 : 0, (value / max) * 100) : 0;
  return (
    <div
      className="w-3 md:w-3.5 rounded-full transition-all"
      style={{
        height: `${heightPct}%`,
        backgroundColor: color,
        boxShadow: highlighted ? `0 0 16px ${PEACH_DEEP}80` : undefined,
      }}
    />
  );
}

function RunningCard() {
  return (
    <div className="rounded-3xl p-5 md:p-6 bg-white/[0.04] border border-white/10 min-h-[180px] flex flex-col">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(255, 200, 100, 0.16)' }}>
        ⚡
      </div>
      <div className="mt-auto">
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight">00:27</div>
        <div className="text-xs text-white/50 mt-1">Running</div>
      </div>
    </div>
  );
}

function HydrationCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 md:p-6 bg-white/[0.04] border border-white/10 min-h-[180px] flex flex-col">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(108, 112, 230, 0.18)' }}>
        💧
      </div>
      <div className="mt-auto relative z-10">
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight">1.08 L</div>
        <div className="text-xs text-white/50 mt-1">Hydration</div>
      </div>
      <HydrationWave />
    </div>
  );
}

function HydrationWave() {
  return (
    <svg className="absolute inset-x-0 bottom-0 w-full h-16" viewBox="0 0 200 48" preserveAspectRatio="none">
      <defs>
        <linearGradient id="showcase-hydration-wave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.5" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M0,24 Q50,8 100,20 T200,16 L200,48 L0,48 Z" fill="url(#showcase-hydration-wave)" />
      <path d="M0,32 Q50,18 100,28 T200,26 L200,48 L0,48 Z" fill={BLUE} fillOpacity="0.25" />
    </svg>
  );
}
