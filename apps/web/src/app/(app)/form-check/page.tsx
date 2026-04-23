'use client';

import { useState, useEffect, useRef } from 'react';
import { V2Layout, V2SectionLabel, V2Display, V2Ring } from '@/components/v2/V2Layout';
import {
  getExercises,
  getFormCheckUploadUrl,
  analyzeForm,
  getFormCheckHistory,
  type ExerciseData,
  type FormCheckAnalysis,
} from '@/lib/api';

export default function FormCheckPage() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [result, setResult] = useState<FormCheckAnalysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getExercises().then(setExercises).catch(() => {});
    getFormCheckHistory().then(setHistory).catch(() => {});
  }, []);

  async function handleAnalyze() {
    if (!file || !selectedExercise) return;
    setStep('analyzing');
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'mp4';
      const { uploadUrl, s3Key } = await getFormCheckUploadUrl({
        fileName: file.name,
        contentType: file.type || `video/${ext}`,
      });
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const analysis = await analyzeForm({
        s3Key,
        exerciseId: selectedExercise,
      });
      setResult(analysis);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri analyze');
      setStep('upload');
    }
  }

  function handleReset() {
    setStep('upload');
    setResult(null);
    setFile(null);
    setSelectedExercise('');
    setError('');
  }

  return (
    <V2Layout>
      <div style={{ paddingTop: 16, marginBottom: 32 }}>
        <V2SectionLabel>ANALYZA FORMY</V2SectionLabel>
        <V2Display>AI Form Check.</V2Display>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          Nahrajte video cviku a AI analyzuje vasi formu
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <UploadStep
          fileRef={fileRef}
          file={file}
          setFile={setFile}
          exercises={exercises}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          onAnalyze={handleAnalyze}
        />
      )}

      {step === 'analyzing' && <AnalyzingStep />}

      {step === 'result' && result && (
        <ResultStep result={result} onReset={handleReset} />
      )}

      {history.length > 0 && (
        <div className="mt-12">
          <V2SectionLabel>HISTORIE</V2SectionLabel>
          {history.map((h: any, i: number) => (
            <div
              key={i}
              className="mb-3 rounded-2xl border p-4"
              style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {h.exerciseName || 'Cvik'} — {h.overallScore}/100
              </span>
            </div>
          ))}
        </div>
      )}
    </V2Layout>
  );
}

function UploadStep({
  fileRef,
  file,
  setFile,
  exercises,
  selectedExercise,
  setSelectedExercise,
  onAnalyze,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  file: File | null;
  setFile: (f: File | null) => void;
  exercises: ExerciseData[];
  selectedExercise: string;
  setSelectedExercise: (id: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="space-y-6">
      <div
        className="flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-12 transition hover:border-white/30"
        style={{ borderColor: 'var(--border-strong)' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f && f.type.startsWith('video/')) setFile(f);
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A8FF00" strokeWidth="1.5">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {file ? file.name : 'Kliknete nebo pretahnete video'}
        </p>
        <input
          ref={fileRef as React.LegacyRef<HTMLInputElement>}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </div>

      <div>
        <label
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Cvik
        </label>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none"
          style={{
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Vyberte cvik...</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.nameCs || ex.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!file || !selectedExercise}
        className="w-full rounded-full py-3.5 text-sm font-bold text-black transition disabled:opacity-30"
        style={{ backgroundColor: '#A8FF00' }}
      >
        Analyzovat
      </button>
    </div>
  );
}

function AnalyzingStep() {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-t-[#A8FF00]" style={{ borderColor: 'var(--border-strong)', borderTopColor: '#A8FF00' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        AI analyzuje vase video...
      </p>
    </div>
  );
}

function ResultStep({
  result,
  onReset,
}: {
  result: FormCheckAnalysis;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <V2Ring
          value={result.overallScore}
          total={100}
          size={160}
          color={result.overallScore >= 80 ? '#A8FF00' : result.overallScore >= 60 ? '#FF9500' : '#FF375F'}
          label="Celkove skore"
        />
      </div>

      <div>
        <V2SectionLabel>FAZE</V2SectionLabel>
        <div className="space-y-3">
          {result.phases.map((phase, i) => (
            <div
              key={i}
              className="rounded-2xl border p-5"
              style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {phase.name}
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: phase.score >= 80 ? '#A8FF00' : phase.score >= 60 ? '#FF9500' : '#FF375F',
                  }}
                >
                  {phase.score}/100
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {phase.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      {result.improvements.length > 0 && (
        <div>
          <V2SectionLabel>CO ZLEPSIT</V2SectionLabel>
          <ul className="space-y-2">
            {result.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#FF9500' }}>-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.positives.length > 0 && (
        <div>
          <V2SectionLabel>POZITIVA</V2SectionLabel>
          <ul className="space-y-2">
            {result.positives.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: '#A8FF00' }}>+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full rounded-full border py-3 text-sm font-semibold transition"
        style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
      >
        Analyzovat dalsi video
      </button>
    </div>
  );
}
