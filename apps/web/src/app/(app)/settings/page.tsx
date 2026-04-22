'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { useAuth } from '@/lib/auth-context';
import { FadeIn } from '@/components/v2/motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken() {
  return typeof window !== 'undefined'
    ? localStorage.getItem('fitai_token')
    : null;
}

async function apiPut(path: string, body: Record<string, string>) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return res.json();
}

async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return res.json();
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = 'FitAI — Nastaveni';
  }, []);

  return (
    <V2Layout>
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white"
      >
        &larr; Profil
      </Link>

      <section className="pt-12 pb-16">
        <V2SectionLabel>Ucet</V2SectionLabel>
        <V2Display size="xl">Nastaveni</V2Display>
      </section>

      <FadeIn delay={0.1}>
        <NameSection currentName={user?.name || ''} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <PasswordSection />
      </FadeIn>

      <FadeIn delay={0.3}>
        <section className="mb-24">
          <V2SectionLabel>Uzitecne</V2SectionLabel>
          <Link
            href="/export"
            className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            Export dat
          </Link>
        </section>
      </FadeIn>

      <FadeIn delay={0.4}>
        <DeleteSection
          onDeleted={() => {
            logout();
            router.push('/login');
          }}
        />
      </FadeIn>
    </V2Layout>
  );
}

function NameSection({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      await apiPut('/users/me/name', { name });
      setMsg('Jmeno zmeneno');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-24">
      <V2SectionLabel>Zmena jmena</V2SectionLabel>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          className="w-full bg-transparent py-3 text-lg text-white transition focus:outline-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-30"
          >
            {loading ? 'Ukladam...' : 'Ulozit'}
          </button>
          {msg && (
            <span className="text-sm text-[#A8FF00]">{msg}</span>
          )}
        </div>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');
    if (newPw !== confirm) {
      setError('Hesla se neshoduji');
      return;
    }
    setLoading(true);
    try {
      await apiPut('/users/me/password', {
        currentPassword: current,
        newPassword: newPw,
      });
      setMsg('Heslo zmeneno');
      setCurrent('');
      setNewPw('');
      setConfirm('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-24">
      <V2SectionLabel>Zmena hesla</V2SectionLabel>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="password"
          placeholder="Soucasne heslo"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className="w-full bg-transparent py-3 text-lg text-white transition focus:outline-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
        <input
          type="password"
          placeholder="Nove heslo (min. 6 znaku)"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          required
          minLength={6}
          className="w-full bg-transparent py-3 text-lg text-white transition focus:outline-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
        <input
          type="password"
          placeholder="Potvrzeni noveho hesla"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          className="w-full bg-transparent py-3 text-lg text-white transition focus:outline-none"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-30"
          >
            {loading ? 'Menim...' : 'Zmenit heslo'}
          </button>
          {msg && <span className="text-sm text-[#A8FF00]">{msg}</span>}
          {error && <span className="text-sm text-[#FF375F]">{error}</span>}
        </div>
      </form>
    </section>
  );
}

function DeleteSection({ onDeleted }: { onDeleted: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      await apiDelete('/users/me');
      onDeleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-24">
      <V2SectionLabel>Nebezpecna zona</V2SectionLabel>
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="rounded-full border border-[#FF375F]/40 px-6 py-3 text-sm font-semibold text-[#FF375F] transition hover:border-[#FF375F] hover:bg-[#FF375F]/10"
        >
          Smazat ucet
        </button>
      ) : (
        <div className="max-w-md rounded-xl border border-[#FF375F]/30 bg-[#FF375F]/5 p-6">
          <p className="mb-4 text-sm text-white/70">
            Opravdu chcete smazat ucet? Tato akce je nevratna. Vsechna data
            budou trvale odstranen.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-full bg-[#FF375F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF375F]/80 disabled:opacity-30"
            >
              {loading ? 'Mazani...' : 'Ano, smazat'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
            >
              Zrusit
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-[#FF375F]">{error}</p>
          )}
        </div>
      )}
    </section>
  );
}
