'use client';

/**
 * Trainer Detail — full profile with stats, specializations, reviews.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getTrainerDetail } from '@/lib/api';

type TrainerDetail = {
  id: string; name: string; avatarUrl?: string; bio?: string;
  supertrainer: boolean; isSupertrainer?: boolean;
  responseRate: number; totalSessions: number;
  specializations: string[]; certifications: string[];
  rating: number; reviewCount: number;
  reviews: any[]; experiences: any[];
  user?: { name: string; avatarUrl?: string }; _count?: { reviews: number }; avgRating?: number;
};

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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/5 px-4 py-3">
      <span className="text-lg font-bold tracking-tight text-white">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
    </div>
  );
}

export default function TrainerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [trainer, setTrainer] = useState<TrainerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Trainer';
  }, []);

  useEffect(() => {
    if (!id) return;
    getTrainerDetail(id)
      .then((raw) => {
        const data = raw as any as TrainerDetail;
        setTrainer(data);
        document.title = `FitAI — ${data.name}`;
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <V2Layout>
        <div className="pt-12 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </V2Layout>
    );
  }

  if (error || !trainer) {
    return (
      <V2Layout>
        <div className="pt-12">
          <p className="text-sm text-[#FF375F]">
            Nepodarilo se nacist profil trenera.
          </p>
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      {/* Hero */}
      <section className="pt-12 pb-8">
        <div className="flex items-start gap-5">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 text-2xl font-bold"
            style={{ width: 80, height: 80 }}
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
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {trainer.name}
              </h1>
              {trainer.isSupertrainer && (
                <span className="rounded-full bg-[#BF5AF2]/20 px-3 py-1 text-[11px] font-semibold text-[#BF5AF2] border border-[#BF5AF2]/30">
                  SUPERTRAINER
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Stars rating={trainer.rating} size={16} />
              <span className="text-sm text-white/40">
                {trainer.rating.toFixed(1)} ({trainer.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      {trainer.bio && (
        <GlassCard className="p-6 mb-6">
          <p className="text-sm leading-relaxed text-white/60">
            {trainer.bio}
          </p>
        </GlassCard>
      )}

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <StatBox
          label="Rating"
          value={trainer.rating.toFixed(1)}
        />
        <StatBox label="Reviews" value={String(trainer.reviewCount)} />
        <StatBox
          label="Response"
          value={`${trainer.responseRate}%`}
        />
        <StatBox
          label="Sessions"
          value={String(trainer.totalSessions)}
        />
      </div>

      {/* Specializations */}
      <section className="mb-6">
        <V2SectionLabel>Specializations</V2SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {trainer.specializations.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/8 px-3 py-1 text-xs text-[#00E5FF]"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Certifications */}
      {trainer.certifications.length > 0 && (
        <section className="mb-6">
          <V2SectionLabel>Certifications</V2SectionLabel>
          <div className="mt-3 space-y-2">
            {trainer.certifications.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 text-sm text-white/55"
              >
                <span className="text-[#A8FF00]">&#10003;</span>
                {c}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action buttons */}
      <div className="mb-10 flex gap-3">
        <button className="flex-1 rounded-xl bg-[#FF375F] py-3 text-sm font-semibold text-white transition-all hover:bg-[#FF375F]/80">
          Book 1:1 Session
        </button>
        <button className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10">
          Send Message
        </button>
      </div>

      {/* Reviews */}
      <section className="mb-12">
        <V2SectionLabel>Reviews</V2SectionLabel>
        {trainer.reviews.length === 0 ? (
          <div className="mt-4 py-12 text-center text-white/30">
            <p className="text-sm">Zatim zadne recenze.</p>
          </div>
        ) : (
          <StaggerContainer>
            <div className="mt-4 space-y-3">
              {trainer.reviews.map((r) => (
                <StaggerItem key={r.id}>
                  <GlassCard className="p-4" hover={false}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {r.userName}
                      </span>
                      <Stars rating={r.rating} size={12} />
                    </div>
                    <p className="mt-2 text-sm text-white/50">
                      {r.comment}
                    </p>
                    <span className="mt-2 block text-[10px] text-white/25">
                      {new Date(r.createdAt).toLocaleDateString('cs-CZ')}
                    </span>
                  </GlassCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}
      </section>
    </V2Layout>
  );
}
