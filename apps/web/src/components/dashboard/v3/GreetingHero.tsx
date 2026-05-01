'use client';

interface GreetingHeroProps {
  firstName: string;
  subtitle: string;
  motivation?: string | null;
  morningBrief?: string | null;
  onRefresh?: () => void;
}

function timeContext(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export default function GreetingHero({
  firstName,
  subtitle,
  motivation,
  morningBrief,
  onRefresh,
}: GreetingHeroProps) {
  const hasContent = motivation || morningBrief;

  return (
    <section style={{ padding: '56px 0 40px', textAlign: 'center' }}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>
        {subtitle}
        {onRefresh && (
          <button
            onClick={onRefresh}
            aria-label="Refresh"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', marginLeft: 8, verticalAlign: 'middle',
              opacity: 0.5, transition: 'opacity .2s',
            }}
          >
            &#x21BB;
          </button>
        )}
      </div>

      <h1
        className="v3-display-2 v3-clay"
        style={{ marginBottom: hasContent ? 16 : 0 }}
      >
        {firstName}.
      </h1>

      {morningBrief && (
        <div style={{
          maxWidth: 480, margin: '0 auto 12px',
          padding: '12px 20px', borderRadius: 'var(--r-lg, 12px)',
          background: 'rgba(232,93,44,0.06)',
          border: '1px solid rgba(232,93,44,0.12)',
        }}>
          <span className="v3-caption" style={{
            color: 'var(--accent)', fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            fontSize: 10,
          }}>
            {timeContext()} &middot; Your AI Coach recommends
          </span>
          <p className="v3-body" style={{
            margin: '6px 0 0', color: 'var(--text-2)',
            lineHeight: 1.5,
          }}>
            {morningBrief}
          </p>
        </div>
      )}

      {motivation && (
        <p
          className="v3-body"
          style={{
            maxWidth: 420, margin: '0 auto',
            color: 'var(--text-3)', fontStyle: 'italic',
          }}
        >
          &ldquo;{motivation}&rdquo;
        </p>
      )}
    </section>
  );
}
