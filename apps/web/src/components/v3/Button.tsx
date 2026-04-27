'use client';

interface ButtonProps {
  variant?: 'primary' | 'accent' | 'ghost' | 'glass' | 'plain';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  full?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

const sizes = {
  sm: { height: 32, padding: '0 12px', fontSize: 12 } as const,
  md: { height: 40, padding: '0 20px', fontSize: 14 } as const,
  lg: { height: 48, padding: '0 28px', fontSize: 15 } as const,
};

const variants: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--bg-3)', color: 'var(--text-1)' },
  accent: {
    background: 'var(--accent)', color: '#fff',
    boxShadow: 'var(--shadow-ember)',
  },
  ghost: {
    background: 'transparent', color: 'var(--text-2)',
    border: '1px solid var(--stroke-2)',
  },
  glass: {
    background: 'var(--bg-glass)', color: 'var(--text-1)',
    border: '1px solid var(--stroke-1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  plain: { background: 'transparent', color: 'var(--text-2)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  full,
  children,
  onClick,
  disabled,
  className = '',
  style,
  type = 'button',
}: ButtonProps) {
  const s = sizes[size];
  const v = variants[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`v3-btn v3-btn--${variant} ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, fontWeight: 600, letterSpacing: '-0.01em',
        borderRadius: 'var(--r-pill)',
        transition: 'transform .2s ease, background .2s ease, box-shadow .2s ease',
        whiteSpace: 'nowrap', userSelect: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        width: full ? '100%' : undefined,
        border: 'none',
        ...s, ...v, ...style,
      }}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}
