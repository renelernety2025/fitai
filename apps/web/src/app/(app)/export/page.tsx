'use client';

import { useState } from 'react';
import {
  V2Layout,
  V2SectionLabel,
  V2Display,
} from '@/components/v2/V2Layout';
import { downloadExport } from '@/lib/api';

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getDefaultRange(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${d}` };
}

export default function ExportPage() {
  const [journalMonth, setJournalMonth] = useState(getCurrentMonth());
  const [nutritionRange, setNutritionRange] = useState(getDefaultRange);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(
    key: string,
    path: string,
    filename: string,
  ) {
    setLoading(key);
    setError(null);
    try {
      await downloadExport(path, filename);
    } catch {
      setError(`Export "${key}" selhal. Zkus to znovu.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Tvoje data</V2SectionLabel>
        <V2Display size="xl">Export.</V2Display>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
          Stahni si historii treninku, denik nebo vyzivu jako CSV soubor.
          CSV funguje v Excelu, Google Sheets i Numbers.
        </p>
      </section>

      {error && (
        <div className="mb-8 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Workouts CSV */}
        <ExportCard
          title="Historie treninku"
          description="Posledních 100 treninku — datum, doba, cviky, repy, forma, objem."
          loading={loading === 'workouts-csv'}
          onExport={() =>
            handleExport(
              'workouts-csv',
              'export/workouts?format=csv',
              `fitai-workouts-${today()}.csv`,
            )
          }
          buttonLabel="Stahnout CSV"
        />

        {/* Workouts print page */}
        <ExportCard
          title="Treninky — tisk"
          description="HTML stranka pro tisk (Ctrl+P / Cmd+P). Prehledna tabulka."
          loading={loading === 'workouts-pdf'}
          onExport={async () => {
            setLoading('workouts-pdf');
            setError(null);
            try {
              const token = localStorage.getItem('fitai_token');
              const base =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
              const res = await fetch(`${base}/api/export/workouts?format=pdf`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              const html = await res.text();
              const win = window.open('', '_blank');
              if (win) { win.document.write(html); win.document.close(); }
            } catch {
              setError('Export "workouts-pdf" selhal. Zkus to znovu.');
            } finally {
              setLoading(null);
            }
          }}
          buttonLabel="Otevrit pro tisk"
        />

        {/* Journal CSV */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Denik</h3>
            <p className="mt-1 text-sm text-white/40">
              Zapisy z deniku za zvoleny mesic — hodnoceni, nalada, poznamky, tagy.
            </p>
          </div>
          <div className="mb-6 flex items-end gap-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Mesic
              </span>
              <input
                type="month"
                value={journalMonth}
                onChange={(e) => setJournalMonth(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/25"
              />
            </label>
          </div>
          <ExportButton
            loading={loading === 'journal'}
            onClick={() =>
              handleExport(
                'journal',
                `export/journal?month=${journalMonth}`,
                `fitai-journal-${journalMonth}.csv`,
              )
            }
            label="Stahnout CSV"
          />
        </div>

        {/* Nutrition CSV */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Vyziva</h3>
            <p className="mt-1 text-sm text-white/40">
              Vsechny zaznamy jidla v rozmezi — jidlo, kalorie, makra, zdroj.
            </p>
          </div>
          <div className="mb-6 flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Od
              </span>
              <input
                type="date"
                value={nutritionRange.from}
                onChange={(e) =>
                  setNutritionRange((p) => ({ ...p, from: e.target.value }))
                }
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/25"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Do
              </span>
              <input
                type="date"
                value={nutritionRange.to}
                onChange={(e) =>
                  setNutritionRange((p) => ({ ...p, to: e.target.value }))
                }
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-white/25"
              />
            </label>
          </div>
          <ExportButton
            loading={loading === 'nutrition'}
            onClick={() =>
              handleExport(
                'nutrition',
                `export/nutrition?from=${nutritionRange.from}&to=${nutritionRange.to}`,
                `fitai-nutrition-${nutritionRange.from}_${nutritionRange.to}.csv`,
              )
            }
            label="Stahnout CSV"
          />
        </div>
      </div>
    </V2Layout>
  );
}

// ── Sub-components ──

function ExportCard({
  title,
  description,
  loading,
  onExport,
  buttonLabel,
}: {
  title: string;
  description: string;
  loading: boolean;
  onExport: () => void;
  buttonLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/40">{description}</p>
      </div>
      <ExportButton loading={loading} onClick={onExport} label={buttonLabel} />
    </div>
  );
}

function ExportButton({
  loading,
  onClick,
  label,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 disabled:opacity-40"
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {label}
    </button>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
