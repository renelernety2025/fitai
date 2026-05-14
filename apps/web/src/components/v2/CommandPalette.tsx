'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PaletteItem {
  label: string;
  href: string;
  group: string;
}

const PAGES: PaletteItem[] = [
  // Primary navigation
  { label: 'Dnes (Dashboard)', href: '/dashboard', group: 'Navigace' },
  { label: 'Trenink', href: '/gym', group: 'Navigace' },
  { label: 'Vyziva', href: '/vyziva', group: 'Navigace' },
  { label: 'Habity', href: '/habity', group: 'Navigace' },
  { label: 'Denik (Journal)', href: '/journal', group: 'Navigace' },
  { label: 'Pokrok', href: '/progress', group: 'Navigace' },
  { label: 'AI Chat', href: '/ai-chat', group: 'Navigace' },
  { label: 'Kalendar', href: '/calendar', group: 'Navigace' },
  { label: 'Sezona (Battle Pass)', href: '/season', group: 'Navigace' },
  { label: 'Ligy', href: '/leagues', group: 'Navigace' },
  // More nav
  { label: 'Duely', href: '/duels', group: 'Stranky' },
  { label: 'Squad', href: '/squads', group: 'Stranky' },
  { label: 'Clips', href: '/clips', group: 'Stranky' },
  { label: 'Zazitky (Experiences)', href: '/experiences', group: 'Stranky' },
  { label: 'Treneri', href: '/trainers', group: 'Stranky' },
  { label: 'Drops', href: '/drops', group: 'Stranky' },
  { label: 'VIP', href: '/vip', group: 'Stranky' },
  { label: 'Micro Workout', href: '/micro-workout', group: 'Stranky' },
  { label: 'Cviky', href: '/exercises', group: 'Stranky' },
  { label: 'Komunita', href: '/community', group: 'Stranky' },
  { label: 'Gym Buddy (Trenak)', href: '/gym-buddy', group: 'Stranky' },
  { label: 'Zpravy', href: '/messages', group: 'Stranky' },
  { label: 'Rekordy', href: '/records', group: 'Stranky' },
  { label: 'Suplementy', href: '/supplements', group: 'Stranky' },
  { label: 'Gear', href: '/gear', group: 'Stranky' },
  { label: 'Servis (Maintenance)', href: '/maintenance', group: 'Stranky' },
  { label: 'AI Notes', href: '/coaching-notes', group: 'Stranky' },
  { label: 'Rutina (Routine Builder)', href: '/routine-builder', group: 'Stranky' },
  { label: 'Balicky', href: '/bundles', group: 'Stranky' },
  { label: 'Wishlist', href: '/wishlist', group: 'Stranky' },
  { label: 'Streaky', href: '/streaks', group: 'Stranky' },
  { label: 'Playlisty', href: '/playlists', group: 'Stranky' },
  { label: 'Lekce', href: '/lekce', group: 'Stranky' },
  { label: 'Uspechy', href: '/uspechy', group: 'Stranky' },
  { label: 'Progres Fotky', href: '/progres-fotky', group: 'Stranky' },
  { label: 'Recepty', href: '/recepty', group: 'Stranky' },
  { label: 'Jidelnicek', href: '/jidelnicek', group: 'Stranky' },
  { label: 'Export', href: '/export', group: 'Stranky' },
  { label: 'Wrapped', href: '/wrapped', group: 'Stranky' },
  { label: 'Skill Tree', href: '/skill-tree', group: 'Stranky' },
  { label: 'Body Portfolio', href: '/body-portfolio', group: 'Stranky' },
  { label: 'Krev (Bloodwork)', href: '/bloodwork', group: 'Stranky' },
  { label: 'Rehab', href: '/rehab', group: 'Stranky' },
  { label: 'Marketplace', href: '/marketplace', group: 'Stranky' },
  { label: 'Arena (Boss Fights)', href: '/boss-fights', group: 'Stranky' },
  { label: 'Objev (Discover Weekly)', href: '/discover-weekly', group: 'Stranky' },
  { label: 'Gym Finder', href: '/gym-finder', group: 'Stranky' },
  // Additional pages
  { label: 'Profil', href: '/profile', group: 'Stranky' },
  { label: 'Notifikace', href: '/notifications', group: 'Stranky' },
  { label: 'Doma (Home Training)', href: '/doma', group: 'Stranky' },
  { label: 'AI Coach', href: '/ai-coach', group: 'Stranky' },
  { label: 'Slovnik', href: '/slovnik', group: 'Stranky' },
  { label: 'Plany', href: '/plans', group: 'Stranky' },
  // Quick actions
  { label: 'Novy trenink', href: '/gym', group: 'Rychle akce' },
  { label: 'Pridat jidlo', href: '/vyziva', group: 'Rychle akce' },
  { label: 'Denni check-in', href: '/habity', group: 'Rychle akce' },
  { label: 'Zeptat se AI', href: '/ai-chat', group: 'Rychle akce' },
];

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? PAGES.filter((p) => fuzzyMatch(query, p.label) || fuzzyMatch(query, p.href))
    : PAGES;

  const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const navigate = useCallback((href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  }, [router]);

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatFiltered[activeIndex]) {
      navigate(flatFiltered[activeIndex].href);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        style={{ animation: 'fadeIn 0.15s ease-out both' }}
        onClick={() => setOpen(false)}
      />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-strong)',
          animation: 'scaleIn 0.15s ease-out both',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hledat stranky, akce..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            ESC
          </kbd>
        </div>
        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto px-2 py-2">
          {flatFiltered.length === 0 && (
            <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Nic nenalezeno
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div
                className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--text-muted)' }}
              >
                {group}
              </div>
              {items.map((item) => {
                const idx = flatFiltered.indexOf(item);
                return (
                  <button
                    key={item.href + item.label}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                    style={{
                      backgroundColor: idx === activeIndex ? 'var(--bg-surface-hover)' : 'transparent',
                      color: idx === activeIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {item.href}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {/* Footer hint */}
        <div
          className="flex items-center justify-center gap-4 border-t px-4 py-2 text-[11px]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>
            <kbd className="rounded px-1 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              ↑↓
            </kbd>{' '}
            navigace
          </span>
          <span>
            <kbd className="rounded px-1 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              ↵
            </kbd>{' '}
            otevrit
          </span>
          <span>
            <kbd className="rounded px-1 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              ⌘K
            </kbd>{' '}
            prepnout
          </span>
        </div>
      </div>
    </div>
  );
}
