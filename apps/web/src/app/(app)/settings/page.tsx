'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { useAuth } from '@/lib/auth-context';
import { request } from '@/lib/api';

const SECTIONS = [
  { id: 'account', label: 'Account', icon: 'users' },
  { id: 'notif', label: 'Notifications', icon: 'pulse' },
  { id: 'integ', label: 'Integrations', icon: 'bolt' },
  { id: 'priv', label: 'Privacy & data', icon: 'lock' },
  { id: 'app', label: 'Preferences', icon: 'settings' },
] as const;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState<string>('account');
  useEffect(() => { document.title = 'FitAI — Settings'; }, []);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr' }}>
      <Sidebar active={active} onSelect={setActive} />
      <div style={{ padding: '40px 56px', maxWidth: 880 }}>
        {active === 'account' && <AccountSection name={user?.name || ''} onDeleted={() => { logout(); router.push('/login'); }} />}
        {active === 'notif' && <NotifSection />}
        {active === 'integ' && <IntegSection />}
        {active === 'priv' && <SectionShell eyebrow="Privacy" title="Your data," accent="your rules."><Card padding={24}><div className="v3-body" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Your data is stored securely on AWS EU-West-1. Only you can see personal records, body photos, and journal entries.</div></Card></SectionShell>}
        {active === 'app' && <SectionShell eyebrow="Preferences" title="Make it" accent="yours."><Card padding={24}><div className="v3-caption" style={{ textAlign: 'center', padding: 32 }}>Preference options coming soon.</div></Card></SectionShell>}
      </div>
    </div>
  );
}

function SectionShell({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent: string; children: React.ReactNode }) {
  return (<><div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>{eyebrow}</div><h1 className="v3-display-2" style={{ margin: '0 0 32px' }}>{title}<br /><span className="v3-clay" style={{ fontWeight: 300 }}>{accent}</span></h1>{children}</>);
}

function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ borderRight: '1px solid var(--stroke-1)', padding: '40px 0', background: 'var(--bg-1)' }}>
      <div style={{ padding: '0 32px', marginBottom: 32 }}>
        <Link href="/profile" className="v3-caption" style={{ marginBottom: 12, display: 'block', color: 'var(--text-3)' }}>
          <FitIcon name="arrow" size={12} style={{ transform: 'rotate(180deg)', marginRight: 6 }} />Back
        </Link>
        <div className="v3-eyebrow-serif">Settings</div>
        <div className="v3-display-3" style={{ marginTop: 4 }}>Your account</div>
      </div>
      {SECTIONS.map((s) => (
        <button key={s.id} onClick={() => onSelect(s.id)} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 32px', width: '100%',
          background: active === s.id ? 'var(--bg-3)' : 'transparent',
          borderLeft: active === s.id ? '2px solid var(--accent)' : '2px solid transparent',
          color: active === s.id ? 'var(--text-1)' : 'var(--text-2)',
          cursor: 'pointer', fontSize: 14, border: 'none', textAlign: 'left',
        }}>
          <FitIcon name={s.icon} size={16} /><span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)', fontSize: 14, marginBottom: 10 };

