'use client';

import { useRef, useState } from 'react';
import {
  getFoodPhotoUploadUrl,
  analyzeFoodPhoto,
  addFoodLog,
  type FoodPhotoAnalysis,
} from '@/lib/api';

const SOURCES = [
  { value: 'home', label: 'Doma', color: '#A8FF00' },
  { value: 'restaurant', label: 'Restaurace', color: '#FF9500' },
  { value: 'store', label: 'Obchod', color: '#00E5FF' },
  { value: 'delivery', label: 'Rozvoz', color: '#BF5AF2' },
] as const;

const STARS = [1, 2, 3, 4, 5];

interface Props {
  mealType: string;
  onClose: () => void;
  onLogged: () => void;
}

export default function FoodCamera({ mealType, onClose, onLogged }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'pick' | 'analyzing' | 'result'>('pick');
  const [result, setResult] = useState<FoodPhotoAnalysis | null>(null);
  const [s3Key, setS3Key] = useState('');
  const [source, setSource] = useState('home');
  const [sourceDetail, setSourceDetail] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleFile(file: File) {
    setStep('analyzing');
    setError('');
    try {
      const { uploadUrl, s3Key: key } = await getFoodPhotoUploadUrl();
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      setS3Key(key);
      const analysis = await analyzeFoodPhoto(key);
      setResult(analysis);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri analyze');
      setStep('pick');
    }
  }

  async function handleLog() {
    if (!result) return;
    setSaving(true);
    try {
      await addFoodLog({
        mealType,
        name: result.name,
        kcal: result.kcal,
        proteinG: result.proteinG,
        carbsG: result.carbsG,
        fatG: result.fatG,
      });
      onLogged();
      onClose();
    } catch {
      setError('Chyba pri ukladani');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-black p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Rozpoznat jidlo</h2>
          <button
            onClick={onClose}
            className="text-white/40 transition hover:text-white"
          >
            X
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'pick' && <PickStep fileRef={fileRef} onFile={handleFile} />}
        {step === 'analyzing' && <AnalyzingStep />}
        {step === 'result' && result && (
          <ResultStep
            result={result}
            source={source}
            setSource={setSource}
            sourceDetail={sourceDetail}
            setSourceDetail={setSourceDetail}
            rating={rating}
            setRating={setRating}
            notes={notes}
            setNotes={setNotes}
            saving={saving}
            onLog={handleLog}
          />
        )}
      </div>
    </div>
  );
}

/* ── Sub-steps (kept in same file, under 300 lines) ── */

function PickStep({
  fileRef,
  onFile,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (f: File) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A8FF00" strokeWidth="1.5" strokeLinecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
      <p className="text-center text-sm text-white/50">
        Vyfoite nebo nahrajte fotku jidla a AI odhadne makra
      </p>
      <button
        onClick={() => fileRef.current?.click()}
        className="rounded-full px-8 py-3 text-sm font-bold text-black"
        style={{ backgroundColor: '#A8FF00' }}
      >
        Vyfotit jidlo
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

function AnalyzingStep() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#A8FF00]" />
      <p className="text-sm text-white/50">AI analyzuje fotku...</p>
    </div>
  );
}

function ResultStep({
  result,
  source,
  setSource,
  sourceDetail,
  setSourceDetail,
  rating,
  setRating,
  notes,
  setNotes,
  saving,
  onLog,
}: {
  result: FoodPhotoAnalysis;
  source: string;
  setSource: (v: string) => void;
  sourceDetail: string;
  setSourceDetail: (v: string) => void;
  rating: number;
  setRating: (v: number) => void;
  notes: string;
  setNotes: (v: string) => void;
  saving: boolean;
  onLog: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Detected food */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-lg font-bold text-white">{result.name}</div>
        {result.confidence != null && (
          <div className="mt-1 text-xs text-white/40">
            Jistota: {Math.round(result.confidence * 100)}%
          </div>
        )}
        <div className="mt-3 grid grid-cols-4 gap-3 text-center text-xs">
          <MacroPill label="kcal" value={result.kcal} color="#FFF" />
          <MacroPill label="P" value={result.proteinG} color="#FF375F" />
          <MacroPill label="S" value={result.carbsG} color="#A8FF00" />
          <MacroPill label="T" value={result.fatG} color="#00E5FF" />
        </div>
        {result.ingredients && (
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            {result.ingredients}
          </p>
        )}
      </div>

      {/* Source selector */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          Zdroj
        </label>
        <div className="flex gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => setSource(s.value)}
              className="rounded-full border px-3 py-1.5 text-[11px] font-medium transition"
              style={{
                borderColor: source === s.value ? s.color : 'rgba(255,255,255,0.1)',
                color: source === s.value ? s.color : 'rgba(255,255,255,0.5)',
                backgroundColor: source === s.value ? `${s.color}15` : 'transparent',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {(source === 'restaurant' || source === 'store') && (
          <input
            value={sourceDetail}
            onChange={(e) => setSourceDetail(e.target.value)}
            placeholder={source === 'restaurant' ? 'Nazev restaurace' : 'Nazev obchodu'}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
          />
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          Hodnoceni
        </label>
        <div className="flex gap-1">
          {STARS.map((s) => (
            <button
              key={s}
              onClick={() => setRating(rating === s ? 0 : s)}
              className="text-xl transition"
              style={{ color: s <= rating ? '#FF9500' : 'rgba(255,255,255,0.15)' }}
            >
              *
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Poznamky (volitelne)"
        rows={2}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
      />

      {/* Submit */}
      <button
        onClick={onLog}
        disabled={saving}
        className="w-full rounded-full py-3 text-sm font-bold text-black transition disabled:opacity-50"
        style={{ backgroundColor: '#A8FF00' }}
      >
        {saving ? 'Ukladam...' : 'Pridat do logu'}
      </button>
    </div>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <div className="text-base font-bold tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[9px] uppercase text-white/40">{label}</div>
    </div>
  );
}
