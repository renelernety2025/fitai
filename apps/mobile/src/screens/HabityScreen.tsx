import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { getHabitsToday, updateHabitsToday, getHabitsStats, getRecoveryTips } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Ring, V2Loading, v2 } from '../components/v2/V2';

const tipColors: Record<string, string> = {
  sleep: '#0A84FF',
  nutrition: '#FF9500',
  recovery: '#A8FF00',
  stress: '#BF5AF2',
  training: '#FF375F',
};

function Scale1to5({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
        {label.toUpperCase()}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: sel ? '#FFF' : v2.border,
                backgroundColor: sel ? '#FFF' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: sel ? '#000' : v2.muted, fontSize: 22, fontWeight: '700' }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      {hint && <Text style={{ color: v2.ghost, fontSize: 11, marginTop: 6 }}>{hint}</Text>}
    </View>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value != null ? String(value) : '');
  useEffect(() => setText(value != null ? String(value) : ''), [value]);
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {label.toUpperCase()}{unit ? ` (${unit.toUpperCase()})` : ''}
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={() => {
          const n = text === '' ? null : parseFloat(text.replace(',', '.'));
          if (n !== value) onChange(isNaN(n as number) ? null : n);
        }}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={v2.ghost}
        style={{
          color: '#FFF',
          fontSize: 28,
          fontWeight: '700',
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: v2.border,
        }}
      />
    </View>
  );
}

function recoveryColor(score: number): string {
  if (score >= 70) return v2.green;
  if (score >= 40) return '#FF9500';
  return '#FF375F';
}

export function HabityScreen() {
  const [today, setToday] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [loadError, setLoadError] = useState(false);

  const reload = useCallback(() => {
    setLoadError(false);
    getHabitsToday()
      .then(setToday)
      .catch(() => setLoadError(true));
    getHabitsStats().then(setStats).catch(() => {});
    getRecoveryTips()
      .then((r: any) => setTips(r.tips || []))
      .catch(() => {});
  }, []);
  useEffect(reload, [reload]);

  const update = async (patch: any) => {
    if (!today) return;
    const prev = today;
    setToday({ ...today, ...patch });
    setSaveStatus('idle');
    try {
      const updated = await updateHabitsToday(patch);
      setToday(updated);
      setSaveStatus('saved');
      const s = await getHabitsStats();
      setStats(s);
    } catch {
      setToday(prev);
      setSaveStatus('error');
    }
  };

  if (loadError) {
    return (
      <V2Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ color: '#FF375F', fontSize: 16, fontWeight: '600', marginBottom: 16 }}>Failed to load check-in</Text>
          <Pressable onPress={reload} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </V2Screen>
    );
  }

  if (!today) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Today</V2SectionLabel>
        <V2Display size="xl">How are you?</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginTop: 12 }}>
          Quick daily check-in. Helps AI adjust intensity and detect overtraining early.
        </Text>
      </View>

      {/* Recovery score ring */}
      {stats?.recoveryScore != null ? (
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <V2Ring
            value={stats.recoveryScore}
            total={100}
            size={180}
            color={recoveryColor(stats.recoveryScore)}
            label="Recovery score"
            unit="pts"
          />
          <View style={{ flexDirection: 'row', gap: 32, marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>SLEEP 7D</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.avgSleep ?? '—'}<Text style={{ color: v2.ghost, fontSize: 13 }}> h</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>ENERGY 7D</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.avgEnergy ?? '—'}<Text style={{ color: v2.ghost, fontSize: 13 }}>/5</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>STREAK</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.streakDays}<Text style={{ color: v2.ghost, fontSize: 13 }}> days</Text>
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginBottom: 32, paddingVertical: 24 }}>
          <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center' }}>
            Complete your first check-in to see your recovery score.
          </Text>
        </View>
      )}

      {/* AI tips */}
      {tips.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>AI Recommendations</V2SectionLabel>
          {tips.map((t, i) => (
            <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 16 }}>
              <Text style={{ color: tipColors[t.category] || '#FFF', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 }}>
                {String(t.category || '').toUpperCase()} · {String(t.priority || '').toUpperCase()}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 }}>{t.title}</Text>
              <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginTop: 6 }}>{t.body}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Form */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <V2Display size="md">Check-in</V2Display>
        {saveStatus === 'saved' && (
          <Text style={{ color: v2.green, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>✓ SAVED</Text>
        )}
        {saveStatus === 'error' && (
          <Text style={{ color: '#FF375F', fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>SAVE FAILED</Text>
        )}
      </View>

      <NumberField
        label="Sleep"
        unit="hours"
        value={today.sleepHours}
        onChange={(v) => update({ sleepHours: v })}
        placeholder="8"
      />
      <Scale1to5 label="Sleep quality" value={today.sleepQuality} onChange={(v) => update({ sleepQuality: v })} hint="1 = terrible · 5 = excellent" />
      <Scale1to5 label="Energy" value={today.energy} onChange={(v) => update({ energy: v })} hint="How you feel physically" />
      <Scale1to5 label="Muscle soreness" value={today.soreness} onChange={(v) => update({ soreness: v })} hint="1 = none · 5 = severe" />
      <Scale1to5 label="Stress" value={today.stress} onChange={(v) => update({ stress: v })} hint="1 = calm · 5 = high" />
      <Scale1to5 label="Mood" value={today.mood} onChange={(v) => update({ mood: v })} />
      <NumberField label="Water" unit="liters" value={today.hydrationL} onChange={(v) => update({ hydrationL: v })} placeholder="2.5" />
      <NumberField label="Steps" value={today.steps} onChange={(v) => update({ steps: v })} placeholder="8000" />
    </V2Screen>
  );
}
