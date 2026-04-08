'use client';

import { useEffect, useRef, useState } from 'react';
import { V2Layout } from '@/components/v2/V2Layout';
import {
  getProgressPhotos,
  getProgressPhotoStats,
  getProgressPhotoUploadUrl,
  analyzeProgressPhoto,
  deleteProgressPhoto,
  type BodyPhoto,
  type BodyPhotoStats,
  type PhotoSide,
} from '@/lib/api';

const SIDES: { value: PhotoSide; label: string }[] = [
  { value: 'FRONT', label: 'Zepředu' },
  { value: 'SIDE', label: 'Z boku' },
  { value: 'BACK', label: 'Zezadu' },
];

export default function ProgresFotkyPage() {
  const [photos, setPhotos] = useState<BodyPhoto[]>([]);
  const [stats, setStats] = useState<BodyPhotoStats | null>(null);
  const [filter, setFilter] = useState<PhotoSide | 'ALL'>('ALL');
  const [uploadingSide, setUploadingSide] = useState<PhotoSide | null>(null);
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<[string?, string?]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    getProgressPhotos(filter === 'ALL' ? undefined : filter).then(setPhotos).catch(console.error);
    getProgressPhotoStats().then(setStats).catch(console.error);
  };

  useEffect(reload, [filter]);

  async function onPickFile(file: File) {
    if (!uploadingSide) return;
    setBusy(true);
    try {
      const { uploadUrl } = await getProgressPhotoUploadUrl({
        contentType: file.type || 'image/jpeg',
        side: uploadingSide,
      });
      // Upload to S3 directly
      const res = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!res.ok) throw new Error(`S3 upload ${res.status}`);
      setUploadingSide(null);
      reload();
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function onAnalyze(id: string) {
    setAnalyzing(id);
    try {
      await analyzeProgressPhoto(id);
      reload();
    } catch (e: any) {
      alert(`Analýza selhala: ${e.message}`);
    } finally {
      setAnalyzing(null);
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Smazat tuto fotografii? Nelze vrátit zpět.')) return;
    await deleteProgressPhoto(id);
    reload();
  }

  function toggleCompare(id: string) {
    setCompareIds((curr) => {
      const [a, b] = curr;
      if (a === id) return [b];
      if (b === id) return [a];
      if (!a) return [id];
      if (!b) return [a, id];
      return [b, id];
    });
  }

  const compareA = photos.find((p) => p.id === compareIds[0]);
  const compareB = photos.find((p) => p.id === compareIds[1]);

  return (
    <V2Layout>
      <>
        {/* Header */}
        <section className="mb-16 pt-12">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Section K · Body Progress
          </div>
          <h1
            className="mb-6 font-bold tracking-tight text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
          >
            Tvoje cesta.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/55">
            Vlastní galerie progress fotek. Soukromá. Volitelně AI body composition analýza. Fotky jsou jen tvoje — žádný admin přístup, žádné sdílení bez tvého souhlasu.
          </p>
        </section>

        {/* Stats */}
        {stats && (
          <section className="mb-20 grid grid-cols-2 gap-6 border-y border-white/10 py-12 sm:grid-cols-4">
            <Stat value={stats.total} label="Fotek" />
            <Stat value={stats.daysTracked} label="Dní sledování" />
            <Stat value={stats.byAngle.front} label="Zepředu" />
            <Stat value={stats.byAngle.side + stats.byAngle.back} label="Bok + Zezadu" />
          </section>
        )}

        {/* Upload row */}
        <section className="mb-20">
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Nová fotka
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SIDES.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setUploadingSide(s.value);
                  fileRef.current?.click();
                }}
                disabled={busy}
                className="group flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] transition hover:border-white/30 hover:bg-white/[0.04] disabled:opacity-50"
              >
                <div className="text-3xl text-white/40 transition group-hover:text-white/70">+</div>
                <div className="mt-2 text-sm font-semibold text-white/65">{s.label}</div>
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/heic"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.target.value = '';
            }}
          />
          {busy && <div className="mt-4 text-xs text-white/40">Nahrávání…</div>}
        </section>

        {/* Filter */}
        <section className="mb-8 flex flex-wrap gap-2">
          {(['ALL', 'FRONT', 'SIDE', 'BACK'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-tight transition ${
                filter === f
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-white/60 hover:bg-white/5'
              }`}
            >
              {f === 'ALL' ? 'Vše' : SIDES.find((s) => s.value === f)?.label}
            </button>
          ))}
        </section>

        {/* Compare slider — only when two photos picked */}
        {compareA && compareB && (
          <section className="mb-20">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Porovnání · {new Date(compareA.takenAt).toLocaleDateString('cs-CZ')} ↔ {new Date(compareB.takenAt).toLocaleDateString('cs-CZ')}
            </div>
            <BeforeAfterSlider beforeUrl={compareA.url} afterUrl={compareB.url} />
            <button
              onClick={() => setCompareIds([])}
              className="mt-4 text-xs text-white/50 hover:text-white"
            >
              Zavřít porovnání
            </button>
          </section>
        )}

        {/* Gallery */}
        <section className="mb-32">
          <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Galerie ({photos.length})
          </div>
          {photos.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-white/40">
              Žádné fotky. Začni nahráním první.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((p) => (
                <PhotoCard
                  key={p.id}
                  photo={p}
                  isAnalyzing={analyzing === p.id}
                  isCompareTarget={compareIds.includes(p.id)}
                  onAnalyze={() => onAnalyze(p.id)}
                  onDelete={() => onDelete(p.id)}
                  onCompare={() => toggleCompare(p.id)}
                />
              ))}
            </div>
          )}
        </section>
      </>
    </V2Layout>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div
        className="font-bold tabular-nums text-white"
        style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
      >
        {value.toLocaleString('cs-CZ')}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  isAnalyzing,
  isCompareTarget,
  onAnalyze,
  onDelete,
  onCompare,
}: {
  photo: BodyPhoto;
  isAnalyzing: boolean;
  isCompareTarget: boolean;
  onAnalyze: () => void;
  onDelete: () => void;
  onCompare: () => void;
}) {
  const sideLabel = { FRONT: 'Zepředu', SIDE: 'Z boku', BACK: 'Zezadu' }[photo.side];
  const date = new Date(photo.takenAt).toLocaleDateString('cs-CZ');

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-black/40 ${
        isCompareTarget ? 'border-[#A8FF00] ring-2 ring-[#A8FF00]/40' : 'border-white/10'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={`${sideLabel} ${date}`} className="aspect-[3/4] w-full object-cover" />

      {/* hover overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
        <div className="pointer-events-auto self-end">
          <button
            onClick={onDelete}
            className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/80 hover:bg-red-500/40"
          >
            Smazat
          </button>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <button
            onClick={onCompare}
            className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-white/20"
          >
            {isCompareTarget ? '✓ Porovnávám' : 'Porovnat'}
          </button>
          {!photo.isAnalyzed && (
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-black hover:bg-white/90 disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzuju…' : '✦ AI analýza'}
            </button>
          )}
        </div>
      </div>

      {/* meta strip always visible */}
      <div className="absolute left-0 top-0 flex items-center gap-2 p-3 text-[10px] font-semibold tracking-tight">
        <span className="rounded-full bg-black/70 px-2 py-0.5 text-white/80">{sideLabel}</span>
        <span className="rounded-full bg-black/70 px-2 py-0.5 text-white/55">{date}</span>
      </div>

      {/* analysis ribbon */}
      {photo.analysis && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/85 px-3 py-2 text-[10px]">
          {photo.analysis.estimatedBodyFatPct != null ? (
            <>
              <div className="font-semibold text-[#A8FF00]">
                ~{photo.analysis.estimatedBodyFatPct.toFixed(1)}% tělesný tuk
              </div>
              {photo.analysis.estimatedMuscleMass && (
                <div className="text-white/55">Svalová hmota: {photo.analysis.estimatedMuscleMass}</div>
              )}
            </>
          ) : (
            <div className="text-[#FF9F0A]" title={photo.analysis.postureNotes || ''}>
              ⚠ AI nemohla analyzovat — {photo.analysis.postureNotes?.slice(0, 60) || 'nevhodný snímek'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BeforeAfterSlider({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full max-w-2xl select-none overflow-hidden rounded-2xl border border-white/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterUrl} alt="after" className="block w-full" draggable={false} />
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt="before"
          className="block w-full"
          style={{ width: `${10000 / pos}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/70 p-2 text-xs font-semibold text-white">
          ⇄
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(parseInt(e.target.value, 10))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/80">
        Před
      </div>
      <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/80">
        Po
      </div>
    </div>
  );
}
