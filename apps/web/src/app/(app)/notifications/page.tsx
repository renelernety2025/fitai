'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Chip, Avatar, Badge, Button, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getSocialNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType =
  | 'NEW_FOLLOWER' | 'POST_LIKED' | 'POST_COMMENTED'
  | 'CHALLENGE_INVITE' | 'CHALLENGE_COMPLETED' | 'SQUAD_PR'
  | 'BUDDY_WORKOUT' | 'SUBSCRIBER_NEW' | 'TIP_RECEIVED'
  | 'POST_MILESTONE' | 'STREAK_BUDDY';

interface SocialNotif {
  id: string;
  type: NotifType;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: { id: string; name: string; avatarUrl?: string; badgeType?: 'NONE' | 'CREATOR' | 'VERIFIED' };
}

type FilterTab = 'all' | 'social' | 'workout' | 'system';

const SOCIAL_TYPES: NotifType[] = [
  'NEW_FOLLOWER', 'POST_LIKED', 'POST_COMMENTED', 'SUBSCRIBER_NEW',
  'TIP_RECEIVED', 'POST_MILESTONE',
];
const WORKOUT_TYPES: NotifType[] = [
  'CHALLENGE_INVITE', 'CHALLENGE_COMPLETED', 'SQUAD_PR', 'BUDDY_WORKOUT', 'STREAK_BUDDY',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function notifTypeIcon(type: NotifType): string {
  if (type === 'NEW_FOLLOWER' || type === 'SUBSCRIBER_NEW') return 'user-plus';
  if (type === 'POST_LIKED') return 'heart';
  if (type === 'POST_COMMENTED') return 'message';
  if (type === 'TIP_RECEIVED') return 'star';
  if (type === 'CHALLENGE_INVITE' || type === 'CHALLENGE_COMPLETED') return 'trophy';
  if (type === 'SQUAD_PR') return 'lightning';
  if (type === 'STREAK_BUDDY') return 'fire';
  return 'bell';
}

function matchesTab(notif: SocialNotif, tab: FilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'social') return SOCIAL_TYPES.includes(notif.type);
  if (tab === 'workout') return WORKOUT_TYPES.includes(notif.type);
  return false;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotifItem({ notif, onRead }: { notif: SocialNotif; onRead: (id: string) => void }) {
  return (
    <Card
      hover
      padding="14px 16px"
      onClick={() => !notif.isRead && onRead(notif.id)}
      style={{ opacity: notif.isRead ? 0.6 : 1, cursor: notif.isRead ? 'default' : 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Unread dot */}
        <div style={{ paddingTop: 6, flexShrink: 0, width: 8 }}>
          {!notif.isRead && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)',
            }} />
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={notif.actor.avatarUrl} name={notif.actor.name} size={40} />
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            background: 'var(--bg-2)', borderRadius: '50%',
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--stroke-1)',
          }}>
            <FitIcon name={notifTypeIcon(notif.type)} size={10} color="var(--accent)" />
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>
              {notif.actor.name}
            </span>
            {notif.actor.badgeType && notif.actor.badgeType !== 'NONE' && (
              <Badge type={notif.actor.badgeType} size={14} />
            )}
          </div>
          <p className="v3-caption" style={{ color: 'var(--text-2)', marginTop: 2, lineHeight: 1.4 }}>
            {notif.message}
          </p>
          <span className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4, display: 'block' }}>
            {timeAgo(notif.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const labels: Record<FilterTab, string> = {
    all: 'No notifications',
    social: 'No social notifications',
    workout: 'No workout notifications',
    system: 'No system notifications',
  };
  return (
    <div style={{
      textAlign: 'center', padding: '48px 16px',
      color: 'var(--text-3)',
    }}>
      <FitIcon name="bell" size={32} color="var(--text-3)" />
      <p className="v3-body" style={{ marginTop: 12, color: 'var(--text-2)' }}>{labels[tab]}</p>
      <p className="v3-caption" style={{ marginTop: 4 }}>Something will appear here soon.</p>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <Card hover padding="16px 20px">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
            <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>{description}</div>
          </div>
          <div
            aria-hidden="true"
            style={{
              width: 44, height: 24, borderRadius: 12, padding: 2,
              background: checked ? 'var(--accent)' : 'var(--bg-3)',
              transition: 'background .2s ease',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              transform: checked ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform .2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,.3)',
            }} />
          </div>
        </div>
      </Card>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [tab, setTab] = useState<FilterTab>('all');
  const [notifs, setNotifs] = useState<SocialNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Notifications | FitAI'; }, []);

  const fetchData = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const [notifData, countData] = await Promise.all([
        getSocialNotifications() as Promise<SocialNotif[]>,
        getUnreadCount(),
      ]);
      setNotifs(notifData ?? []);
      setUnreadCount(countData.unreadCount);
    } catch {
      // silently degrade
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { getNotificationPrefs().then(setPrefs).catch(console.error); }, []);

  async function handleMarkRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await markNotificationRead(id).catch(console.error);
  }

  async function handleMarkAll() {
    if (!unreadCount) return;
    setMarkingAll(true);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsRead().catch(console.error);
    setMarkingAll(false);
  }

  async function togglePref(key: keyof NotificationPrefs) {
    if (!prefs) return;
    setSaving(true);
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await updateNotificationPrefs({ [key]: updated[key] }).catch(console.error);
    setSaving(false);
  }

  const filtered = tab === 'system'
    ? []
    : notifs.filter(n => matchesTab(n, tab));

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'social', label: 'Social' },
    { id: 'workout', label: 'Workout' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
      {/* Hero */}
      <section style={{ padding: '48px 0 24px' }}>
        <p className="v3-eyebrow-serif">&#9670; Inbox</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 className="v3-display-2" style={{ marginTop: 8 }}>
              Your<br />
              <em className="v3-clay" style={{ fontWeight: 300 }}>notifications.</em>
            </h1>
            {unreadCount > 0 && (
              <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 10 }}>
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              disabled={markingAll}
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(t => (
          <Chip key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'all' && unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} unread`}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: 'var(--accent)', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '0 4px',
                  marginLeft: 4,
                }}
              >
                <span aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>
              </span>
            )}
          </Chip>
        ))}
      </div>

      {/* Notification list */}
      <section style={{ marginBottom: 40 }}>
        {loadingNotifs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: 72, borderRadius: 'var(--r-lg)',
                background: 'var(--bg-2)', opacity: 0.5,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(n => (
              <NotifItem key={n.id} notif={n} onRead={handleMarkRead} />
            ))}
          </div>
        )}
      </section>

      {/* Notification preferences */}
      <section style={{ marginBottom: 32 }}>
        <SectionHeader title="Notification settings" />
        {prefs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <ToggleRow
              label="Workout reminders"
              description="Daily reminder when you haven't trained yet"
              checked={prefs.workoutReminder}
              onChange={() => togglePref('workoutReminder')}
            />
            <ToggleRow
              label="Streak loss warning"
              description="Evening alert before losing your streak"
              checked={prefs.streakWarning}
              onChange={() => togglePref('streakWarning')}
            />
            <ToggleRow
              label="Achievements"
              description="Notification when you unlock a new badge"
              checked={prefs.achievements}
              onChange={() => togglePref('achievements')}
            />
          </div>
        )}
        {prefs && (
          <div style={{ marginTop: 12 }}>
            <Card padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FitIcon name="timer" size={16} color="var(--text-3)" />
                <span className="v3-body" style={{ color: 'var(--text-2)' }}>
                  No notifications between {prefs.quietHoursStart}:00 and {prefs.quietHoursEnd}:00
                </span>
              </div>
            </Card>
          </div>
        )}
        {saving && (
          <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 10 }}>Saving...</p>
        )}
      </section>
    </div>
  );
}
