import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { getHabitsToday, updateHabitsToday, getHabitsStats, getRecoveryTips } from '../lib/api';

const tipColors: Record<string, string> = {
  sleep: '#0A84FF',
  nutrition: '#FF9500',
  recovery: '#A8FF00',
  stress: '#BF5AF2',
  training: '#FF375F',
};
import { V2Screen, V2Display, V2SectionLabel, V2Ring, V2Loading, v2 } from '../components/v2/V2';

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

export function HabityScreen() {
  const [today, setToday] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const reload = () => {
    getHabitsToday().then(setToday).catch(console.error);
    getHabitsStats().then(setStats).catch(console.error);
    getRecoveryTips().then((r: any) => setTips(r.tips || [])).catch(console.error);
  };
  useEffect(reload, []);

  const update = async (patch: any) => {
    if (!today) return;
    setToday({ ...today, ...patch });
    try {
      const updated = await updateHabitsToday(patch);
      setToday(updated);
      setSavedAt(new Date());
      const s = await getHabitsStats();
      setStats(s);
    } catch (e) {
      console.error(e);
    }
  };

  if (!today) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Dnes</V2SectionLabel>
        <V2Display size="xl">Jak ti je?</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginTop: 12 }}>
          Krátký denní check-in. Pomáhá AI nastavit intenzitu a odhalit přetrénování dřív.
        </Text>
      </View>

      {/* Recovery score ring */}
      {stats?.recoveryScore != null && (
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <V2Ring
            value={stats.recoveryScore}
            total={100}
            size={180}
            color={v2.green}
            label="Recovery score"
            unit="bodů"
          />
          <View style={{ flexDirection: 'row', gap: 32, marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>SPÁNEK 7D</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.avgSleep ?? '—'}<Text style={{ color: v2.ghost, fontSize: 13 }}> h</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>ENERGIE 7D</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.avgEnergy ?? '—'}<Text style={{ color: v2.ghost, fontSize: 13 }}>/5</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>STREAK</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 }}>
                {stats.streakDays}<Text style={{ color: v2.ghost, fontSize: 13 }}> dní</Text>
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* AI tips */}
      {tips.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>AI doporučení</V2SectionLabel>
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
        {savedAt && (
          <Text style={{ color: v2.green, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>✓ ULOŽENO</Text>
        )}
      </View>

      <NumberField
        label="Spánek"
        unit="hodin"
        value={today.sleepHours}
        onChange={(v) => update({ sleepHours: v })}
        placeholder="8"
      />
      <Scale1to5 label="Kvalita spánku" value={today.sleepQuality} onChange={(v) => update({ sleepQuality: v })} hint="1 = hrozný · 5 = vynikající" />
      <Scale1to5 label="Energie" value={today.energy} onChange={(v) => update({ energy: v })} hint="Jak se cítíš fyzicky" />
      <Scale1to5 label="Bolest svalů" value={today.soreness} onChange={(v) => update({ soreness: v })} hint="1 = žádná · 5 = silná" />
      <Scale1to5 label="Stres" value={today.stress} onChange={(v) => update({ stress: v })} hint="1 = klid · 5 = vysoký" />
      <Scale1to5 label="Nálada" value={today.mood} onChange={(v) => update({ mood: v })} />
      <NumberField label="Voda" unit="litrů" value={today.hydrationL} onChange={(v) => update({ hydrationL: v })} placeholder="2.5" />
      <NumberField label="Kroky" value={today.steps} onChange={(v) => update({ steps: v })} placeholder="8000" />
    </V2Screen>
  );
}
