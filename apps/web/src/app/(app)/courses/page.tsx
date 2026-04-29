'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getCourses, type CourseData } from '@/lib/api/content';

const CATEGORIES = [
  { key: null, label: 'Vse' },
  { key: 'strength', label: 'Strength' },
  { key: 'yoga', label: 'Yoga' },
  { key: 'running', label: 'Running' },
  { key: 'mobility', label: 'Mobility' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'recovery', label: 'Recovery' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  strength: 'var(--accent)',
  yoga: 'var(--sage)',
  running: '#FF9F0A',
  mobility: 'var(--clay-deep)',
  nutrition: 'var(--sage)',
  recovery: '#64D2FF',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  strength: 'linear-gradient(135deg, #2d0a14 0%, #1a0a2e 100%)',
  yoga: 'linear-gradient(135deg, #0a2d1a 0%, #0a2e2e 100%)',
  running: 'linear-gradient(135deg, #2d1a0a 0%, #2d0a0a 100%)',
  mobility: 'linear-gradient(135deg, #1a0a2e 0%, #2d0a2e 100%)',
  nutrition: 'linear-gradient(135deg, #0a2d0a 0%, #1a2e0a 100%)',
  recovery: 'linear-gradient(135deg, #0a1a2d 0%, #0a2d2d 100%)',
};

function renderStars(rating: number): string {
  const full = Math.round(rating);
  return '\u2605'.repeat(full) + '\u2606'.repeat(5 - full);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FitAI — Kurzy';
  }, []);

  useEffect(() => {
    setLoading(true);
    getCourses(filter ?? undefined)
      .then((data) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const featured = courses[0] ?? null;
  const grid = courses.slice(1);

  return (
    <>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      {/* Hero */}
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">MasterClass</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Learn from<br />
          <em className="v3-clay" style={{ fontWeight: 300 }}>the best.</em>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Video kurzy od top treneru. Sila, yoga, vyzivy, mobilita a dalsi.
        </p>
      </section>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key ?? 'all'}
            onClick={() => setFilter(c.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              filter === c.key
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Featured course */}
          {featured && <FeaturedCard course={featured} />}

          {/* Course grid */}
          {grid.length > 0 && (
            <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((course) => (
                <StaggerItem key={course.id}>
                  <CourseCard course={course} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
      <p className="mb-2 text-3xl">{'\uD83C\uDFAC'}</p>
      <p className="text-sm text-white/40">
        Zatim zadne kurzy. Novy obsah brzy!
      </p>
    </div>
  );
}

function FeaturedCard({ course }: { course: CourseData }) {
  const color = CATEGORY_COLORS[course.category] || '#00E5FF';
  const gradient =
    CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.strength;

  return (
    <Link href={`/courses/${course.id}`}>
      <div
        className="group overflow-hidden rounded-2xl border border-white/8 transition hover:border-white/15"
        style={{ background: gradient }}
      >
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
          {/* Cover placeholder */}
          <div
            className="flex h-48 w-full shrink-0 items-center justify-center rounded-xl sm:h-56 sm:w-72"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="text-5xl opacity-30">{'\uD83C\uDFAC'}</span>
          </div>

          <div className="flex-1">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {course.category}
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {course.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm text-white/50">
              {course.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/40">
              <CreatorBadge name={course.creator.name} />
              <span>{course.totalLessons} lekci</span>
              <span>{formatDuration(course.durationMinutes)}</span>
              <span className="text-[#FF9F0A]">
                {renderStars(course.rating)}
              </span>
            </div>
            <div className="mt-4">
              <PriceTag price={course.price} isFree={course.isFree} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CourseCard({ course }: { course: CourseData }) {
  const color = CATEGORY_COLORS[course.category] || '#00E5FF';
  const gradient =
    CATEGORY_GRADIENTS[course.category] || CATEGORY_GRADIENTS.strength;

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition hover:border-white/15">
        {/* Cover */}
        <div
          className="flex h-36 items-end p-4"
          style={{ background: gradient }}
        >
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {course.category}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold tracking-tight text-white">
            {course.title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <CreatorBadge name={course.creator.name} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-white/40">
            <span>{course.totalLessons} lekci</span>
            <span>{formatDuration(course.durationMinutes)}</span>
            <span className="text-[#FF9F0A]">
              {renderStars(course.rating)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <PriceTag price={course.price} isFree={course.isFree} />
            <span className="text-[10px] text-white/30">
              {course.studentCount} studentu
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CreatorBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white">
        {name.charAt(0)}
      </div>
      <span className="text-xs text-white/60">{name}</span>
    </div>
  );
}

function PriceTag({ price, isFree }: { price: number; isFree: boolean }) {
  if (isFree || price === 0) {
    return (
      <span
        className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: 'var(--sage)', color: '#000' }}
      >
        Free
      </span>
    );
  }
  return (
    <span className="text-sm font-bold text-white">
      {price} Kc
    </span>
  );
}
