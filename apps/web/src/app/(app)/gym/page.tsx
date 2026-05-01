'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, SectionHeader, Tag, Button } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getWorkoutPlans, getMyStats, type WorkoutPlanData, type StatsData } from '@/lib/api';

const planColor: Record<string, string> = {
  PUSH_PULL_LEGS: 'var(--accent)',
  UPPER_LOWER: 'var(--sage, #34d399)',
  FULL_BODY: 'var(--clay)',
  CUSTOM: '#BF5AF2',
};

const quickLinks = [
  { href: '/doma', icon: 'home', label: 'Home', sub: '15-35 min' },
  { href: '/videos', icon: 'camera', label: 'Classes', sub: 'Yoga, HIIT' },
  { href: '/ai-coach', icon: 'brain', label: 'AI Plan', sub: 'Personalized' },
  { href: '/micro-workout', icon: 'flame', label: 'Micro', sub: '5 min' },
];

export default function GymPage() {
  const [plans, setPlans] = useState<WorkoutPlanData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { document.title = 'FitAI — Training'; }, []);

  useEffect(() => {
    Promise.all([
      getWorkoutPlans().then(setPlans).catch(console.error),
      getMyStats().then(setStats).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Training</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Ready to<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>train.</em>
          </h1>
          {stats && stats.totalSessions > 0 && (
            <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
              <Tag>{stats.totalSessions} sessions</Tag>
              <Tag>{stats.currentStreak}d streak</Tag>
              <Tag>{stats.totalXP} XP</Tag>
            </div>
          )}
        </section>

        <SectionHeader title="Quick start" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {quickLinks.map((q) => (
            <Link key={q.href} href={q.href} style={{ textDecoration: 'none' }}>
              <Card hover padding={24}>
                <FitIcon name={q.icon} size={20} color="var(--accent)" />
                <div className="v3-body" style={{ marginTop: 12, color: 'var(--text-1)' }}>{q.label}</div>
                <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{q.sub}</div>
              </Card>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <SectionHeader title="Plans" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading && (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ height: 80, borderRadius: 'var(--r-md)', background: 'var(--bg-2)', marginBottom: 2, opacity: 0.6 }} />
                ))}
              </>
            )}
            {!loading && plans.length === 0 && (
              <Card padding={32} style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-2)', marginBottom: 16, fontSize: 14 }}>
                  You don&apos;t have any training plans yet.
                </p>
                <Button variant="accent" onClick={() => router.push('/ai-coach')}>
                  Create your first plan
                </Button>
              </Card>
            )}
            {!loading && plans.map((plan) => (
              <Link key={plan.id} href={`/plans/${plan.id}`} style={{ textDecoration: 'none' }}>
                <Card hover padding="24px 20px">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <Tag color={planColor[plan.type]}>
                        {plan.type.replace(/_/g, ' ')} / {plan.daysPerWeek}x
                      </Tag>
                      <div className="v3-body" style={{ marginTop: 8, color: 'var(--text-1)', fontWeight: 600 }}>
                        {plan.name || plan.nameCs}
                      </div>
                      {plan.description && (
                        <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                          {plan.description}
                        </div>
                      )}
                    </div>
                    <FitIcon name="arrow" size={18} color="var(--text-3)" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
