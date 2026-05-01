'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Logo } from '@/components/v3';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-0)' }} />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      login(res.accessToken, res.user);
      const redirect = searchParams.get('redirect');
      const safeRedirect =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/dashboard';
      router.push(safeRedirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      {/* Left — hero image */}
      <div className="login-hero">
        <img
          src="https://images.unsplash.com/photo-1502904550040-7534597429ae?w=2400&q=85&auto=format&fit=crop"
          alt=""
          className="login-hero__img"
        />
        <div className="login-hero__overlay" />
        <div className="login-hero__content">
          <Logo size={22} />
          <div>
            <p className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16 }}>
              &#9670; Welcome back
            </p>
            <h2 className="v3-display-2" style={{ maxWidth: 480 }}>
              Today&apos;s training<br />
              <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>
                is waiting for you.
              </span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Sara &middot; Morning run &middot; Stockholm
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-form-wrap">
        <div className="login-form">
          <h1 className="v3-display-3" style={{ marginBottom: 8 }}>Sign in</h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 14 }}>
            New here?{' '}
            <Link href="/register" style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>
              Start free &rarr;
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <FormInput
                label="Email"
                type="email"
                placeholder="sara@example.com"
                value={email}
                onChange={setEmail}
              />
              <FormInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <div className="login-meta-row">
              <span />
              <Link href="/forgot-password" style={{ color: 'var(--text-2)', fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>

            <Button variant="accent" size="lg" full type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in \u2192'}
            </Button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <Link href="/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and{' '}
            <Link href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{loginStyles}</style>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function FormInput({ label, type = 'text', placeholder, value, onChange }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="login-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="login-input"
          required
        />
        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-3)',
              cursor: 'pointer', fontSize: 13, padding: 4,
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const loginStyles = `
.login-split{display:grid;grid-template-columns:3fr 2fr;min-height:100vh;min-height:100dvh;background:var(--bg-0)}
.login-hero{position:relative;overflow:hidden}
.login-hero__img{width:100%;height:100%;object-fit:cover;filter:saturate(.85) brightness(.9)}
.login-hero__overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,9,7,.3) 0%,rgba(11,9,7,.7) 100%)}
.login-hero__content{position:absolute;inset:0;padding:56px;display:flex;flex-direction:column;justify-content:space-between}
.login-form-wrap{display:flex;align-items:center;justify-content:center;padding:56px 40px}
.login-form{width:100%;max-width:420px}
.login-label{display:block;font-size:11px;color:var(--text-3);letter-spacing:.08em;text-transform:uppercase;font-weight:600;margin-bottom:8px}
.login-input{width:100%;height:48px;padding:0 16px;background:var(--bg-2);border:1px solid var(--stroke-2);border-radius:var(--r-sm);color:var(--text-1);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
.login-input:focus{border-color:var(--accent);box-shadow:0 0 0 2px rgba(232,93,44,.15)}
.login-input::placeholder{color:var(--text-3)}
.login-meta-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;font-size:12px}
@media(max-width:768px){
  .login-split{grid-template-columns:1fr}
  .login-hero{display:none}
  .login-form-wrap{padding:40px 24px;min-height:100vh;min-height:100dvh}
}
`;
