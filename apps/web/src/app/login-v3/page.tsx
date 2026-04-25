'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/* ── Design tokens (from handoff) ─────────────────────────── */
const T = {
  bg0: '#0B0907',
  bg2: '#181511',
  bgCard: '#14110D',
  text1: '#F5EDE0',
  text2: '#BFB4A2',
  text3: '#847B6B',
  text4: '#4A4338',
  accent: '#E85D2C',
  accentHot: '#F47A4D',
  clay: '#D4A88C',
  stroke1: 'rgba(245,237,224,0.06)',
  stroke2: 'rgba(245,237,224,0.10)',
  stroke3: 'rgba(245,237,224,0.16)',
  rSm: 10,
  rMd: 14,
  fontDisplay: '"Inter Tight", -apple-system, sans-serif',
  fontText: '"Inter", -apple-system, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
  heroImg:
    'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=2400&q=85&auto=format&fit=crop',
} as const;

/* ── Input ────────────────────────────────────────────────── */
function FormInput({
  label, type = 'text', placeholder, value, onChange,
}: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, color: T.text3,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        fontWeight: 600, marginBottom: 8, fontFamily: T.fontMono,
      }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 48, padding: '0 16px',
          background: T.bg2, border: `1px solid ${T.stroke2}`,
          borderRadius: T.rSm, color: T.text1, fontSize: 14,
          fontFamily: T.fontText, outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = T.accent;
          e.currentTarget.style.boxShadow = `0 0 0 2px ${T.accent}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = T.stroke2;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

/* ── Login page ───────────────────────────────────────────── */
export default function LoginV3Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
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
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh', background: T.bg0,
    }}>
      {/* Left — hero image */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={T.heroImg} alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'saturate(0.85) brightness(0.9)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(11,9,7,0.3) 0%, rgba(11,9,7,0.7) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, padding: 56,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: T.text1,
            fontFamily: T.fontDisplay, letterSpacing: '-0.02em',
          }}>
            FitAI
          </div>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: 600,
              color: T.accentHot, marginBottom: 16,
            }}>
              &#9670; Welcome back
            </div>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: 48,
              fontWeight: 700, lineHeight: 1.1, color: T.text1,
              letterSpacing: '-0.02em', maxWidth: 480,
            }}>
              Today&apos;s training<br />
              <span style={{
                color: T.clay, fontStyle: 'italic', fontWeight: 300,
              }}>is waiting for you.</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.text3 }}>
            Photo &middot; Sara, member since 2024
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 56,
      }}>
        <form onSubmit={handleSubmit} style={{
          width: '100%', maxWidth: 420,
        }}>
          <h1 style={{
            fontFamily: T.fontDisplay, fontSize: 36,
            fontWeight: 700, color: T.text1, marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>Sign in</h1>
          <p style={{ fontSize: 14, color: T.text2, marginBottom: 36 }}>
            New here?{' '}
            <Link href="/register" style={{
              color: T.accentHot, fontWeight: 600, textDecoration: 'none',
            }}>Start free &rarr;</Link>
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: T.rSm,
              background: 'rgba(200,74,44,0.15)',
              border: '1px solid rgba(200,74,44,0.3)',
              color: '#f87171', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 16, marginBottom: 24,
          }}>
            <FormInput
              label="Email" type="email"
              placeholder="sara@example.com"
              value={email} onChange={setEmail}
            />
            <FormInput
              label="Password" type="password"
              placeholder="••••••••"
              value={password} onChange={setPassword}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 24, fontSize: 12,
          }}>
            <label
              style={{
                display: 'inline-flex', alignItems: 'center',
                gap: 8, color: T.text2, cursor: 'pointer',
              }}
              onClick={() => setRemember(!remember)}
            >
              <span style={{
                width: 16, height: 16,
                border: `1px solid ${T.stroke3}`,
                borderRadius: 4, background: remember ? T.accent : T.bg2,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, color: '#fff',
                transition: 'background .15s',
              }}>{remember ? '\u2713' : ''}</span>
              Remember me
            </label>
            <Link href="/password-reset" style={{
              color: T.text2, textDecoration: 'none',
            }}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 0', fontSize: 14,
              fontWeight: 600, fontFamily: T.fontText,
              background: T.accent, color: '#fff',
              border: 'none', borderRadius: T.rSm,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity .15s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in \u2192'}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 12, margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: T.stroke1 }} />
            <span style={{
              fontSize: 11, color: T.text3,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.stroke1 }} />
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <SSOButton label="Continue with Apple" icon="\uF8FF" />
            <SSOButton label="Continue with Google" icon="G" />
          </div>

          <p style={{
            fontSize: 11, color: T.text3, textAlign: 'center',
            marginTop: 32, lineHeight: 1.6,
          }}>
            By signing in you agree to our Terms and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ── SSO button ───────────────────────────────────────────── */
function SSOButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      style={{
        width: '100%', padding: '12px 0', fontSize: 13,
        fontFamily: T.fontText, fontWeight: 500,
        background: 'transparent', color: T.text1,
        border: `1px solid ${T.stroke2}`,
        borderRadius: T.rSm, cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        transition: 'border-color .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = T.stroke3;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.stroke2;
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}
