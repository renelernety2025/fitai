'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authRegister } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Logo } from '@/components/v3';

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Expert' },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await authRegister({ name, email, password, level });
      login(res.accessToken, res.user);
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
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
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=2400&q=85&auto=format&fit=crop"
          alt=""
          className="login-hero__img"
        />
        <div className="login-hero__overlay" />
        <div className="login-hero__content">
          <Logo size={22} />
          <div>
            <p className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16 }}>
              &#9670; Start your journey
            </p>
            <h2 className="v3-display-2" style={{ maxWidth: 480 }}>
              Your AI trainer<br />
              <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>
                starts today.
              </span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Join thousands of athletes already training smarter.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-form-wrap">
        <div className="login-form">
          <h1 className="v3-display-3" style={{ marginBottom: 8 }}>Create account</h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 14 }}>
            Already have one?{' '}
            <Link href="/login" style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>
              Sign in &rarr;
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <FormInput
                label="Name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={setName}
              />
              <FormInput
                label="Email"
                type="email"
                placeholder="jan@example.com"
                value={email}
                onChange={setEmail}
              />
              <FormInput
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={setPassword}
                minLength={8}
              />
              <FormInput
                label="Confirm password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                minLength={8}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="login-label">Experience level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${level === l.value ? 'var(--accent)' : 'var(--stroke-2)'}`,
                      background: level === l.value ? 'rgba(232,93,44,.12)' : 'var(--bg-2)',
                      color: level === l.value ? 'var(--accent)' : 'var(--text-2)',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '.04em',
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <Button variant="accent" size="lg" full type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account \u2192'}
            </Button>
          </form>

          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <Link href="/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and{' '}
            <Link href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{registerStyles}</style>
    </div>
  );
}

function FormInput({ label, type = 'text', placeholder, value, onChange, minLength }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; minLength?: number;
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
          minLength={minLength}
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

const registerStyles = `
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
@media(max-width:768px){
  .login-split{grid-template-columns:1fr}
  .login-hero{display:none}
  .login-form-wrap{padding:40px 24px;min-height:100vh;min-height:100dvh}
}
`;
