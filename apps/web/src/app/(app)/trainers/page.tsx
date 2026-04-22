'use client';

/**
 * Trainers — trainer directory with search and specialization filters.
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getTrainers } from '@/lib/api';

type Trainer = {
  id: string; name: string; avatarUrl?: string; bio: string;
  supertrainer: boolean; isSupertrainer?: boolean;
  responseRate: number; totalSessions: number;
  specializations: string[]; rating: number; reviewCount: number;
  user?: { name: string; avatarUrl?: string }; _count?: { reviews: number }; avgRating?: number;
};

const SPECIALIZATIONS = [
  'All',
  'Strength',
  'Hypertrophy',
  'Cardio',
  'Mobility',
  'Nutrition',
  'Rehab',
  'Sport-specific',
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i <= Math.round(rating) ? '#FFD600' : '#333',
          }}
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Link href={`/trainers/${trainer.id}`}>
      <GlassCard className="p-5 h-full">
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 text-lg font-bold"
            style={{ width: 56, height: 56 }}
          >
            {trainer.avatarUrl ? (
              <img
                src={trainer.avatarUrl}
                alt={trainer.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white/60">
                {trainer.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white truncate">
                {trainer.name}
              </h3>
              {trainer.isSupertrainer && (
                <span className="flex-shrink-0 rounded-full bg-[#BF5AF2]/20 px-2 py-0.5 text-[10px] font-semibold text-[#BF5AF2] border border-[#BF5AF2]/30">
                  SUPERTRAINER
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Stars rating={trainer.rating} size={12} />
              <span className="text-[11px] text-white/40">
                ({trainer.reviewCount})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {trainer.specializations.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] text-white/50"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-white/35">
          <span>Response {trainer.responseRate}%</span>
          <span>{trainer.totalSessions} sessions</span>
        </div>
      </GlassCard>
    </Link>
  );
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    document.title = 'FitAI — Trainers';
  }, []);

  useEffect(() => {
    getTrainers()
      .then((data) => setTrainers(data as any as Trainer[]))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return trainers.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filter !== 'All' && !t.specializations.includes(filter)) {
        return false;
      }
      return true;
    });
  }, [trainers, search, filter]);

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Find Your Coach</V2SectionLabel>
        <V2Display size="xl">Trainers.</V2Display>
      </section>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat trenera..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all ${
              filter === s
                ? 'bg-[#FF375F] text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist trenery.
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-white/30">Zadni treneri nenalezeni.</p>
        </div>
      ) : (
        <StaggerContainer>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <StaggerItem key={t.id}>
                <TrainerCard trainer={t} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </V2Layout>
  );
}
