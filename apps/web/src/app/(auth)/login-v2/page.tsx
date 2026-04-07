'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { V2AuthLayout, V2Input, V2Button } from '@/components/v2/V2AuthLayout';

export default function LoginV2Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      login(res.accessToken, res.user);
      router.push('/dashboard-v2');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2AuthLayout>
      <div className="text-center">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          Vítej zpět
        </div>
        <h1
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.04em' }}
        >
          Přihlas se.
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-8">
        <V2Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tvuj@email.cz"
          required
        />
        <V2Input
          label="Heslo"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />

        {error && <p className="text-sm text-[#FF375F]">{error}</p>}

        <div className="pt-4">
          <V2Button type="submit" disabled={loading} full>
            {loading ? 'Přihlašování…' : 'Pokračovat →'}
          </V2Button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-white/40">
        Nemáš účet?{' '}
        <Link href="/register-v2" className="text-white underline-offset-4 hover:underline">
          Vytvoř si ho
        </Link>
      </p>
    </V2AuthLayout>
  );
}
