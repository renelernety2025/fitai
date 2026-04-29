'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader } from '@/components/v3';
import { getBillingStatus, getPlans, createCheckout } from '@/lib/api';

interface Plan {
  tier: string;
  name: string;
  priceKc: number;
  interval: string;
  features: string[];
}

interface BillingStatus {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {});
    getBillingStatus().then(setBilling).catch(() => {});
  }, []);

  async function handleUpgrade(tier: string) {
    setLoading(tier);
    try {
      const res = await createCheckout(tier);
      if (res.url) window.location.href = res.url;
    } finally {
      setLoading(null);
    }
  }

  const currentTier = billing?.tier ?? 'FREE';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
      <SectionHeader eyebrow="Membership" title="Choose your plan" />
      <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 40, maxWidth: 520 }}>
        Unlock the full power of your AI personal trainer. Upgrade anytime, cancel anytime.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            isCurrent={currentTier === plan.tier}
            isUpgrade={tierRank(plan.tier) > tierRank(currentTier)}
            isDowngrade={tierRank(plan.tier) < tierRank(currentTier)}
            loading={loading === plan.tier}
            onSelect={() => handleUpgrade(plan.tier)}
          />
        ))}
      </div>

      <ComparisonTable plans={plans} currentTier={currentTier} />
      <style>{pricingStyles}</style>
    </div>
  );
}

function PlanCard({ plan, isCurrent, isUpgrade, isDowngrade, loading, onSelect }: {
  plan: Plan; isCurrent: boolean; isUpgrade: boolean;
  isDowngrade: boolean; loading: boolean; onSelect: () => void;
}) {
  const isPro = plan.tier === 'PRO';
  return (
    <Card
      className={isPro ? 'pricing-card--featured' : ''}
      style={isPro ? { border: '1px solid var(--accent)', position: 'relative' } : {}}
      padding={28}
    >
      {isPro && <Tag color="var(--accent)" className="pricing-popular">Most popular</Tag>}
      <h3 className="v3-display-4" style={{ marginBottom: 4 }}>{plan.name}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
        <span className="v3-display-2">{plan.priceKc}</span>
        <span className="v3-body" style={{ color: 'var(--text-3)' }}>
          {plan.priceKc === 0 ? '' : `Kc/${plan.interval}`}
        </span>
      </div>

      <ul className="pricing-features">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="ghost" size="lg" full disabled>Current plan</Button>
      ) : isUpgrade ? (
        <Button variant="accent" size="lg" full onClick={onSelect} disabled={loading}>
          {loading ? 'Processing...' : 'Upgrade'}
        </Button>
      ) : isDowngrade ? (
        <Button variant="ghost" size="lg" full onClick={onSelect} disabled={loading}>
          {loading ? 'Processing...' : 'Downgrade'}
        </Button>
      ) : (
        <Button variant="primary" size="lg" full onClick={onSelect} disabled={loading}>
          {loading ? 'Processing...' : 'Get started'}
        </Button>
      )}
    </Card>
  );
}

function ComparisonTable({ plans, currentTier }: { plans: Plan[]; currentTier: string }) {
  if (plans.length === 0) return null;
  const allFeatures = [...new Set(plans.flatMap((p) => p.features))];

  return (
    <div style={{ marginTop: 56 }}>
      <SectionHeader eyebrow="Details" title="Feature comparison" />
      <div className="pricing-table-wrap">
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Feature</th>
              {plans.map((p) => (
                <th key={p.tier}>
                  {p.name}
                  {p.tier === currentTier && <Tag color="var(--accent)">You</Tag>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feat) => (
              <tr key={feat}>
                <td>{feat}</td>
                {plans.map((p) => (
                  <td key={p.tier}>{p.features.includes(feat) ? checkMark : dash}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function tierRank(tier: string): number {
  const ranks: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  return ranks[tier] ?? 0;
}

const checkMark = <span style={{ color: 'var(--accent)', fontWeight: 700 }}>&#10003;</span>;
const dash = <span style={{ color: 'var(--text-3)' }}>&#8212;</span>;

const pricingStyles = `
.pricing-card--featured{box-shadow:var(--shadow-ember)}
.pricing-popular{position:absolute;top:-10px;right:16px}
.pricing-features{list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px}
.pricing-features li{font-size:13px;color:var(--text-2);padding-left:20px;position:relative}
.pricing-features li::before{content:"\\2713";position:absolute;left:0;color:var(--accent);font-weight:700;font-size:12px}
.pricing-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.pricing-table{width:100%;border-collapse:collapse;font-size:13px}
.pricing-table th,.pricing-table td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--stroke-1)}
.pricing-table th{color:var(--text-1);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;display:flex;align-items:center;gap:8px}
.pricing-table thead th{display:table-cell}
.pricing-table td{color:var(--text-2)}
.pricing-table tbody tr:hover{background:var(--bg-1)}
`;
