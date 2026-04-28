'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getExperiences, bookExperience } from '@/lib/api';

type Experience = {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  price: number;
  currency: string;
  trainerName: string;
  trainerRating: number;
  spotsTotal: number;
  spotsLeft: number;
  description: string;
};

const CATEGORIES = [
  'GROUP',
  'OUTDOOR',
  'WELLNESS',
  'COMBAT',
  'ADVENTURE',
  'NUTRITION',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  GROUP: '#FF375F',
  OUTDOOR: '#A8FF00',
  WELLNESS: '#BF5AF2',
  COMBAT: '#FF9F0A',
  ADVENTURE: '#00E5FF',
  NUTRITION: '#FF375F',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  GROUP: 'linear-gradient(135deg, #2d0a14 0%, #1a0a2e 100%)',
  OUTDOOR: 'linear-gradient(135deg, #0a2d0a 0%, #1a2e0a 100%)',
  WELLNESS: 'linear-gradient(135deg, #1a0a2e 0%, #2d0a2e 100%)',
  COMBAT: 'linear-gradient(135deg, #2d1a0a 0%, #2d0a0a 100%)',
  ADVENTURE: 'linear-gradient(135deg, #0a1a2d 0%, #0a2d2d 100%)',
  NUTRITION: 'linear-gradient(135deg, #2d0a14 0%, #2d1a0a 100%)',
};

export default function ExperiencesPage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FitAI — Experiences';
  }, []);

  useEffect(() => {
    setLoading(true);
    getExperiences(filter ? { category: filter } : undefined)
      .then((e) => setItems(e as Experience[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  function handleBook(id: string) {
    setBooking(id);
    bookExperience(id)
      .then(() => {
        setItems((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, spotsLeft: Math.max(0, e.spotsLeft - 1) } : e,
          ),
        );
      })
      .catch(() => {})
      .finally(() => setBooking(null));
  }

  function formatDate(d: string): string {
    return new Date(d).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function renderStars(rating: number): string {
    const full = Math.round(rating);
    return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
  }

  return (
    <>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-8 pb-6">
        <V2SectionLabel>DISCOVER</V2SectionLabel>
        <V2Display size="xl">Experiences</V2Display>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Ziv zazitky s trenery. Outdoor treninky, wellness, bojove sporty a dalsi.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
            filter === null
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Vse
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              filter === c
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
            style={filter === c ? { borderColor: CATEGORY_COLORS[c] } : {}}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <p className="mb-2 text-3xl">{'\uD83C\uDFD5\uFE0F'}</p>
          <p className="text-sm text-white/40">
            Zatim zadne zazitky. Pridej se jako trener a vytvor prvni!
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((exp) => {
            const color = CATEGORY_COLORS[exp.category] || '#00E5FF';
            return (
              <StaggerItem key={exp.id}>
                <div className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition hover:border-white/15">
                  <div
                    className="flex h-40 items-end p-4"
                    style={{
                      background:
                        CATEGORY_GRADIENTS[exp.category] || CATEGORY_GRADIENTS.ADVENTURE,
                    }}
                  >
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${color}22`,
                        color,
                      }}
                    >
                      {exp.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <Link href={`/experiences/${exp.id}`}>
                      <h3 className="text-base font-bold tracking-tight text-white transition group-hover:text-[#00E5FF]">
                        {exp.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-white/40">
                      {exp.location} &middot; {formatDate(exp.date)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                        {exp.trainerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {exp.trainerName}
                        </p>
                        <p className="text-[10px] text-[#FF9F0A]">
                          {renderStars(exp.trainerRating)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-white">
                          {exp.price} {exp.currency || 'Kc'}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {exp.spotsLeft}/{exp.spotsTotal} mist
                        </p>
                      </div>
                      <button
                        onClick={() => handleBook(exp.id)}
                        disabled={booking === exp.id || exp.spotsLeft <= 0}
                        className="rounded-xl px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition disabled:opacity-40"
                        style={{ backgroundColor: color }}
                      >
                        {exp.spotsLeft <= 0 ? 'Plno' : 'Book'}
                      </button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </>
  );
}
