'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authForgotPassword } from '@/lib/api';
import { Button, Logo } from '@/components/v3';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) return;
    setLoading(true);
    try {
      await authForgotPassword(email);
      setSent(true);
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
              &#9670; Account recovery
            </p>
            <h2 className="v3-display-2" style={{ maxWidth: 480 }}>
              We&apos;ll get you<br />
              <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>
                back on track.
              </span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Reset your password in seconds.
          </p>
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-form">
          <h1 className="v3-display-3" style={{ marginBottom: 8 }}>Reset password</h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 36, fontSize: 14 }}>
            Remember it?{' '}
            <Link href="/login" style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>
              Sign in &rarr;
            </Link>
          </p>

          {sent ? (
            <div style={{
              padding: 24, borderRadius: 'var(--r-sm)',
              border: '1px solid var(--stroke-2)', background: 'var(--bg-2)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 15, color: 'var(--text-1)', marginBottom: 8, fontWeight: 600 }}>
                Check your email
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                If an account exists for <strong>{email}</strong>, we sent a reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label className="login-label">Email</label>
                <input
                  type="email"
                  placeholder="sara@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                />
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</p>
              )}

              <Button variant="accent" size="lg" full type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link \u2192'}
              </Button>
            </form>
          )}
        </div>
      </div>

      <style>{forgotStyles}</style>
    </div>
  );
}

const forgotStyles = `
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
