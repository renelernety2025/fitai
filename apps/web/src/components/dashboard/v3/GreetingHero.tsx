'use client';

interface GreetingHeroProps {
  firstName: string;
  subtitle: string;
  motivation?: string | null;
  onRefresh?: () => void;
}

export default function GreetingHero({
  firstName,
  subtitle,
  motivation,
  onRefresh,
}: GreetingHeroProps) {
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
        style={{ marginBottom: motivation ? 16 : 0 }}
      >
        {firstName}.
      </h1>

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
