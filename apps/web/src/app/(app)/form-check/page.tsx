'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/v3';
import {
  getExercises,
  getFormCheckUploadUrl,
  analyzeForm,
  getFormCheckHistory,
  type ExerciseData,
  type FormCheckAnalysis,
} from '@/lib/api';
import { VideoPane } from '@/components/form-check/v3/VideoPane';
import { AnalysisPanel } from '@/components/form-check/v3/AnalysisPanel';

type Severity = 'good' | 'warn' | 'bad';
interface Cue { t: string; text: string; sev: Severity }

const MOCK_CUES: Cue[] = [
  { t: '00:14', text: 'Knees caving in slightly', sev: 'warn' },
  { t: '00:23', text: 'Good depth', sev: 'good' },
  { t: '00:31', text: 'Right hip rises early', sev: 'warn' },
  { t: '00:42', text: 'Bar drift forward', sev: 'bad' },
  { t: '00:58', text: 'Strong lockout', sev: 'good' },
];

export default function FormCheckPage() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<'analysis' | 'upload' | 'analyzing'>('analysis');
  const [result, setResult] = useState<FormCheckAnalysis | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'FitAI — Form Check'; }, []);
  useEffect(() => {
    getExercises().then(setExercises).catch(() => {});
    getFormCheckHistory().catch(() => {});
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
      const analysis = await analyzeForm({ s3Key, exerciseId: selectedExercise });
      setResult(analysis);
      setStep('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setStep('analysis');
    }
  }

  function handleNewRecording() {
    setStep('upload');
    setFile(null);
    setResult(null);
    setError('');
  }

  return (
    <div style={{ padding: '32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', marginBottom: 32,
      }}>
        <div>
          <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>
            Form Check · Back squat
          </div>
          <div className="v3-display-3">How does this rep look?</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" onClick={handleNewRecording}>New recording</Button>
          <Button variant="accent">Save analysis</Button>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: 24, padding: '12px 20px', borderRadius: 'var(--r-md)',
          background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
          fontSize: 13, color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {step === 'upload' && (
        <UploadPane
          fileRef={fileRef} file={file} setFile={setFile}
          exercises={exercises} selected={selectedExercise}
          setSelected={setSelectedExercise} onAnalyze={handleAnalyze}
        />
      )}

      {step === 'analyzing' && <AnalyzingPane />}

      {step === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          <VideoPane cues={MOCK_CUES} />
          <AnalysisPanel result={result} />
        </div>
      )}
    </div>
  );
}

/* ---------- Upload pane ---------- */

function UploadPane({ fileRef, file, setFile, exercises, selected, setSelected, onAnalyze }: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  file: File | null;
  setFile: (f: File | null) => void;
  exercises: ExerciseData[];
  selected: string;
  setSelected: (id: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <Card padding={40} style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('video/')) setFile(f); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: 40, borderRadius: 'var(--r-lg)', cursor: 'pointer',
            border: '2px dashed var(--stroke-2)', transition: 'border-color .2s',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {file ? file.name : 'Click or drag video here'}
          </div>
          <input
            ref={fileRef as React.LegacyRef<HTMLInputElement>}
            type="file" accept="video/mp4,video/quicktime,video/webm"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
          />
        </div>

        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Exercise</div>
          <select
            value={selected} onChange={(e) => setSelected(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--stroke-2)', background: 'var(--bg-card)',
              color: 'var(--text-1)', fontSize: 14,
            }}
          >
            <option value="">Select exercise...</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.nameCs || ex.name}</option>
            ))}
          </select>
        </div>

        <Button variant="accent" full disabled={!file || !selected} onClick={onAnalyze}>
          Analyze
        </Button>
      </div>
    </Card>
  );
}

/* ---------- Analyzing spinner ---------- */

function AnalyzingPane() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '80px 0' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '2px solid var(--stroke-2)', borderTopColor: 'var(--accent)',
        animation: 'spin 1s linear infinite',
      }} />
      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>AI is analyzing your video...</div>
    </div>
  );
}
