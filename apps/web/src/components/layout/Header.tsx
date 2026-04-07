'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-800 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            FitAI
          </Link>
          <nav className="flex gap-4">
            <Link href="/videos" className="text-sm text-gray-400 transition hover:text-white">Videa</Link>
            <Link href="/exercises" className="text-sm text-gray-400 transition hover:text-white">Cviky</Link>
            <Link href="/plans" className="text-sm text-gray-400 transition hover:text-white">Plány</Link>
            <Link href="/ai-coach" className="text-sm text-[#F59E0B] transition hover:text-yellow-300">AI Trenér</Link>
            <Link href="/lekce" className="text-sm text-gray-400 transition hover:text-white">Lekce</Link>
            <Link href="/slovnik" className="text-sm text-gray-400 transition hover:text-white">Slovník</Link>
            <Link href="/community" className="text-sm text-gray-400 transition hover:text-white">Komunita</Link>
            <Link href="/progress" className="text-sm text-gray-400 transition hover:text-white">Progres</Link>
          </nav>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a34a] text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm text-gray-400 sm:block">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition hover:border-gray-500 hover:text-white"
            >
              Odhlásit
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
