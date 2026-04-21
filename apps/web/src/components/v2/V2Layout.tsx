'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme-context';

const PRIMARY_NAV: { href: string; label: string; tour?: string }[] = [
  { href: '/dashboard', label: 'Dnes' },
  { href: '/gym', label: 'Trénink', tour: 'nav-gym' },
  { href: '/vyziva', label: 'Výživa' },
  { href: '/habity', label: 'Habity' },
  { href: '/journal', label: 'Deník', tour: 'nav-journal' },
  { href: '/progress', label: 'Pokrok' },
  { href: '/ai-chat', label: 'AI Chat', tour: 'nav-ai-chat' },
  { href: '/calendar', label: 'Kalendář' },
  { href: '/season', label: 'Sezóna' },
  { href: '/leagues', label: 'Ligy', tour: 'nav-leagues' },
];

const MORE_NAV = [
  { href: '/micro-workout', label: 'Micro' },
  { href: '/sports', label: 'Sporty' },
  { href: '/exercises', label: 'Cviky' },
  { href: '/community', label: 'Komunita' },
  { href: '/gym-buddy', label: 'Trenak' },
  { href: '/messages', label: 'Zpravy' },
  { href: '/lekce', label: 'Lekce' },
  { href: '/uspechy', label: 'Úspěchy' },
  { href: '/progres-fotky', label: 'Fotky' },
  { href: '/recepty', label: 'Recepty' },
  { href: '/jidelnicek', label: 'Jídelníček' },
  { href: '/export', label: 'Export' },
  { href: '/wrapped', label: 'Wrapped' },
  { href: '/skill-tree', label: 'Skills' },
  { href: '/body-portfolio', label: 'Portfolio' },
  { href: '/bloodwork', label: 'Krev' },
  { href: '/rehab', label: 'Rehab' },
  { href: '/marketplace', label: 'Market' },
  { href: '/boss-fights', label: 'Aréna' },
  { href: '/discover-weekly', label: 'Objev' },
  { href: '/gym-finder', label: 'Gymy' },
];

function MoreDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isMoreActive = MORE_NAV.some((i) => pathname === i.href);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="transition hover:opacity-80"
        style={isMoreActive ? { color: 'var(--text-primary)' } : undefined}
      >
        Vice...
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 grid max-h-[70vh] w-56 grid-cols-2 gap-1 overflow-y-auto rounded-lg p-2 shadow-xl backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-strong)' }}
        >
          {MORE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1.5 text-[12px] transition"
              style={{
                color: pathname === item.href ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="transition"
      style={{ color: 'var(--text-muted)' }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export function V2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, var(--gradient-accent) 0%, var(--gradient-base) 60%)',
        }}
      />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          FitAI
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] font-medium sm:flex" style={{ color: 'var(--text-secondary)' }}>
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              {...(item.tour ? { 'data-tour': item.tour } : {})}
              className="transition hover:opacity-80"
              style={pathname === item.href ? { color: 'var(--text-primary)' } : undefined}
            >
              {item.label}
            </Link>
          ))}
          <div data-tour="nav-more">
            <MoreDropdown pathname={pathname} />
          </div>
        </nav>
        <div className="hidden items-center gap-4 sm:flex">
          <ThemeToggle />
          <Link href="/notifications" style={{ color: 'var(--text-muted)' }} className="transition hover:opacity-80" title="Notifikace">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </Link>
          <Link href="/profile" style={{ color: 'var(--text-muted)' }} className="transition hover:opacity-80" title="Profil">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-32">{children}</main>
    </div>
  );
}

export function V2SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
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
      className="font-bold tracking-tight"
      style={{ fontSize, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--text-primary)' }}
    >
      {children}
    </div>
  );
}

export function V2Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div
        className="font-bold tracking-tight tabular-nums"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)' }}
      >
        {typeof value === 'number' ? value.toLocaleString('cs-CZ') : value}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
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
            className="font-bold tracking-tight tabular-nums"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}
          >
            {value.toLocaleString('cs-CZ')}
          </div>
          {unit && (
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              of {total.toLocaleString('cs-CZ')} {unit}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  );
}
