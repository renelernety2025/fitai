'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authResetPassword } from '@/lib/api';
import { Button, Logo } from '@/components/v3';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Please request a new link.');
      return;
    }
    setLoading(true);
    try {
      await authResetPassword(token, password);
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-hero">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2400&q=85&auto=format&fit=crop"
          alt=""
          className="login-hero__img"
        />
        <div className="login-hero__overlay" />
        <div className="login-hero__content">
          <Logo size={22} />
          <div>
            <p className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16 }}>
              &#9670; Almost there
            </p>
            <h2 className="v3-display-2" style={{ maxWidth: 480 }}>
              Set your new<br />
              <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>
                password.
              </span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Choose a strong password to protect your account.
          </p>
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-form">
          <h1 className="v3-display-3" style={{ marginBottom: 8 }}>New password</h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 14 }}>
            Pick something strong.{' '}
            <Link href="/login" style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>
              Back to sign in &rarr;
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label className="login-label">New password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                    minLength={8}
                  />
                  {password && (
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
              <div>
                <label className="login-label">Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="login-input"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <Button variant="accent" size="lg" full type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Set new password \u2192'}
            </Button>
          </form>
        </div>
      </div>

      <style>{resetStyles}</style>
    </div>
  );
}

const resetStyles = `
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
