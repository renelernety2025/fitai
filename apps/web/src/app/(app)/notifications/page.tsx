'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getNotificationPrefs, updateNotificationPrefs, type NotificationPrefs } from '@/lib/api';

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'FitAI — Notifikace'; }, []);

  useEffect(() => {
    getNotificationPrefs().then(setPrefs).catch(console.error);
  }, []);

  async function toggle(key: keyof NotificationPrefs) {
    if (!prefs) return;
    setSaving(true);
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await updateNotificationPrefs({ [key]: updated[key] }).catch(console.error);
    setSaving(false);
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Nastaveni</V2SectionLabel>
        <V2Display size="xl">Notifikace.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Vyber ktere notifikace chces dostavat.
        </p>
      </section>

      {prefs && (
        <section className="mb-24 space-y-4">
          <ToggleRow
            label="Pripominky treninku"
            description="Denni pripominka kdyz jsi jeste necvicil"
            checked={prefs.workoutReminder}
            onChange={() => toggle('workoutReminder')}
          />
          <ToggleRow
            label="Varovani pred ztratou streak"
            description="Upozorneni vecer pred ztratou serie"
            checked={prefs.streakWarning}
            onChange={() => toggle('streakWarning')}
          />
          <ToggleRow
            label="Uspechy a achievementy"
            description="Notifikace pri odemknuti noveho uspechu"
            checked={prefs.achievements}
            onChange={() => toggle('achievements')}
          />
        </section>
      )}

      {prefs && (
        <section className="mb-24">
          <V2SectionLabel>Tichy rezim</V2SectionLabel>
          <p className="mb-4 text-sm text-white/40">
            Zadne notifikace mezi {prefs.quietHoursStart}:00 a {prefs.quietHoursEnd}:00
          </p>
        </section>
      )}

      {saving && (
        <p className="text-[11px] text-white/30">Ukladam...</p>
      )}
    </V2Layout>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-xl border border-white/8 p-5 text-left transition hover:border-white/15"
    >
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="mt-0.5 text-[11px] text-white/40">{description}</div>
      </div>
      <div
        className={`flex h-7 w-12 items-center rounded-full transition ${
          checked ? 'bg-[#A8FF00]' : 'bg-white/15'
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );
}
