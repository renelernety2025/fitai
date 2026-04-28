'use client';

import { useEffect, useState } from 'react';
import { Card, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getNotificationPrefs, updateNotificationPrefs, type NotificationPrefs } from '@/lib/api';

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <Card hover padding="16px 20px" onClick={onChange}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
          <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>{description}</div>
        </div>
        <div style={{
          width: 44, height: 24, borderRadius: 12, padding: 2, cursor: 'pointer',
          background: checked ? 'var(--accent)' : 'var(--bg-3)',
          transition: 'background .2s ease',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: 'white',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform .2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,.3)',
          }} />
        </div>
      </div>
    </Card>
  );
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'FitAI — Notifications'; }, []);
  useEffect(() => { getNotificationPrefs().then(setPrefs).catch(console.error); }, []);

  async function toggle(key: keyof NotificationPrefs) {
    if (!prefs) return;
    setSaving(true);
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await updateNotificationPrefs({ [key]: updated[key] }).catch(console.error);
    setSaving(false);
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Settings</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Stay<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>informed.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12 }}>
            Choose which notifications you want to receive.
          </p>
        </section>

        {prefs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
            <ToggleRow
              label="Workout reminders"
              description="Daily reminder when you haven't trained yet"
              checked={prefs.workoutReminder}
              onChange={() => toggle('workoutReminder')}
            />
            <ToggleRow
              label="Streak warning"
              description="Evening alert before losing your streak"
              checked={prefs.streakWarning}
              onChange={() => toggle('streakWarning')}
            />
            <ToggleRow
              label="Achievements"
              description="Notification when unlocking a new badge"
              checked={prefs.achievements}
              onChange={() => toggle('achievements')}
            />
          </div>
        )}

        {prefs && (
          <section>
            <SectionHeader title="Quiet hours" />
            <Card padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FitIcon name="timer" size={16} color="var(--text-3)" />
                <span className="v3-body" style={{ color: 'var(--text-2)' }}>
                  No notifications between {prefs.quietHoursStart}:00 and {prefs.quietHoursEnd}:00
                </span>
              </div>
            </Card>
          </section>
        )}

        {saving && <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 16 }}>Saving...</p>}
      </div>
    </>
  );
}
