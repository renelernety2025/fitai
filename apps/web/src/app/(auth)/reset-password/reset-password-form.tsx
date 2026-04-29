'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { V2AuthLayout, V2Input, V2Button } from '@/components/v2/V2AuthLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-0)' }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Hesla se neshoduji');
      return;
    }
    if (!token) {
      setError('Chybi token pro reset');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Request failed');
      }
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2AuthLayout>
      <div className="text-center">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          Obnova hesla
        </div>
        <h1
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.04em' }}
        >
          Nove heslo
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-8">
        <V2Input
          label="Nove heslo"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Min. 6 znaku"
          required
          minLength={6}
        />
        <V2Input
          label="Potvrzeni hesla"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Zopakuj heslo"
          required
          minLength={6}
        />

        {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

        <div className="pt-4">
          <V2Button type="submit" disabled={loading} full>
            {loading ? 'Menim heslo...' : 'Nastavit nove heslo'}
          </V2Button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-white/40">
        <Link href="/login" className="text-white underline-offset-4 hover:underline">
          Zpet na prihlaseni
        </Link>
      </p>
    </V2AuthLayout>
  );
}
