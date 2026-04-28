'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { V2DailyBrief } from '@/components/v2/V2DailyBrief';
import { Card, SectionHeader } from '@/components/v3';
import TodayActionCard from '@/components/dashboard/TodayActionCard';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { DashboardSkeleton } from '@/components/v2/Skeleton';
import GreetingHero from '@/components/dashboard/v3/GreetingHero';
import TodayWorkout from '@/components/dashboard/v3/TodayWorkout';
import StatsStrip from '@/components/dashboard/v3/StatsStrip';
import WeekStrip from '@/components/dashboard/v3/WeekStrip';
import {
  getMyStats, getInsights, getLessonOfTheWeek, getNutritionToday,
  getWeeklyReview, getDailyBrief, getDailyMotivation, getMicroWorkout,
  getTodayAction, getStreakFreezeStatus,
  type StatsData, type Insights, type WeeklyReview, type DailyBrief, type TodayAction,
} from '@/lib/api';

export default function DashboardV3Page() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReview | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [todayAction, setTodayAction] = useState<TodayAction | null>(null);

  useEffect(() => { document.title = 'FitAI - Dashboard'; }, []);

  function reload() {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getWeeklyReview().then((r) => setWeekly(r.review)).catch(console.error);
    getDailyBrief().then((r) => setBrief(r.brief)).catch(console.error);
    getDailyMotivation().then((r) => setMotivation(r.message)).catch(console.error);
    getTodayAction().then(setTodayAction).catch(console.error);
    // Pre-warm caches for sub-pages
    getLessonOfTheWeek().catch(() => {});
    getNutritionToday().catch(() => {});
    getMicroWorkout().catch(() => {});
    getStreakFreezeStatus().catch(() => {});
  }

  useEffect(() => { reload(); }, []);

  if (isLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)' }}>
      <DashboardSkeleton />
    </div>
  );

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Dobre rano' : hour < 18 ? 'Dobre odpoledne' : 'Dobry vecer';
  const name = user?.name?.split(' ')[0] || 'Athlete';
  const dateStr = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const recovery = brief?.recoveryStatus;
  const subtitle = `${dateStr}${recovery === 'fresh' ? ' \u00B7 Svezi' : recovery === 'fatigued' ? ' \u00B7 Unaveny' : ''}`;

  return (
    <>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 16px 64px' }}>
        {/* Greeting */}
        <GreetingHero
          firstName={`${greeting}, ${name}`}
          subtitle={subtitle}
          motivation={motivation}
          onRefresh={reload}
        />

        {/* Today Action widget */}
        {todayAction && <TodayActionCard action={todayAction} />}

        {/* Today's Workout — hero card */}
        {brief && (
          <section style={{ marginBottom: 32 }}>
            <TodayWorkout brief={brief} />
          </section>
        )}

        {/* Stats strip */}
        {stats && (
          <section style={{ marginBottom: 32 }}>
            <SectionHeader eyebrow="THIS WEEK" title="By the numbers." />
            <StatsStrip stats={stats} />
          </section>
        )}

        {/* Week strip */}
        {stats && (
          <section style={{ marginBottom: 40 }}>
            <WeekStrip weeklyActivity={stats.weeklyActivity || []} />
          </section>
        )}

        {/* AI Coach insight */}
        {insights?.recovery && (
          <section style={{ marginBottom: 40 }}>
            <Card padding={28} style={{ background: 'linear-gradient(160deg, rgba(26,10,5,0.6) 0%, var(--bg-card) 60%)', border: '1px solid rgba(255,75,18,0.12)' }}>
              <div className="v3-eyebrow" style={{ color: 'var(--accent)', marginBottom: 16 }}>AI COACH</div>
              <div className="v3-display-3" style={{ marginBottom: 12 }}>
                {{ fresh: 'Jsi svezi. Dnes muzes zabratat.', normal: 'Normalni stav. Drzme tempo.', fatigued: 'Telo je unavene. Zlehka.', overreached: 'Prilis zateze. Dnes odpocinek.' }[insights.recovery.overallStatus]}
              </div>
              <p className="v3-body" style={{ color: 'var(--text-2)', margin: 0 }}>{insights.recovery.recommendation}</p>
            </Card>
          </section>
        )}

        {brief && <section style={{ marginBottom: 40 }}><V2DailyBrief brief={brief} /></section>}

        <OnboardingTour />
      </div>
    </>
  );
}
