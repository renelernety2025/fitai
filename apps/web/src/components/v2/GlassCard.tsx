'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, glow, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-white/8 backdrop-blur-sm transition-all duration-200 ${
        hover ? 'hover:scale-[1.01] hover:border-white/15' : ''
      } ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: glow ? `0 0 30px ${glow}` : undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {children}
    </div>
  );
}