function NameChangeForm({ initName }: { initName: string }) {
  const [nm, setNm] = useState(initName);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try { await request('/users/me/name', { method: 'PUT', body: JSON.stringify({ name: nm }) }); setMsg('Saved'); } catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Error'); } finally { setLoading(false); }
  }

  return (
    <Card padding={24} style={{ marginBottom: 20 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Change name</div>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={nm} onChange={(e) => setNm(e.target.value)} required minLength={1} style={{ ...INPUT_STYLE, marginBottom: 0, flex: 1 }} />
        <Button variant="accent" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        {msg && <span className="v3-caption" style={{ color: 'var(--sage)' }}>{msg}</span>}
      </form>
    </Card>
  );
}

function PasswordChangeForm() {
  const [cur, setCur] = useState('');
  const [newPw, setNewPw] = useState('');
  const [conf, setConf] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setMsg(''); setErr('');
    if (newPw !== conf) { setErr('Passwords do not match'); return; }
    setLoading(true);
    try { await request('/users/me/password', { method: 'PUT', body: JSON.stringify({ currentPassword: cur, newPassword: newPw }) }); setMsg('Changed'); setCur(''); setNewPw(''); setConf(''); } catch (error: unknown) { setErr(error instanceof Error ? error.message : 'Error'); } finally { setLoading(false); }
  }

  return (
    <Card padding={24} style={{ marginBottom: 20 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Change password</div>
      <form onSubmit={onSubmit}>
        <input type="password" placeholder="Current password" value={cur} onChange={(e) => setCur(e.target.value)} required style={INPUT_STYLE} />
        <input type="password" placeholder="New password (min 8)" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} style={INPUT_STYLE} />
        <input type="password" placeholder="Confirm new" value={conf} onChange={(e) => setConf(e.target.value)} required minLength={8} style={INPUT_STYLE} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="accent" type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change'}</Button>
          {msg && <span className="v3-caption" style={{ color: 'var(--sage)' }}>{msg}</span>}
          {err && <span className="v3-caption" style={{ color: 'var(--danger)' }}>{err}</span>}
        </div>
      </form>
    </Card>
  );
}

function DeleteAccountButton({ onDeleted }: { onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function doDelete() {
    setLoading(true); setErr('');
    try { await request('/users/me', { method: 'DELETE' }); onDeleted(); } catch (error: unknown) { setErr(error instanceof Error ? error.message : 'Error'); } finally { setLoading(false); }
  }

  return (
    <div style={{ marginTop: 48 }}>
      <SectionHeader eyebrow="Danger zone" title="Delete account" />
      {!confirm ? (
        <Button variant="ghost" style={{ color: 'var(--danger)', borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)' }} onClick={() => setConfirm(true)}>Delete account</Button>
      ) : (
        <Card padding={24} style={{ border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', background: 'color-mix(in srgb, var(--danger) 3%, transparent)' }}>
          <div className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 16 }}>This action is permanent and cannot be undone.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="accent" style={{ background: 'var(--danger)' }} onClick={doDelete} disabled={loading}>{loading ? 'Deleting...' : 'Yes, delete'}</Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
          </div>
          {err && <div className="v3-caption" style={{ color: 'var(--danger)', marginTop: 8 }}>{err}</div>}
        </Card>
      )}
    </div>
  );
}

function AccountSection({ name, onDeleted }: { name: string; onDeleted: () => void }) {
  return (
    <>
      <SectionShell eyebrow="Account" title="Your details," accent="your way.">
        <NameChangeForm initName={name} />
        <PasswordChangeForm />
        <div style={{ marginTop: 24 }}><Link href="/export"><Button variant="ghost">Export data</Button></Link></div>
      </SectionShell>
      <DeleteAccountButton onDeleted={onDeleted} />
    </>
  );
}

function NotifSection() {
  const [prefs, setPrefs] = useState<Record<string, boolean> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    import('@/lib/api').then(({ getNotificationPrefs }) =>
      getNotificationPrefs().then((p: any) => setPrefs({
        workoutReminder: p?.workoutReminder ?? true,
        streakWarning: p?.streakWarning ?? true,
        achievements: p?.achievements ?? true,
      })).catch(() => setPrefs({ workoutReminder: true, streakWarning: true, achievements: true }))
    );
  }, []);

  async function toggle(key: string) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      const { updateNotificationPrefs } = await import('@/lib/api');
      await updateNotificationPrefs(updated);
    } catch { /* revert on error */ setPrefs(prefs); }
    finally { setSaving(false); }
  }

  const items = [
    { key: 'workoutReminder', label: 'Workout reminders', desc: 'Daily reminder when you haven\'t trained yet.' },
    { key: 'streakWarning', label: 'Streak warnings', desc: 'Evening alert before losing your streak.' },
    { key: 'achievements', label: 'Achievements', desc: 'Notification when you unlock a new badge.' },
  ];

  return (
    <SectionShell eyebrow="Notifications" title="What we tell you," accent="and when.">
      <Card padding={28}>
        {!prefs ? (
          <div style={{ textAlign: 'center', padding: 24 }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span></div>
        ) : items.map((it, i) => (
          <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 0', borderBottom: i < items.length - 1 ? '1px solid var(--stroke-1)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 2 }}>{it.label}</div>
              <div className="v3-caption">{it.desc}</div>
            </div>
            <Toggle on={prefs[it.key]} onChange={() => toggle(it.key)} />
          </div>
        ))}
        {saving && <div className="v3-caption" style={{ color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>Saving...</div>}
      </Card>
    </SectionShell>
  );
}

function IntegSection() {
  const list = [
    { name: 'Apple Health', sync: 'Steps, HR, Sleep, Workouts' },
    { name: 'Garmin', sync: 'GPS, HR, VO2max, Sleep' },
    { name: 'Strava', sync: 'Auto-post completed workouts' },
    { name: 'Oura', sync: 'Sleep stages, Readiness' },
  ];
  return (
    <SectionShell eyebrow="Integrations" title="Connected" accent="services.">
      <Card padding={0}>
        {list.map((it, i) => (
          <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderBottom: i < list.length - 1 ? '1px solid var(--stroke-1)' : 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FitIcon name="bolt" size={20} color="var(--text-3)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)' }}>{it.name}</div>
              <div className="v3-caption" style={{ marginTop: 2 }}>{it.sync}</div>
            </div>
            <Button variant="ghost" size="sm">Connect</Button>
          </div>
        ))}
      </Card>
    </SectionShell>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange?: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      style={{ width: 44, height: 24, borderRadius: 12, background: on ? 'var(--accent)' : 'var(--bg-3)', position: 'relative', cursor: 'pointer', border: 'none', padding: 0 }}
    >
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}
