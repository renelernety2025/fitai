'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dnes' },
  { href: '/gym', label: 'Trénink' },
  { href: '/micro-workout', label: 'Micro' },
  { href: '/sports', label: 'Sporty' },
  { href: '/vyziva', label: 'Výživa' },
  { href: '/habity', label: 'Habity' },
  { href: '/lekce', label: 'Lekce' },
  { href: '/progress', label: 'Pokrok' },
  { href: '/uspechy', label: 'Úspěchy' },
  { href: '/progres-fotky', label: 'Fotky' },
  { href: '/jidelnicek', label: 'Jídelníček' },
];

export function V2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(255, 55, 95, 0.06) 0%, rgba(0, 0, 0, 1) 60%)',
        }}
      />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight">
          FitAI
        </Link>
        <nav className="hidden gap-7 text-[13px] font-medium text-white/55 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition hover:text-white ${
                pathname === item.href ? 'text-white' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-32">{children}</main>
    </div>
  );
}

export function V2SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
      {children}
    </div>
  );
}

export function V2Display({
  children,
  size = 'lg',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const fontSize =
    size === 'xl'
      ? 'clamp(3rem, 7vw, 6rem)'
      : size === 'lg'
      ? 'clamp(2rem, 5vw, 4rem)'
      : size === 'md'
      ? 'clamp(1.75rem, 4vw, 3rem)'
      : 'clamp(1.5rem, 3vw, 2.25rem)';
  return (
    <div
      className="font-bold tracking-tight text-white"
      style={{ fontSize, letterSpacing: '-0.04em', lineHeight: 1 }}
    >
      {children}
    </div>
  );
}

export function V2Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div
        className="font-bold tracking-tight tabular-nums text-white"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
      >
        {typeof value === 'number' ? value.toLocaleString('cs-CZ') : value}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
    </div>
  );
}

export function V2Ring({
  value,
  total,
  size = 200,
  color = '#FF375F',
  label,
  unit,
}: {
  value: number;
  total: number;
  size?: number;
  color?: string;
  label: string;
  unit?: string;
}) {
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, total > 0 ? value / total : 0));
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeOpacity={0.13}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{
              filter: `drop-shadow(0 0 ${stroke * 0.7}px ${color})`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-bold tracking-tight tabular-nums text-white"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.04em' }}
          >
            {value.toLocaleString('cs-CZ')}
          </div>
          {unit && (
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
              of {total.toLocaleString('cs-CZ')} {unit}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
        {label}
      </div>
    </div>
  );
}
