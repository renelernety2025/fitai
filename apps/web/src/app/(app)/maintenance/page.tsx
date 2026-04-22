'use client';

import { useCallback, useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  getMaintenanceStatus,
  getMaintenanceAlerts,
  getBodyMileage,
  markDeload,
  dismissAlert,
} from '@/lib/api';

type MaintenanceStatus = { muscleGroup: string; status: string; sessionsSinceDeload: number; lastTrainedAt?: string };
type MaintenanceAlert = { id: string; severity: string; muscleGroup: string; message: string };
type BodyMileage = { totalVolumeKg: number; totalSessions: number; totalSets: number };

const STATUS_COLOR: Record<string, string> = {
  FRESH: '#A8FF00',
  DUE: '#FF9F0A',
  OVERDUE: '#FF375F',
};

const STATUS_LABEL: Record<string, string> = {
  FRESH: 'Fresh',
  DUE: 'Due',
  OVERDUE: 'Overdue',
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: '#A8FF00',
  MEDIUM: '#FF9F0A',
  HIGH: '#FF375F',
};

export default function MaintenancePage() {
  const [muscles, setMuscles] = useState<MaintenanceStatus[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [mileage, setMileage] = useState<BodyMileage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'FitAI — Body Maintenance'; }, []);

  const refresh = useCallback(() => {
    Promise.all([
      getMaintenanceStatus(),
      getMaintenanceAlerts(),
      getBodyMileage(),
    ])
      .then(([m, a, b]) => { setMuscles(m); setAlerts(a); setMileage(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function handleDeload(muscleGroup: string) {
    markDeload(muscleGroup).then(refresh).catch(console.error);
  }

  function handleDismiss(alertId: string) {
    dismissAlert(alertId).then(refresh).catch(console.error);
  }

  if (loading) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Service Book</V2SectionLabel>
        <V2Display size="xl">Body Maintenance.</V2Display>
      </section>

      {/* Odometer — total mileage */}
      {mileage && (
        <section className="mb-16 rounded-2xl border border-white/8 bg-white/[0.03] p-8">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Total Mileage
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="font-bold tabular-nums"
              style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {mileage.totalVolumeKg.toLocaleString('cs-CZ')}
            </span>
            <span className="text-lg text-white/30">kg</span>
          </div>
          <div className="mt-4 flex gap-8 text-sm text-white/55">
            <span>{mileage.totalSessions} sessions</span>
            <span>{mileage.totalSets} sets</span>
          </div>
        </section>
      )}

      {/* Muscle group grid */}
      <section className="mb-16">
        <V2SectionLabel>Muscle Groups</V2SectionLabel>
        <div className="stagger-container mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {muscles.map((m) => (
            <div
              key={m.muscleGroup}
              className="stagger-item animate-fadeIn rounded-2xl border border-white/8 bg-white/[0.03] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[m.status] }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: STATUS_COLOR[m.status] }}
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                </div>
                <span className="text-[11px] tabular-nums text-white/30">
                  {m.sessionsSinceDeload} since deload
                </span>
              </div>

              <div className="mb-4 text-base font-semibold tracking-tight text-white">
                {m.muscleGroup}
              </div>

              {m.lastTrainedAt && (
                <div className="mb-4 text-[11px] text-white/30">
                  Last: {new Date(m.lastTrainedAt).toLocaleDateString('cs-CZ', {
                    day: 'numeric', month: 'short',
                  })}
                </div>
              )}

              {(m.status === 'DUE' || m.status === 'OVERDUE') && (
                <button
                  onClick={() => handleDeload(m.muscleGroup)}
                  className="w-full rounded-full border border-white/10 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  Mark Deload
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Active Alerts</V2SectionLabel>
          <div className="mt-6 space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="animate-slideUp flex items-start justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-5"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLOR[a.severity] }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                      style={{ color: SEVERITY_COLOR[a.severity] }}
                    >
                      {a.severity} — {a.muscleGroup}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">
                    {a.message}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(a.id)}
                  className="ml-4 flex-shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 transition hover:border-white/30 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
