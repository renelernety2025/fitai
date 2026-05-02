import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Button,
  V2Loading,
  v2,
} from '../components/v2/V2';
import {
  getCalendarMonth,
  scheduleWorkout,
  deleteScheduledWorkout,
} from '../lib/api';

interface ScheduledWorkout {
  id: string;
  date: string;
  title: string;
  completed: boolean;
  notes: string | null;
}

interface CalendarDay {
  date: string;
  workouts: ScheduledWorkout[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/** Backend returns flat ScheduledWorkout[]. Group by date into CalendarDay[]. */
function groupByDate(workouts: any[]): CalendarDay[] {
  const map = new Map<string, ScheduledWorkout[]>();
  for (const w of workouts) {
    const dateKey = (w.date || '').slice(0, 10); // "2026-05-10T00:00:00.000Z" → "2026-05-10"
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push({ ...w, date: dateKey });
  }
  return Array.from(map.entries()).map(([date, wks]) => ({ date, workouts: wks }));
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  return `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${y}`;
}

function buildGrid(month: string): string[][] {
  const [y, mo] = month.split('-').map(Number);
  const first = new Date(y, mo - 1, 1);
  const last = new Date(y, mo, 0);
  const startDay = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();
  const cells: string[] = [];
  for (let i = 0; i < startDay; i++) cells.push('');
  for (let d = 1; d <= totalDays; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push('');
  const rows: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().slice(0, 10);
}

export function CalendarScreen({ navigation }: any) {
  const [month, setMonth] = useState(currentMonth);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCalendarMonth(month)
      .then(d => {
        // Backend returns flat ScheduledWorkout[] — group into CalendarDay[]
        const raw = d.days || d || [];
        const grouped = Array.isArray(raw) && raw.length > 0 && !raw[0]?.workouts
          ? groupByDate(raw)
          : raw;
        setDays(grouped);
      })
      .catch(() => { setDays([]); setError('Failed to load calendar'); })
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const grid = buildGrid(month);
  const dayMap = new Map(days.map(d => [d.date, d]));

  async function handleAdd() {
    if (!selectedDate || !formTitle.trim()) return;
    setSaving(true);
    try {
      await scheduleWorkout({ date: selectedDate, title: formTitle, notes: formNotes });
      setFormTitle('');
      setFormNotes('');
      load();
    } catch {
      setError('Failed to save workout');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteScheduledWorkout(id);
      load();
    } catch {
      setError('Failed to delete');
    }
  }

  const selectedDay = selectedDate ? dayMap.get(selectedDate) : null;

  return (
    <V2Screen>
      {/* Back */}
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 8 }}>
        <Text style={{ color: v2.muted, fontSize: 14, fontWeight: '600' }}>Back</Text>
      </Pressable>

      <V2SectionLabel>Workout calendar</V2SectionLabel>

      {/* Month navigation */}
      <View style={s.monthNav}>
        <Pressable onPress={() => setMonth(shiftMonth(month, -1))} style={s.navBtn}>
          <Text style={s.navBtnText}>{'<'}</Text>
        </Pressable>
        <V2Display size="sm">{monthLabel(month)}</V2Display>
        <Pressable onPress={() => setMonth(shiftMonth(month, 1))} style={s.navBtn}>
          <Text style={s.navBtnText}>{'>'}</Text>
        </Pressable>
      </View>

      {error && <Text style={s.error}>{error}</Text>}

      {loading ? (
        <V2Loading />
      ) : (
        <>
          {/* Day headers */}
          <View style={s.gridRow}>
            {DAY_NAMES.map(d => (
              <View key={d} style={s.gridCell}>
                <Text style={s.dayName}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          {grid.map((row, ri) => (
            <View key={ri} style={s.gridRow}>
              {row.map((date, ci) => {
                if (!date) return <View key={ci} style={s.gridCell} />;
                const day = dayMap.get(date);
                const hasPlanned = day?.workouts.some(w => !w.completed);
                const hasCompleted = day?.workouts.some(w => w.completed);
                const hasMissed = day && isPast(date) && hasPlanned && !hasCompleted;
                const today = isToday(date);
                const selected = date === selectedDate;
                const dayNum = parseInt(date.split('-')[2], 10);

                return (
                  <Pressable
                    key={ci}
                    onPress={() => setSelectedDate(date)}
                    style={[
                      s.gridCell,
                      s.gridCellBorder,
                      today && s.cellToday,
                      selected && s.cellSelected,
                    ]}
                  >
                    <Text style={[s.dayNum, today && s.dayNumToday]}>{dayNum}</Text>
                    <View style={s.dotRow}>
                      {hasCompleted && <View style={[s.dot, { backgroundColor: '#4ade80' }]} />}
                      {hasPlanned && !hasMissed && <View style={[s.dot, { backgroundColor: '#60a5fa' }]} />}
                      {hasMissed && <View style={[s.dot, { backgroundColor: v2.red }]} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {/* Legend */}
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#60a5fa' }]} />
              <Text style={s.legendText}>Planned</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#4ade80' }]} />
              <Text style={s.legendText}>Completed</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: v2.red }]} />
              <Text style={s.legendText}>Missed</Text>
            </View>
          </View>

          {/* Selected day detail */}
          {selectedDate && (
            <View style={s.detailPanel}>
              <Text style={s.detailDate}>{selectedDate}</Text>

              {selectedDay?.workouts.map(w => (
                <View key={w.id} style={s.workoutCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {w.completed && <Text style={{ color: v2.green, marginRight: 6 }}>OK</Text>}
                    <Text style={s.workoutTitle}>{w.title}</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(w.id)}>
                    <Text style={s.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              ))}

              {/* Add form */}
              <TextInput
                style={s.input}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Workout title"
                placeholderTextColor={v2.ghost}
              />
              <TextInput
                style={[s.input, { marginTop: 8 }]}
                value={formNotes}
                onChangeText={setFormNotes}
                placeholder="Notes..."
                placeholderTextColor={v2.ghost}
              />
              <View style={{ marginTop: 12 }}>
                <V2Button
                  onPress={handleAdd}
                  disabled={saving || !formTitle.trim()}
                  full
                >
                  {saving ? 'Saving...' : 'Add workout'}
                </V2Button>
              </View>
            </View>
          )}
        </>
      )}
    </V2Screen>
  );
}

const CELL_SIZE = `${100 / 7}%`;

const s = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  navBtn: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  navBtnText: { color: v2.muted, fontSize: 14, fontWeight: '600' },
  error: { color: v2.red, fontSize: 13, marginBottom: 12 },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  gridCellBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    margin: 1,
  },
  cellToday: { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)' },
  cellSelected: { borderColor: 'rgba(168,255,0,0.4)', backgroundColor: 'rgba(168,255,0,0.08)' },
  dayName: { color: v2.ghost, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  dayNum: { color: v2.muted, fontSize: 13 },
  dayNumToday: { color: v2.text, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: v2.faint, fontSize: 10 },
  detailPanel: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  detailDate: { color: v2.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  workoutTitle: { color: v2.text, fontSize: 14, fontWeight: '600' },
  deleteText: { color: v2.red, fontSize: 11, fontWeight: '600' },
  input: {
    color: v2.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
