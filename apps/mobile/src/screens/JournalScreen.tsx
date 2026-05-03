import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  v2,
} from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';
import {
  getJournalMonth,
  upsertJournalEntry,
  generateJournalInsight,
} from '../lib/api';

// Backend enum: GREAT, GOOD, NEUTRAL, TIRED, BAD
const MOOD_VALUES = ['BAD', 'TIRED', 'NEUTRAL', 'GOOD', 'GREAT'];
const MOOD_LABELS = ['Bad', 'Tired', 'Ok', 'Good', 'Great'];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const TAGS = ['strength', 'cardio', 'flexibility', 'recovery', 'technique'];

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(m: string): string {
  const [y, mo] = m.split('-');
  return `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${y}`;
}

function formatDay(date: string): string {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDate();
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${weekdays[d.getDay()]} ${day}`;
}

interface JournalDay {
  date: string;
  gymSession?: { totalReps: number; averageFormScore: number; exercises?: string[] };
  // Backend mood is enum string: GREAT | GOOD | NEUTRAL | TIRED | BAD
  entry?: { notes?: string; mood?: string; rating?: number; tags?: string[]; aiInsight?: string };
}

function DayCard({
  day,
  onSaveNotes,
  onSaveMood,
  onSaveRating,
  onToggleTag,
  onRequestInsight,
}: {
  day: JournalDay;
  onSaveNotes: (date: string, notes: string) => void;
  onSaveMood: (date: string, mood: string) => void;
  onSaveRating: (date: string, rating: number) => void;
  onToggleTag: (date: string, tag: string) => void;
  onRequestInsight: (date: string) => void;
}) {
  const [notes, setNotes] = useState(day.entry?.notes || '');
  const [expanded, setExpanded] = useState(false);
  const haptic = useHaptic();

  return (
    <View style={s.dayCard}>
      {/* Day header */}
      <Pressable
        onPress={() => { haptic.tap(); setExpanded(!expanded); }}
        style={({ pressed }) => [s.dayHeader, pressed && { opacity: 0.7 }]}
      >
        <Text style={s.dayDate}>{formatDay(day.date)}</Text>
        {day.gymSession && (
          <View style={s.sessionBadge}>
            <Text style={s.sessionText}>
              {day.gymSession.totalReps} reps | {day.gymSession.averageFormScore}% form
            </Text>
          </View>
        )}
        <Text style={s.expandArrow}>{expanded ? '⌄' : '›'}</Text>
      </Pressable>

      {expanded && (
        <View style={s.dayBody}>
          {/* Workout summary */}
          {day.gymSession?.exercises && day.gymSession.exercises.length > 0 && (
            <View style={s.exerciseList}>
              {day.gymSession.exercises.map((ex, i) => (
                <Text key={i} style={s.exerciseItem}>{ex}</Text>
              ))}
            </View>
          )}

          {/* Notes */}
          <TextInput
            style={s.notesInput}
            value={notes}
            onChangeText={setNotes}
            onBlur={() => { if (notes !== (day.entry?.notes || '')) onSaveNotes(day.date, notes); }}
            placeholder="Notes..."
            placeholderTextColor={v2.ghost}
            multiline
          />

          {/* Mood */}
          <V2SectionLabel>Mood</V2SectionLabel>
          <View style={s.moodRow}>
            {MOOD_VALUES.map((moodVal, i) => (
              <Pressable
                key={moodVal}
                onPress={() => { haptic.selection(); onSaveMood(day.date, moodVal); }}
                style={({ pressed }) => [
                  s.moodBtn,
                  day.entry?.mood === moodVal && s.moodBtnActive,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[s.moodLabel, day.entry?.mood === moodVal && s.moodLabelActive]}>
                  {MOOD_LABELS[i]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Rating */}
          <V2SectionLabel>Rating</V2SectionLabel>
          <View style={s.starsRow}>
            {[1,2,3,4,5].map(star => (
              <Pressable
                key={star}
                onPress={() => { haptic.selection(); onSaveRating(day.date, star); }}
                hitSlop={6}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={[s.star, (day.entry?.rating || 0) >= star && s.starActive]}>
                  *
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tags */}
          <V2SectionLabel>Tags</V2SectionLabel>
          <View style={s.tagsRow}>
            {TAGS.map(tag => {
              const active = day.entry?.tags?.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => { haptic.selection(); onToggleTag(day.date, tag); }}
                  style={({ pressed }) => [
                    s.tagChip,
                    active && s.tagChipActive,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={[s.tagText, active && s.tagTextActive]}>
                    {tag.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* AI Insight */}
          {day.entry?.aiInsight ? (
            <View style={s.insightBox}>
              <Text style={s.insightLabel}>AI INSIGHT</Text>
              <Text style={s.insightText}>{day.entry.aiInsight}</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => { haptic.tap(); onRequestInsight(day.date); }}
              style={({ pressed }) => [s.insightBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.insightBtnText}>Generate AI insight</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export function JournalScreen({ navigation }: any) {
  const [month, setMonth] = useState(getCurrentMonth);
  const [days, setDays] = useState<JournalDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  const load = useCallback(async (m: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJournalMonth(m);
      setDays(res.days || []);
    } catch {
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(month); }, [month, load]);

  async function handleSaveNotes(date: string, notes: string) {
    try { await upsertJournalEntry(date, { notes }); } catch { /* silent */ }
  }

  async function handleSaveMood(date: string, mood: string) {
    try {
      await upsertJournalEntry(date, { mood });
      load(month);
    } catch { haptic.error(); }
  }

  async function handleSaveRating(date: string, rating: number) {
    try {
      await upsertJournalEntry(date, { rating });
      load(month);
    } catch { haptic.error(); }
  }

  async function handleToggleTag(date: string, tag: string) {
    const day = days.find(d => d.date === date);
    const current = day?.entry?.tags || [];
    const tags = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    try {
      await upsertJournalEntry(date, { tags });
      load(month);
    } catch { haptic.error(); }
  }

  async function handleRequestInsight(date: string) {
    try {
      await generateJournalInsight(date);
      haptic.success();
      load(month);
    } catch {
      haptic.error();
      setError('Failed to generate insight');
    }
  }

  const sortedDays = [...days].sort((a, b) => b.date.localeCompare(a.date));
  const entriesCount = days.filter(d => d.entry).length;
  const workoutsCount = days.filter(d => d.gymSession).length;

  return (
    <V2Screen>
      {/* Back — native iOS chevron */}
      <Pressable
        onPress={() => { haptic.tap(); navigation.goBack(); }}
        hitSlop={12}
        style={({ pressed }) => [s.backBtnWrap, pressed && { opacity: 0.5 }]}
      >
        <Text style={s.backChevron}>‹</Text>
        <Text style={s.backLabel}>Back</Text>
      </Pressable>

      {/* Hero */}
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2Display size="lg">My journal</V2Display>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <Text style={s.statMini}>{entriesCount} entries</Text>
          <Text style={s.statMini}>{workoutsCount} workouts</Text>
        </View>
      </View>

      {/* Month navigation */}
      <View style={s.monthNav}>
        <Pressable
          onPress={() => { haptic.selection(); setMonth(shiftMonth(month, -1)); }}
          style={({ pressed }) => [s.navBtn, pressed && { opacity: 0.5 }]}
          hitSlop={6}
        >
          <Text style={s.navBtnText}>‹</Text>
        </Pressable>
        <Text style={s.monthLabel}>{formatMonth(month)}</Text>
        <Pressable
          onPress={() => { haptic.selection(); setMonth(shiftMonth(month, 1)); }}
          style={({ pressed }) => [s.navBtn, pressed && { opacity: 0.5 }]}
          hitSlop={6}
        >
          <Text style={s.navBtnText}>›</Text>
        </Pressable>
      </View>

      {/* Error */}
      {error && <Text style={s.errorText}>{error}</Text>}

      {/* Content */}
      {loading ? (
        <LoadingState label="Loading entries" />
      ) : sortedDays.length === 0 ? (
        <EmptyState icon="📓" title="No entries yet" body="Workouts logged this month will appear here once they happen." />
      ) : (
        <>
          <V2SectionLabel>Entries</V2SectionLabel>
          {sortedDays.map(day => (
            <DayCard
              key={day.date}
              day={day}
              onSaveNotes={handleSaveNotes}
              onSaveMood={handleSaveMood}
              onSaveRating={handleSaveRating}
              onToggleTag={handleToggleTag}
              onRequestInsight={handleRequestInsight}
            />
          ))}
        </>
      )}
    </V2Screen>
  );
}

const s = StyleSheet.create({
  backBtnWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 8 },
  backChevron: { color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 },
  backLabel: { color: v2.text, fontSize: 16, fontWeight: '500' },
  statMini: { color: v2.faint, fontSize: 13 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  navBtn: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  navBtnText: { color: v2.text, fontSize: 22, fontWeight: '300', lineHeight: 22 },
  monthLabel: { color: v2.text, fontSize: 16, fontWeight: '600' },
  errorText: { color: v2.red, fontSize: 13, marginBottom: 12 },
  emptyText: { color: v2.ghost, fontSize: 14, textAlign: 'center', marginTop: 48 },
  dayCard: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dayDate: { color: v2.text, fontSize: 15, fontWeight: '700', flex: 1 },
  sessionBadge: {
    backgroundColor: 'rgba(168,255,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  sessionText: { color: v2.green, fontSize: 11, fontWeight: '600' },
  expandArrow: { color: v2.ghost, fontSize: 14 },
  dayBody: { paddingHorizontal: 16, paddingBottom: 16 },
  exerciseList: { marginBottom: 12 },
  exerciseItem: { color: v2.muted, fontSize: 13, lineHeight: 20 },
  notesInput: {
    color: v2.text,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  moodBtn: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moodBtnActive: { backgroundColor: v2.text, borderColor: v2.text },
  moodLabel: { color: v2.muted, fontSize: 11, fontWeight: '600' },
  moodLabelActive: { color: '#000' },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  star: { color: v2.ghost, fontSize: 28 },
  starActive: { color: v2.yellow },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagChipActive: { backgroundColor: v2.text, borderColor: v2.text },
  tagText: { color: v2.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  tagTextActive: { color: '#000' },
  insightBox: {
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
  },
  insightLabel: { color: v2.blue, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  insightText: { color: v2.text, fontSize: 13, lineHeight: 19 },
  insightBtn: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  insightBtnText: { color: v2.muted, fontSize: 12, fontWeight: '600' },
});
