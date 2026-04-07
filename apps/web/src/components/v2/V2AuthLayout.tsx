'use client';

export function V2AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(255, 55, 95, 0.10) 0%, rgba(0, 0, 0, 1) 60%)',
        }}
      />
      <div className="absolute top-10 text-sm font-bold tracking-tight">FitAI</div>
      <div className="w-full max-w-md">{children}</div>
      <div className="absolute bottom-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-white/20">
        Designed for performance
      </div>
    </div>
  );
}

export function V2Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full border-b border-white/15 bg-transparent py-3 text-lg text-white placeholder-white/20 transition focus:border-white focus:outline-none"
      />
    </label>
  );
}

export function V2Button({
  children,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  full?: boolean;
}) {
  const cls =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-white/90'
      : 'border border-white/20 text-white hover:border-white/50';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${cls} ${full ? 'w-full' : ''} rounded-full px-8 py-4 text-sm font-semibold tracking-tight transition disabled:opacity-30`}
    >
      {children}
    </button>
  );
}
