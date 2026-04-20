'use client';

import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';

const SPORTS = [
  {
    href: '/shadow-boxing',
    title: 'Shadow Boxing',
    subtitle: 'Kombos, udery, obrana',
    description: 'AI treninkovy program pro box a MMA. Kombinace uderu, obrana, cardio.',
    accent: '#FF375F',
    icon: 'punch',
  },
  {
    href: '/golf-lab',
    title: 'Golf Swing Lab',
    subtitle: 'Drive, Chip, Putt',
    description: 'Vizualizace a analyza golfoveho svingu. Procvic techniku bez hriste.',
    accent: '#A8FF00',
    icon: 'golf',
  },
  {
    href: '/micro-workout',
    title: 'Micro Workout',
    subtitle: '5 minut, 3 cviky',
    description: 'Rychly denni challenge. Zadne vymluvy, zadne premysleni.',
    accent: '#FF9F0A',
    icon: 'timer',
  },
  {
    href: '/soccer-drills',
    title: 'Soccer Drills',
    subtitle: 'Hlavicky, prihrávky, brankar',
    description: 'Fotbalove dovednosti — dribling, hlavicky, brankarsky trenink.',
    accent: '#30D5C8',
    icon: 'soccer',
  },
  {
    href: '/gym/start',
    title: 'Gym Workout',
    subtitle: 'Plan + AI Coach',
    description: 'Klasicky trenink s AI osobnim trenerem. Forma, opakovaní, pokrok.',
    accent: '#00E5FF',
    icon: 'gym',
  },
];

export default function SportsHubPage() {
  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Trenuj cokoliv</V2SectionLabel>
        <V2Display size="xl">Sporty.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Fitness, bojove sporty, golf — vsechno na jednom miste s 3D vizualizaci a AI coachem.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SPORTS.map((sport) => (
          <Link
            key={sport.href}
            href={sport.href}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
              style={{ background: sport.accent }}
            />
            <div className="relative">
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: sport.accent }}
              >
                {sport.subtitle}
              </div>
              <V2Display size="md">{sport.title}</V2Display>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                {sport.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </V2Layout>
  );
}
