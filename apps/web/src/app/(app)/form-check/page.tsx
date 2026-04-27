'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Ring, Button, Tag, SectionHeader } from '@/components/v3';
import {
  getExercises,
  getFormCheckUploadUrl,
  analyzeForm,
  getFormCheckHistory,
  type ExerciseData,
  type FormCheckAnalysis,
} from '@/lib/api';

type Severity = 'good' | 'warn' | 'bad';
interface Cue { t: string; text: string; sev: Severity }

const MOCK_CUES: Cue[] = [
  { t: '00:14', text: 'Knees caving in slightly', sev: 'warn' },
  { t: '00:23', text: 'Good depth', sev: 'good' },
  { t: '00:31', text: 'Right hip rises early', sev: 'warn' },
  { t: '00:42', text: 'Bar drift forward', sev: 'bad' },
  { t: '00:58', text: 'Strong lockout', sev: 'good' },
];

const SEV_COLOR: Record<Severity, string> = {
  good: 'var(--sage)', warn: 'var(--warning)', bad: 'var(--danger)',
};
const SEV_LABEL: Record<Severity, string> = {
  good: 'Good rep', warn: 'Watch', bad: 'Fix',
};

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
      {/* Header */}
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

/* ---------- Video pane ---------- */

function VideoPane({ cues }: { cues: Cue[] }) {
  return (
    <div>
      {/* Video frame */}
      <div style={{
        position: 'relative', aspectRatio: '16/10', background: '#000',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        border: '1px solid var(--stroke-1)',
      }}>
        <img
          src="https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=960&q=80"
          alt="Squat form" draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <SkeletonOverlay />
        <LiveCue text="Right hip rising early" />
        <VideoControls cues={cues} />
      </div>

      {/* Cue timeline */}
      <Card padding={24} style={{ marginTop: 16 }}>
        <div className="v3-eyebrow" style={{ marginBottom: 16 }}>AI Cue timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {cues.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '10px 0',
              borderBottom: i < cues.length - 1 ? '1px solid var(--stroke-1)' : 'none',
            }}>
              <div className="v3-numeric" style={{ fontSize: 13, width: 56, color: 'var(--text-3)' }}>
                {c.t}
              </div>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: SEV_COLOR[c.sev], flexShrink: 0,
              }} />
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>{c.text}</div>
              <Tag color={SEV_COLOR[c.sev]}>{SEV_LABEL[c.sev]}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Skeleton SVG overlay ---------- */

function SkeletonOverlay() {
  const joints: [number, number][] = [
    [50,22],[50,40],[42,32],[58,32],[42,58],[58,58],[38,78],[62,78],
  ];
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      viewBox="0 0 100 100" preserveAspectRatio="none"
    >
      <g stroke="var(--accent)" strokeWidth="0.4" fill="none" opacity="0.85">
        <circle cx="50" cy="22" r="2" />
        <line x1="50" y1="24" x2="50" y2="40" />
        <line x1="42" y1="32" x2="58" y2="32" />
        <line x1="50" y1="40" x2="42" y2="58" />
        <line x1="50" y1="40" x2="58" y2="58" />
        <line x1="42" y1="58" x2="38" y2="78" />
        <line x1="58" y1="58" x2="62" y2="78" />
        {joints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.8" fill="var(--accent)" />
        ))}
      </g>
      <circle cx="42" cy="58" r="3" fill="none" stroke="var(--danger)" strokeWidth="0.5">
        <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ---------- Live cue badge ---------- */

function LiveCue({ text }: { text: string }) {
  return (
    <div style={{
      position: 'absolute', top: 24, left: 24,
      background: 'rgba(200,74,44,0.9)', backdropFilter: 'blur(10px)',
      padding: '8px 14px', borderRadius: 'var(--r-pill)',
      fontSize: 13, fontWeight: 500, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>&#9889;</span> {text}
    </div>
  );
}

/* ---------- Video bottom controls ---------- */

function VideoControls({ cues }: { cues: Cue[] }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <button style={{
        width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
      <div style={{
        flex: 1, height: 3, background: 'rgba(255,255,255,0.2)',
        borderRadius: 3, position: 'relative',
      }}>
        <div style={{ width: '42%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
        {cues.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(i + 1) * 15}%`, top: -3,
            width: 2, height: 9, background: SEV_COLOR[c.sev],
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff',
      }}>
        00:31 / 01:12
      </div>
    </div>
  );
}

/* ---------- Analysis sidebar ---------- */

const FIX_ITEMS = [
  'Keep knees tracking over toes during descent',
  'Control hip rise — both hips should rise at the same rate',
  'Maintain bar path directly over mid-foot',
];
const POSITIVE_ITEMS = [
  'Depth is excellent — hitting parallel consistently',
  'Lockout is strong and controlled',
];

function AnalysisPanel({ result }: { result: FormCheckAnalysis | null }) {
  const score = result?.overallScore ?? 78;
  const fixes = result?.improvements?.length ? result.improvements : FIX_ITEMS;
  const positives = result?.positives?.length ? result.positives : POSITIVE_ITEMS;

  return (
    <div>
      {/* Score */}
      <Card padding={28} style={{ marginBottom: 16 }}>
        <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Overall score</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Ring value={score} size={120} stroke={6} color="var(--accent)" label={`${score}`} sub="FORM" />
          <div>
            <Tag color="var(--accent)" className="mb-2">Good</Tag>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
              {fixes.length} things to work on. Keep filming.
            </div>
          </div>
        </div>
      </Card>

      {/* What to fix */}
      <Card padding={24} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>
          What to work on
        </div>
        {fixes.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < fixes.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 4, borderRadius: 2, flexShrink: 0,
              background: i === 0 ? 'var(--danger)' : 'var(--warning)',
            }} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </Card>

      {/* What's working */}
      <Card padding={24} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>
          What&apos;s working
        </div>
        {positives.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < positives.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 4, borderRadius: 2, flexShrink: 0,
              background: 'var(--sage)',
            }} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </Card>

      {/* Compare */}
      <Card padding={24}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
          Compare
        </div>
        <Button variant="ghost" full>vs. last week</Button>
      </Card>
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
