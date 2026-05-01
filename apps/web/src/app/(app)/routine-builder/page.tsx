'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Chip, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getMyRoutines,
  createRoutine,
  addRoutineItem,
  removeRoutineItem,
  getDailyBrief,
} from '@/lib/api';

type RoutineItem = {
  id: string;
  type: string;
  slot: string;
  name: string;
  order: number;
  notes?: string;
};
type Routine = {
  id: string;
  name: string;
  isPublic: boolean;
  items: RoutineItem[];
};

const SLOTS = [
  { key: 'morning', label: 'Morning', time: '6:00', icon: 'bolt', color: '#FF9F0A' },
  { key: 'pre_workout', label: 'Pre-Workout', time: '8:00', icon: 'flame', color: 'var(--sage, #34d399)' },
  { key: 'workout', label: 'Workout', time: '10:00', icon: 'dumbbell', color: 'var(--accent)' },
  { key: 'lunch', label: 'Lunch', time: '12:00', icon: 'apple', color: '#30D158' },
  { key: 'during', label: 'Afternoon', time: '14:00', icon: 'drop', color: '#00E5FF' },
  { key: 'post_workout', label: 'Post-Workout', time: '16:00', icon: 'drop', color: '#64D2FF' },
  { key: 'evening', label: 'Evening', time: '18:00', icon: 'heart', color: '#BF5AF2' },
  { key: 'night', label: 'Sleep', time: '22:00', icon: 'shield', color: 'var(--text-3)' },
];

const ITEM_TYPES = [
  { value: 'supplement', label: 'Supplement', icon: 'pill' },
  { value: 'workout', label: 'Workout', icon: 'dumbbell' },
  { value: 'meal', label: 'Meal', icon: 'apple' },
  { value: 'recovery', label: 'Recovery', icon: 'heart' },
  { value: 'custom', label: 'Custom', icon: 'settings' },
];

function AddForm({
  slot, routineId, onAdd, onClose,
}: {
  slot: string;
  routineId: string;
  onAdd: (item: RoutineItem) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState('supplement');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const item = await addRoutineItem(routineId, {
        slot, type, name: name.trim(),
      });
      onAdd(item);
    } catch { /* noop */ } finally { setSaving(false); }
  }

  return (
    <Card padding={16} style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {ITEM_TYPES.map((t) => (
          <Chip key={t.value} active={type === t.value} onClick={() => setType(t.value)}
            icon={<FitIcon name={t.icon} size={12} />}>{t.label}</Chip>
        ))}
      </div>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Item name..." onKeyDown={(e) => e.key === 'Enter' && submit()}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 'var(--r-lg)',
          border: '1px solid var(--stroke-1)', background: 'var(--bg-card)',
          color: 'var(--text-1)', fontSize: 14, marginBottom: 8,
        }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="accent" size="sm" onClick={submit}
          disabled={saving || !name.trim()}>
          {saving ? '...' : 'Add'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
      </div>
    </Card>
  );
}

