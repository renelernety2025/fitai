'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Logo } from '@/components/v3';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
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
      router.push(redirect || '/dashboard');
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
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="login-checkbox__box" />
                Remember me
              </label>
              <Link href="/forgot-password" style={{ color: 'var(--text-2)', fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>

            <Button variant="accent" size="lg" full type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in \u2192'}
            </Button>
          </form>

          <div className="login-divider">
            <div className="login-divider__line" />
            <span className="login-divider__text">or</span>
            <div className="login-divider__line" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="ghost" size="lg" full icon={<AppleIcon />}>
              Continue with Apple
            </Button>
            <Button variant="ghost" size="lg" full icon={<GoogleIcon />}>
              Continue with Google
            </Button>
          </div>

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
  return (
    <div>
      <label className="login-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="login-input"
        required
      />
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.15 12.32c-.36.8-.78 1.54-1.27 2.2-.67.9-1.21 1.53-1.64 1.87-.65.56-1.35.85-2.1.87-.54 0-1.18-.15-1.94-.46-.76-.31-1.46-.46-2.1-.46-.67 0-1.39.15-2.16.46C.18 17.12-.36 17.27-.72 17.27c-.7.02-1.42-.28-2.14-.92-.46-.37-1.04-1.02-1.73-1.94-.74-1-1.35-2.15-1.83-3.46C-6.94 9.55-7.2 8.2-7.2 6.9c0-1.5.32-2.8.97-3.87.51-.86 1.19-1.54 2.04-2.04A5.5 5.5 0 0 1-1.44.2c.57 0 1.32.18 2.25.52.93.34 1.52.52 1.79.52.2 0 .85-.2 1.94-.62 1.03-.38 1.9-.54 2.61-.48 1.93.16 3.38.92 4.34 2.3-1.73 1.05-2.58 2.51-2.56 4.4.02 1.47.55 2.69 1.58 3.67.47.45 1 .79 1.58 1.03-.13.37-.26.73-.4 1.08zM8.23.32C8.23.5 8.2.7 8.17.9a6.47 6.47 0 0 1-1.72 3.37C5.55 5.27 4.5 5.78 3.34 5.87c-.02-.18-.03-.38-.03-.58 0-1.13.41-2.34 1.24-3.37.41-.52.94-.96 1.58-1.3C6.77.28 7.38.07 7.95 0c.02.11.04.22.05.32z" transform="translate(3.5 -0.5) scale(0.75)" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.7 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.2 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 5.7 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.2 0-9.7-2.8-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.7 39.5 44 34 44 24c0-1.3-.2-2.7-.4-3.9z" />
    </svg>
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
.login-checkbox{display:inline-flex;align-items:center;gap:8px;color:var(--text-2);cursor:pointer;font-size:12px}
.login-checkbox input{position:absolute;opacity:0;width:0;height:0}
.login-checkbox__box{width:16px;height:16px;border:1px solid var(--stroke-3);border-radius:4px;background:var(--bg-2);transition:background .15s,border-color .15s}
.login-checkbox input:checked+.login-checkbox__box{background:var(--accent);border-color:var(--accent)}
.login-divider{display:flex;align-items:center;gap:12px;margin:28px 0}
.login-divider__line{flex:1;height:1px;background:var(--stroke-1)}
.login-divider__text{font-size:11px;color:var(--text-3);letter-spacing:.08em;text-transform:uppercase}
@media(max-width:768px){
  .login-split{grid-template-columns:1fr}
  .login-hero{display:none}
  .login-form-wrap{padding:40px 24px;min-height:100vh;min-height:100dvh}
}
`;
