'use client';

/**
 * Skill Tree — 4 vertical branches (Strength, Endurance, Form, Nutrition).
 * CSS circles with connecting lines. Unlocked/available/locked states.
 */

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { getSkillTree, checkSkillTree } from '@/lib/api';

const BRANCH_COLORS: Record<string, string> = {
  strength: '#FF375F',
  endurance: '#A8FF00',
  form: '#00E5FF',
  nutrition: '#FF9F0A',
};

const BRANCH_LABELS: Record<string, string> = {
  strength: 'Sila',
  endurance: 'Vytrvalost',
  form: 'Forma',
  nutrition: 'Vyziva',
};

interface SkillNode {
  id: string;
  name: string;
  description: string;
  requirement: string;
  branch: string;
  level: number;
  unlocked: boolean;
  available: boolean;
}

interface TreeData {
  totalNodes: number;
  unlockedCount: number;
  nodes: SkillNode[];
}

function NodeCircle({
  node,
  color,
  onClick,
}: {
  node: SkillNode;
  color: string;
  onClick: () => void;
}) {
  const unlocked = node.unlocked;
  const available = !unlocked && node.available;
  const locked = !unlocked && !available;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
          unlocked
            ? ''
            : available
            ? 'animate-pulse'
            : 'opacity-30'
        }`}
        style={{
          borderColor: locked ? '#444' : color,
          background: unlocked ? `${color}22` : 'transparent',
          boxShadow: unlocked ? `0 0 20px ${color}44` : 'none',
          color: locked ? '#555' : color,
        }}
      >
        {unlocked ? '\u2713' : node.level}
      </div>
      <span className={`mt-2 max-w-[80px] text-center text-[10px] leading-tight ${
        locked ? 'text-white/20' : 'text-white/60'
      }`}>
        {node.name}
      </span>
    </button>
  );
}

export default function SkillTreePage() {
  const [data, setData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [tooltip, setTooltip] = useState<SkillNode | null>(null);
  const [newUnlocked, setNewUnlocked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Skill Tree'; }, []);

  useEffect(() => {
    getSkillTree()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      const result = await checkSkillTree();
      if (result.newlyUnlocked) {
        setNewUnlocked(result.newlyUnlocked.map((n: SkillNode) => n.id));
      }
      const fresh = await getSkillTree();
      setData(fresh);
    } catch {
      setError('Nepodarilo se zkontrolovat pokrok');
    }
    setChecking(false);
  }

  const branches = data
    ? Object.keys(BRANCH_LABELS).map((key) => ({
        key,
        label: BRANCH_LABELS[key],
        color: BRANCH_COLORS[key],
        nodes: data.nodes
          .filter((n) => n.branch === key)
          .sort((a, b) => a.level - b.level),
      }))
    : [];

  return (
    <V2Layout>
      <section className="pt-12 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <V2SectionLabel>Strom schopnosti</V2SectionLabel>
            {data && (
              <span className="text-sm text-white/40">
                {data.unlockedCount} / {data.totalNodes} odemceno
              </span>
            )}
          </div>
          <button
            onClick={handleCheck}
            disabled={checking}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
          >
            {checking ? 'Kontroluji...' : 'Zkontrolovat pokrok'}
          </button>
        </div>

        <h1
          className="mb-16 font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          Strom schopnosti
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Tooltip overlay */}
            {tooltip && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setTooltip(null)}>
                <div className="max-w-sm rounded-2xl border border-white/10 bg-black p-6" onClick={(e) => e.stopPropagation()}>
                  <h3 className="mb-2 text-lg font-bold text-white">{tooltip.name}</h3>
                  <p className="mb-3 text-sm text-white/60">{tooltip.description}</p>
                  <div className="text-xs text-white/40">
                    Pozadavek: {tooltip.requirement}
                  </div>
                  <div className="mt-2 text-xs">
                    {tooltip.unlocked
                      ? <span className="text-[#A8FF00]">Odemceno</span>
                      : tooltip.available
                      ? <span className="text-[#FFD600]">Dostupne — splnit pozadavek</span>
                      : <span className="text-white/30">Zamceno</span>
                    }
                  </div>
                  <button
                    onClick={() => setTooltip(null)}
                    className="mt-4 text-xs text-white/40 transition hover:text-white"
                  >
                    Zavrit
                  </button>
                </div>
              </div>
            )}

            {/* Branch columns */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {branches.map((branch) => (
                <div key={branch.key} className="flex flex-col items-center">
                  <div
                    className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em]"
                    style={{ color: branch.color }}
                  >
                    {branch.label}
                  </div>
                  <div className="relative flex flex-col items-center gap-2">
                    {branch.nodes.map((node, i) => (
                      <div key={node.id} className="flex flex-col items-center">
                        {/* Connecting line */}
                        {i > 0 && (
                          <div
                            className="mb-2 h-6 w-0.5"
                            style={{
                              background: node.unlocked || node.available
                                ? branch.color
                                : '#333',
                            }}
                          />
                        )}
                        <div className={newUnlocked.includes(node.id) ? 'animate-bounce' : ''}>
                          <NodeCircle
                            node={node}
                            color={branch.color}
                            onClick={() => setTooltip(node)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !data && (
          <p className="py-24 text-center text-white/40">Skill tree neni dostupny.</p>
        )}
      </section>
    </V2Layout>
  );
}
