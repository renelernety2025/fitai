'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag, Metric } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getMaintenanceStatus, getMaintenanceAlerts, getBodyMileage, markDeload, dismissAlert } from '@/lib/api';

type MaintenanceStatus = { muscleGroup: string; status: string; sessionsSinceDeload: number; lastTrainedAt?: string };
type MaintenanceAlert = { id: string; severity: string; muscleGroup: string; message: string };
type BodyMileage = { totalVolumeKg: number; totalSessions: number; totalSets: number };

const STATUS_COLOR: Record<string, string> = { FRESH: 'var(--sage, #34d399)', DUE: '#FF9F0A', OVERDUE: 'var(--danger, #ef4444)' };

export default function MaintenancePage() {
  const [muscles, setMuscles] = useState<MaintenanceStatus[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [mileage, setMileage] = useState<BodyMileage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { document.title = 'FitAI — Body Maintenance'; }, []);

  const refresh = useCallback(() => {
    setError(false);
    Promise.all([getMaintenanceStatus(), getMaintenanceAlerts(), getBodyMileage()])
      .then(([m, a, b]) => { setMuscles(m); setAlerts(a); setMileage(b); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Service book</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Body<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>maintenance.</em>
          </h1>
        </section>

        {error && (
          <Card padding={24} style={{ marginBottom: 16 }}>
            <p className="v3-body" style={{ color: 'var(--danger, #ef4444)' }}>Failed to load maintenance data.</p>
          </Card>
        )}

        {mileage && (
          <Card padding={32} style={{ marginBottom: 32 }}>
            <div className="v3-eyebrow" style={{ marginBottom: 8 }}>TOTAL MILEAGE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="v3-numeric" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-1)' }}>
                {mileage.totalVolumeKg.toLocaleString('en-US')}
              </span>
              <span className="v3-numeric" style={{ fontSize: 16, color: 'var(--text-3)' }}>kg</span>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
              <Metric label="Sessions" value={mileage.totalSessions} />
              <Metric label="Sets" value={mileage.totalSets} />
            </div>
          </Card>
        )}

        <SectionHeader title="Muscle groups" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginBottom: 32 }}>
          {muscles.map((m) => (
            <Card key={m.muscleGroup} padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Tag color={STATUS_COLOR[m.status]}>{m.status}</Tag>
                <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{m.sessionsSinceDeload} since deload</span>
              </div>
              <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{m.muscleGroup}</div>
              {m.lastTrainedAt && (
                <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>
                  Last: {new Date(m.lastTrainedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              )}
              {(m.status === 'DUE' || m.status === 'OVERDUE') && (
                <div style={{ marginTop: 12 }}>
                  <Button variant="ghost" size="sm" onClick={() => markDeload(m.muscleGroup).then(refresh)}>Mark Deload</Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {alerts.length > 0 && (
          <>
            <SectionHeader title="Active alerts" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a) => (
                <Card key={a.id} padding={16}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <Tag color={STATUS_COLOR[a.severity === 'HIGH' ? 'OVERDUE' : a.severity === 'MEDIUM' ? 'DUE' : 'FRESH']}>
                        {a.severity} -- {a.muscleGroup}
                      </Tag>
                      <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>{a.message}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(a.id).then(refresh)}>Dismiss</Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
