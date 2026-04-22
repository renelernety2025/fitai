'use client';

/**
 * VIP Lounge — gold/luxury theme, eligibility check, privileges.
 */

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import {
  getVIPStatus,
  checkVIPEligibility,
  acceptVIP,
} from '@/lib/api';

type VIPStatus = {
  id: string; tier: string; invitedAt: string; privileges: string[];
  isMember?: boolean;
  exclusiveContent?: { id: string; type: string; title: string }[];
};
type VIPEligibility = {
  eligible: boolean; xpRank: number; totalUsers: number; streak: number; avgForm: number;
  requirements?: { label: string; met: boolean; current: string; target: string }[];
};

const GOLD = '#d4af37';
const GOLD_DIM = '#d4af3730';

function RequirementRow({
  label,
  met,
  current,
  target,
}: {
  label: string;
  met: boolean;
  current: string;
  target: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
          style={{
            background: met ? `${GOLD}20` : 'rgba(255,255,255,0.05)',
            color: met ? GOLD : 'rgba(255,255,255,0.3)',
          }}
        >
          {met ? '\u2713' : '\u2022'}
        </span>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <div className="text-right">
        <span
          className="text-sm font-medium"
          style={{ color: met ? GOLD : 'rgba(255,255,255,0.4)' }}
        >
          {current}
        </span>
        <span className="text-[10px] text-white/25"> / {target}</span>
      </div>
    </div>
  );
}

export default function VIPPage() {
  const [status, setStatus] = useState<VIPStatus | null>(null);
  const [eligibility, setEligibility] = useState<VIPEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — VIP Lounge';
  }, []);

  useEffect(() => {
    Promise.all([getVIPStatus(), checkVIPEligibility()])
      .then(([s, e]) => {
        setStatus(s);
        setEligibility(e);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept() {
    setAccepting(true);
    try {
      await acceptVIP();
      setStatus((prev) =>
        prev ? { ...prev, isMember: true } : prev,
      );
    } catch {
      /* noop */
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <V2Layout>
        <div className="pt-12 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </V2Layout>
    );
  }

  if (error) {
    return (
      <V2Layout>
        <div className="pt-12">
          <p className="text-sm text-[#FF375F]">
            Nepodarilo se nacist VIP status.
          </p>
        </div>
      </V2Layout>
    );
  }

  const isMember = status?.isMember;

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${GOLD}99` }}>
          Exclusive Access
        </p>
        <V2Display size="xl">
          <span style={{ color: GOLD }}>VIP</span> Lounge.
        </V2Display>
      </section>

      {isMember ? (
        /* VIP Member view */
        <>
          {/* Welcome card */}
          <GlassCard
            className="p-8 mb-8"
            hover={false}
            glow={`${GOLD}22`}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mb-4"
              style={{
                background: `${GOLD}20`,
                color: GOLD,
                border: `1px solid ${GOLD}40`,
              }}
            >
              &#9733; {status?.tier || 'VIP'} Member
            </div>
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: GOLD }}
            >
              Vitej v klubu.
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Mas pristup k exkluzivnimu obsahu a privilegiim.
            </p>
          </GlassCard>

          {/* Privileges */}
          <section className="mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${GOLD}66` }}>
              Privileges
            </p>
            <div className="mt-4 space-y-2">
              {status?.privileges.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: GOLD_DIM,
                    background: `${GOLD}08`,
                  }}
                >
                  <span style={{ color: GOLD }}>&#10003;</span>
                  <span className="text-sm text-white/70">{p}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Exclusive content */}
          {status?.exclusiveContent &&
            status.exclusiveContent.length > 0 && (
              <section className="mb-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${GOLD}66` }}>
                  Exclusive Content
                </p>
                <StaggerContainer>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {status.exclusiveContent.map((c) => (
                      <StaggerItem key={c.id}>
                        <GlassCard className="p-4" glow={`${GOLD}11`}>
                          <span className="text-[10px] uppercase tracking-wider text-white/30">
                            {c.type}
                          </span>
                          <h3
                            className="mt-1 text-sm font-semibold"
                            style={{ color: GOLD }}
                          >
                            {c.title}
                          </h3>
                        </GlassCard>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </section>
            )}
        </>
      ) : (
        /* Non-member view */
        <>
          {/* Eligibility card */}
          <GlassCard
            className="p-8 mb-8"
            hover={false}
            glow={eligibility?.eligible ? `${GOLD}22` : undefined}
          >
            <h2
              className="text-xl font-bold tracking-tight mb-2"
              style={{
                color: eligibility?.eligible ? GOLD : 'white',
              }}
            >
              {eligibility?.eligible
                ? 'Splnujes podminky!'
                : 'Pozadavky pro vstup'}
            </h2>
            <p className="text-sm text-white/50 mb-6">
              {eligibility?.eligible
                ? 'Mas narok na VIP pristup. Prijmi pozvanku.'
                : 'Splnuj vsechny podminky pro pristup do VIP.'}
            </p>

            {/* Requirements */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              {eligibility?.requirements?.map((r: any, i: number) => (
                <RequirementRow
                  key={i}
                  label={r.label}
                  met={r.met}
                  current={r.current}
                  target={r.target}
                />
              ))}
            </div>

            {eligibility?.eligible && (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="mt-6 w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #b8941e)`,
                  color: '#000',
                }}
              >
                {accepting
                  ? 'Prijimam...'
                  : 'Prijmout pozvanku'}
              </button>
            )}
          </GlassCard>

          {/* Info */}
          <section className="mb-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${GOLD}66` }}>
              Co ziskas
            </p>
            <div className="mt-4 space-y-2">
              {[
                'Exkluzivni treninky od top treneru',
                'Prioritni AI coaching',
                'VIP badge na profilu',
                'Pristup ke specialnim vyzivam',
                'Early access k novym featurkam',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <span style={{ color: `${GOLD}66` }}>
                    &#9733;
                  </span>
                  <span className="text-sm text-white/50">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </V2Layout>
  );
}
