'use client';

interface CardProps {
  children: React.ReactNode;
  padding?: number | string;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({
  children,
  padding = 20,
  hover = false,
  onClick,
  className = '',
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`v3-card ${hover ? 'v3-card--hover' : ''} ${className}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--stroke-1)',
        borderRadius: 'var(--r-lg)',
        padding,
        transition: 'border-color .3s cubic-bezier(.16,1,.3,1), transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s cubic-bezier(.16,1,.3,1)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
