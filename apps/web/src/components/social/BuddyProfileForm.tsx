'use client';

import { useState } from 'react';
import { upsertBuddyProfile } from '@/lib/api';

interface BuddyProfileFormProps {
  initial?: {
    gym: string;
    schedule: string;
    goals: string;
    bio: string;
  };
  onDone: () => void;
}

export default function BuddyProfileForm({
  initial,
  onDone,
}: BuddyProfileFormProps) {
  const [gym, setGym] = useState(initial?.gym || '');
  const [schedule, setSchedule] = useState(initial?.schedule || '');
  const [goals, setGoals] = useState(initial?.goals || '');
  const [bio, setBio] = useState(initial?.bio || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertBuddyProfile({ gym, schedule, goals, bio });
      onDone();
    } catch {
      // silent
    }
    setSaving(false);
  }

  const inputStyle = {
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Posilovna
        </label>
        <input
          type="text"
          value={gym}
          onChange={(e) => setGym(e.target.value)}
          placeholder="Nazev posilovny..."
          className="w-full border-b bg-transparent py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </div>
      <div>
        <label
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Rozvrh
        </label>
        <input
          type="text"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          placeholder="Po/St/Pa rano..."
          className="w-full border-b bg-transparent py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </div>
      <div>
        <label
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Cile
        </label>
        <input
          type="text"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="Hypertrofie, sila, hubnutí..."
          className="w-full border-b bg-transparent py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </div>
      <div>
        <label
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--text-muted)' }}
        >
          O mne
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Neco o sobe..."
          rows={3}
          className="w-full resize-none border-b bg-transparent py-2 text-sm focus:outline-none"
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition disabled:opacity-50"
        style={{
          backgroundColor: '#A8FF00',
          color: '#000',
        }}
      >
        {saving ? 'Ukladam...' : 'Ulozit profil'}
      </button>
    </form>
  );
}
