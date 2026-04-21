'use client';

interface MilestoneBadgeProps {
  label: string;
}

export function MilestoneBadge({ label }: MilestoneBadgeProps) {
  return (
    <div className="my-6 flex justify-center">
      <div
        className="flex items-center gap-2 rounded-full px-5 py-2"
        style={{
          border: '1px solid rgba(255, 214, 0, 0.4)',
          background:
            'linear-gradient(135deg, rgba(255, 214, 0, 0.08) 0%, rgba(255, 214, 0, 0.02) 100%)',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#FFD600"
          stroke="none"
        >
          <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
        </svg>
        <span
          className="text-sm font-semibold"
          style={{ color: '#FFD600' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
