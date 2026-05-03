import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getCoachingMemories } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';

export function CoachingNotesScreen() {
  const [memories, setMemories] = useState<any[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const haptic = useHaptic();

  useEffect(() => {
    loadMemories(1);
  }, []);

  function loadMemories(p: number) {
    getCoachingMemories(p)
      .then((res) => {
        const items = res.items || res || [];
        setMemories(prev => p === 1 ? items : [...(prev ?? []), ...items]);
        setTotal(res.total ?? items.length);
        setPage(p);
      })
      .catch(() => setMemories([]));
  }

  const items = memories ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>AI Memory</V2SectionLabel>
        <V2Display size="xl">AI Notes.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          What AI remembers about your training
        </Text>
      </View>

      {memories === null ? (
        <LoadingState label="Loading notes" />
      ) : items.length === 0 ? (
        <EmptyState icon="📝" title="No notes yet" body="AI builds notes from your training over time. They appear here as you log sessions." />
      ) : null}

      {items.map((m, i) => (
        <View
          key={m.id || i}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ borderRadius: 8, borderWidth: 1, borderColor: v2.purple, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: v2.purple, fontSize: 10, fontWeight: '600' }}>
                {(m.category || 'GENERAL').toUpperCase()}
              </Text>
            </View>
            {(m.createdAt || m.date) && (
              <Text style={{ color: v2.faint, fontSize: 10 }}>
                {new Date(m.createdAt || m.date).toLocaleDateString('en-US')}
              </Text>
            )}
          </View>

          {m.exercise && (
            <Text style={{ color: v2.blue, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>
              {m.exercise.nameCs || m.exercise.name}
            </Text>
          )}

          <Text style={{ color: '#FFF', fontSize: 14, lineHeight: 20 }}>
            {m.insight || m.content}
          </Text>

          {(m.metricBefore != null || m.metricAfter != null) && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              {m.metricBefore != null && (
                <Text style={{ color: v2.faint, fontSize: 12 }}>Before: {m.metricBefore}</Text>
              )}
              {m.metricAfter != null && (
                <Text style={{ color: v2.green, fontSize: 12 }}>After: {m.metricAfter}</Text>
              )}
            </View>
          )}
        </View>
      ))}

      {items.length > 0 && items.length < total && (
        <Pressable
          onPress={() => { haptic.tap(); loadMemories(page + 1); }}
          style={({ pressed }) => [{ alignItems: 'center', paddingVertical: 20 }, pressed && { opacity: 0.5 }]}
        >
          <Text style={{ color: v2.green, fontSize: 13, fontWeight: '600' }}>Load more</Text>
        </Pressable>
      )}
    </V2Screen>
  );
}
