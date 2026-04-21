'use client';

interface RatingStarsProps {
  value: number | null;
  onChange: (rating: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-xl transition hover:scale-110"
          aria-label={`${star} stars`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={value !== null && star <= value ? '#FFD600' : 'rgba(255,255,255,0.15)'}
            stroke="none"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
