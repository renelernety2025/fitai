'use client';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function SectionHeader({ eyebrow, title, action, className = '' }: SectionHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <div>
        {eyebrow && (
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
        )}
        <div className="v3-display-3">{title}</div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: 'var(--text-3)', fontSize: 13, fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color .15s ease',
          }}
        >
          {action.label} <span aria-hidden>&#8594;</span>
        </button>
      )}
    </div>
  );
}
