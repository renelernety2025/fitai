'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authRegister } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { V2AuthLayout, V2Input, V2Button } from '@/components/v2/V2AuthLayout';

const LEVELS = [
  { value: 'BEGINNER', label: 'Začátečník' },
  { value: 'INTERMEDIATE', label: 'Pokročilý' },
  { value: 'ADVANCED', label: 'Expert' },
];

export default function RegisterV2Page() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authRegister({ name, email, password, level });
      login(res.accessToken, res.user);
      router.push('/onboarding-v2');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2AuthLayout>
      <div className="text-center">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          Začni
        </div>
        <h1
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.04em' }}
        >
          Vytvoř účet.
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-12 space-y-8">
        <V2Input label="Jméno" value={name} onChange={setName} placeholder="Jan Novák" required />
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
          placeholder="Min. 8 znaků"
          required
          minLength={8}
        />

        <div>
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Úroveň
          </div>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={`flex-1 rounded-full border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                  level === l.value
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/40'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[#FF375F]">{error}</p>}

        <div className="pt-4">
          <V2Button type="submit" disabled={loading} full>
            {loading ? 'Vytváření…' : 'Vytvořit účet →'}
          </V2Button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-white/40">
        Už máš účet?{' '}
        <Link href="/login-v2" className="text-white underline-offset-4 hover:underline">
          Přihlas se
        </Link>
      </p>
    </V2AuthLayout>
  );
}