function AiSuggestionBanner({
  onApply,
}: {
  onApply: (suggestion: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  async function fetchSuggestion() {
    setLoading(true);
    try {
      const { brief } = await getDailyBrief();
      const text = `${brief.workout.title} (${brief.workout.estimatedMinutes} min) — ${brief.headline}`;
      setSuggestion(text);
      onApply(text);
    } catch {
      setSuggestion('AI suggestion unavailable.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="16px 20px" style={{
      marginBottom: 24,
      background: 'linear-gradient(160deg, rgba(232,93,44,0.08) 0%, var(--bg-card) 60%)',
      border: '1px solid rgba(232,93,44,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="v3-caption" style={{
            color: 'var(--accent)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>AI Day Planner</span>
          {suggestion && (
            <p className="v3-body" style={{ color: 'var(--text-2)', margin: '6px 0 0' }}>
              {suggestion}
            </p>
          )}
        </div>
        <Button variant="accent" size="sm" onClick={fetchSuggestion} disabled={loading}>
          {loading ? '...' : 'Let AI plan your day'}
        </Button>
      </div>
    </Card>
  );
}

export default function RoutineBuilderPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [active, setActive] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingSlot, setAddingSlot] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Routine Builder'; }, []);

  useEffect(() => {
    getMyRoutines()
      .then((raw) => {
        const data = raw as unknown as Routine[];
        setRoutines(data);
        if (data.length > 0) setActive(data[0]);
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await createRoutine({ name: newName.trim() });
      setRoutines((p) => [...p, r]);
      setActive(r);
      setNewName('');
    } catch {
      setError('Failed to create.');
    } finally {
      setCreating(false);
    }
  }, [newName]);

  function handleAddItem(item: RoutineItem) {
    if (!active) return;
    const updated = { ...active, items: [...active.items, item] };
    setActive(updated);
    setRoutines((p) => p.map((r) => r.id === updated.id ? updated : r));
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
      setRoutines((p) => p.map((r) => r.id === updated.id ? updated : r));
    } catch { /* noop */ }
  }

  function slotItems(key: string): RoutineItem[] {
    return active?.items
      .filter((i) => i.slot === key)
      .sort((a, b) => a.order - b.order) || [];
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">&#9670; Daily routine</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Build your<br />
          <em className="v3-clay" style={{ fontWeight: 300 }}>ritual.</em>
        </h1>
      </section>

      {error && (
        <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 16 }}>
          {error}
        </p>
      )}

      <AiSuggestionBanner onApply={setAiSuggestion} />

      {aiSuggestion && (
        <Card padding="12px 16px" style={{ marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
          <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
            AI recommendation: {aiSuggestion}
          </span>
        </Card>
      )}

      {loading ? (
        <div style={{
          display: 'flex', height: 200,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
        </div>
      ) : (
        <>
          {active && (
            <div style={{ position: 'relative', paddingLeft: 24, marginBottom: 32 }}>
              <div style={{
                position: 'absolute', left: 6, top: 0, bottom: 0,
                width: 1, background: 'var(--stroke-1)',
              }} />
              {SLOTS.map((slot) => {
                const items = slotItems(slot.key);
                return (
                  <div key={slot.key} style={{ position: 'relative', marginBottom: 24 }}>
                    <div style={{
                      position: 'absolute', left: -21, top: 4,
                      width: 10, height: 10, borderRadius: '50%',
                      background: slot.color,
                    }} />
                    <div style={{
                      display: 'flex', alignItems: 'baseline', gap: 8,
                      marginBottom: 8,
                    }}>
                      <FitIcon name={slot.icon} size={16} color={slot.color} />
                      <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                        {slot.label}
                      </span>
                      <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
                        {slot.time}
                      </span>
                    </div>
                    {items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {items.map((item) => (
                          <Card key={item.id} padding="8px 14px">
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                              <span className="v3-body" style={{ color: 'var(--text-2)' }}>
                                <FitIcon
                                  name={ITEM_TYPES.find((t) => t.value === item.type)?.icon || 'settings'}
                                  size={12} style={{ marginRight: 6 }}
                                />
                                {item.name}
                              </span>
                              <button onClick={() => handleRemove(item.id)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                              }}>
                                <FitIcon name="x" size={12} color="var(--text-3)" />
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card padding="10px 14px" style={{ borderStyle: 'dashed' }}>
                        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
                          Empty slot
                        </span>
                      </Card>
                    )}
                    {addingSlot === slot.key ? (
                      <AddForm slot={slot.key} routineId={active.id}
                        onAdd={handleAddItem} onClose={() => setAddingSlot(null)} />
                    ) : (
                      <button onClick={() => setAddingSlot(slot.key)} style={{
                        marginTop: 6, background: 'none', border: 'none',
                        color: 'var(--text-3)', fontSize: 12, cursor: 'pointer',
                      }}>
                        + Add item
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <SectionHeader title="My routines" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {routines.map((r) => (
              <Card key={r.id} hover padding="12px 16px" onClick={() => setActive(r)}
                style={{
                  border: active?.id === r.id
                    ? '1px solid var(--accent)' : undefined,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="v3-body" style={{ fontWeight: 500, color: 'var(--text-1)' }}>
                    {r.name}
                  </span>
                  <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
                    {r.items.length} items
                  </span>
                </div>
              </Card>
            ))}
            {routines.length === 0 && !creating && (
              <p className="v3-caption" style={{
                color: 'var(--text-3)', textAlign: 'center', padding: 24,
              }}>
                No routines yet. Create first.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New routine name..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--stroke-1)', background: 'var(--bg-card)',
                color: 'var(--text-1)', fontSize: 14,
              }} />
            <Button variant="accent" size="sm" onClick={handleCreate}
              disabled={creating || !newName.trim()}>
              {creating ? '...' : 'Create'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
