'use client';

/**
 * Routine Builder — visual daily timeline with 6 time slots.
 */

import { useEffect, useState, useCallback } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import {
  getMyRoutines,
  createRoutine,
  addRoutineItem,
  removeRoutineItem,
} from '@/lib/api';

type RoutineItem = { id: string; type: string; slot: string; name: string; order: number; notes?: string };
type Routine = { id: string; name: string; isPublic: boolean; items: RoutineItem[] };

const SLOTS = [
  { key: 'morning', label: 'Morning', icon: '\u2600', time: '6:00 - 9:00', color: '#FF9F0A' },
  { key: 'pre_workout', label: 'Pre-Workout', icon: '\u26A1', time: '30 min before', color: '#A8FF00' },
  { key: 'during', label: 'During', icon: '\uD83C\uDFCB', time: 'Workout', color: '#FF375F' },
  { key: 'post_workout', label: 'Post-Workout', icon: '\uD83E\uDD64', time: '30 min after', color: '#00E5FF' },
  { key: 'evening', label: 'Evening', icon: '\uD83C\uDF19', time: '18:00 - 21:00', color: '#BF5AF2' },
  { key: 'night', label: 'Night', icon: '\uD83D\uDCA4', time: 'Before sleep', color: '#6E6E73' },
];

const ITEM_TYPES = [
  { value: 'supplement', label: 'Supplement', icon: '\uD83D\uDC8A' },
  { value: 'workout', label: 'Workout', icon: '\uD83C\uDFCB' },
  { value: 'meal', label: 'Meal', icon: '\uD83C\uDF5D' },
  { value: 'recovery', label: 'Recovery', icon: '\uD83E\uDDD8' },
  { value: 'custom', label: 'Custom', icon: '\u2699' },
];

function typeIcon(type: string): string {
  return ITEM_TYPES.find((t) => t.value === type)?.icon || '\u2699';
}

interface AddFormProps {
  slot: string;
  routineId: string;
  onAdd: (item: RoutineItem) => void;
  onClose: () => void;
}

function AddItemForm({ slot, routineId, onAdd, onClose }: AddFormProps) {
  const [type, setType] = useState('supplement');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const item = await addRoutineItem(routineId, {
        slot,
        type,
        name: name.trim(),
      });
      onAdd(item);
    } catch {
      /* noop */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        {ITEM_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              type === t.value
                ? 'bg-[#FF375F] text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nazev polozky..."
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim()}
          className="rounded-lg bg-[#A8FF00] px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
        >
          {saving ? 'Ukladam...' : 'Pridat'}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg bg-white/5 px-4 py-1.5 text-xs text-white/50 hover:bg-white/10"
        >
          Zrusit
        </button>
      </div>
    </div>
  );
}

export default function RoutineBuilderPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [active, setActive] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [addingSlot, setAddingSlot] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Routine Builder';
  }, []);

  useEffect(() => {
    getMyRoutines()
      .then((raw) => {
        const data = raw as any as Routine[];
        setRoutines(data);
        if (data.length > 0) setActive(data[0]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await createRoutine({ name: newName.trim() });
      setRoutines((prev) => [...prev, r]);
      setActive(r);
      setNewName('');
    } catch {
      /* noop */
    } finally {
      setCreating(false);
    }
  }, [newName]);

  function handleAddItem(item: RoutineItem) {
    if (!active) return;
    const updated = {
      ...active,
      items: [...active.items, item],
    };
    setActive(updated);
    setRoutines((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );
    setAddingSlot(null);
  }

  async function handleRemove(itemId: string) {
    if (!active) return;
    try {
      await removeRoutineItem(active.id, itemId);
      const updated = {
        ...active,
        items: active.items.filter((i) => i.id !== itemId),
      };
      setActive(updated);
      setRoutines((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch {
      /* noop */
    }
  }

  function slotItems(slotKey: string): RoutineItem[] {
    if (!active) return [];
    return active.items
      .filter((i) => i.slot === slotKey)
      .sort((a, b) => a.order - b.order);
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Daily Routine</V2SectionLabel>
        <V2Display size="xl">Routine Builder.</V2Display>
      </section>

      {error && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist rutiny.
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Timeline */}
          {active && (
            <StaggerContainer>
              <div className="relative mb-10">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/8" />

                {SLOTS.map((slot) => {
                  const items = slotItems(slot.key);
                  return (
                    <StaggerItem key={slot.key}>
                      <div className="relative mb-6 pl-12">
                        {/* Dot */}
                        <div
                          className="absolute left-3.5 top-1 h-3 w-3 rounded-full"
                          style={{
                            background: slot.color,
                            boxShadow: `0 0 12px ${slot.color}66`,
                          }}
                        />

                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-base font-bold tracking-tight text-white">
                            {slot.icon} {slot.label}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {slot.time}
                          </span>
                        </div>

                        {/* Items */}
                        {items.length > 0 ? (
                          <div className="space-y-1.5">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2"
                              >
                                <span className="text-sm text-white/70">
                                  {typeIcon(item.type)} {item.name}
                                </span>
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  className="text-[10px] text-white/20 hover:text-[#FF375F] transition-colors"
                                >
                                  &#10005;
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-white/10 px-3 py-3 text-center text-[11px] text-white/20">
                            Prazdny slot
                          </div>
                        )}

                        {/* Add button or form */}
                        {addingSlot === slot.key ? (
                          <AddItemForm
                            slot={slot.key}
                            routineId={active.id}
                            onAdd={handleAddItem}
                            onClose={() => setAddingSlot(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setAddingSlot(slot.key)}
                            className="mt-2 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-white/40 hover:bg-white/10 hover:text-white/60 transition-all"
                          >
                            + Pridat polozku
                          </button>
                        )}
                      </div>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
          )}

          {/* My routines */}
          <section className="mb-12">
            <V2SectionLabel>My Routines</V2SectionLabel>
            <div className="mt-4 space-y-2">
              {routines.map((r) => (
                <GlassCard
                  key={r.id}
                  className={`p-4 cursor-pointer ${
                    active?.id === r.id
                      ? 'border-[#A8FF00]/30'
                      : ''
                  }`}
                  onClick={() => setActive(r)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {r.items.length} items
                    </span>
                  </div>
                </GlassCard>
              ))}

              {routines.length === 0 && !creating && (
                <div className="py-8 text-center text-sm text-white/30">
                  Zatim zadne rutiny. Vytvor prvni.
                </div>
              )}
            </div>

            {/* Create new */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nazev nove rutiny..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="rounded-lg bg-[#A8FF00] px-4 py-2 text-xs font-semibold text-black disabled:opacity-40"
              >
                {creating ? '...' : 'Vytvorit'}
              </button>
            </div>
          </section>
        </>
      )}
    </V2Layout>
  );
}
