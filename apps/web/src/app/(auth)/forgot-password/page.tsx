'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { V2AuthLayout, V2Input, V2Button } from '@/components/v2/V2AuthLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Request failed');
      }
      setSent(true);
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
          Zapomenuté heslo
        </h1>
      </div>

      {sent ? (
        <div className="mt-12 text-center">
          <p className="text-base text-white/60">
            Pokud ucet existuje, poslali jsme odkaz na reset hesla.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="text-sm text-white underline-offset-4 hover:underline"
            >
              Zpet na prihlaseni
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-12 space-y-8">
          <V2Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tvuj@email.cz"
            required
          />

          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="pt-4">
            <V2Button type="submit" disabled={loading} full>
              {loading ? 'Odesilam...' : 'Odeslat odkaz'}
            </V2Button>
          </div>
        </form>
      )}

      <p className="mt-10 text-center text-sm text-white/40">
        <Link href="/login" className="text-white underline-offset-4 hover:underline">
          Zpet na prihlaseni
        </Link>
      </p>
    </V2AuthLayout>
  );
}
