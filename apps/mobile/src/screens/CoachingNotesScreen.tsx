import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getCoachingMemories } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';

export function CoachingNotesScreen() {
  const [memories, setMemories] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadMemories();
  }, []);

  function loadMemories() {
    getCoachingMemories(page)
      .then((res) => setMemories(res.items || res || []))
      .catch(() => setMemories([]));
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>AI Pamet</V2SectionLabel>
        <V2Display size="xl">AI Notes.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          Co si o vas AI zapamatoval
        </Text>
      </View>

      {memories.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zatim zadne poznamky
        </Text>
      )}

      {memories.map((m, i) => (
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
            {m.createdAt && (
              <Text style={{ color: v2.faint, fontSize: 10 }}>
                {new Date(m.createdAt).toLocaleDateString('cs-CZ')}
              </Text>
            )}
          </View>

          <Text style={{ color: '#FFF', fontSize: 14, lineHeight: 20 }}>
            {m.insight || m.content}
          </Text>

          {(m.metricBefore != null || m.metricAfter != null) && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              {m.metricBefore != null && (
                <Text style={{ color: v2.faint, fontSize: 12 }}>Pred: {m.metricBefore}</Text>
              )}
              {m.metricAfter != null && (
                <Text style={{ color: v2.green, fontSize: 12 }}>Po: {m.metricAfter}</Text>
              )}
            </View>
          )}
        </View>
      ))}
    </V2Screen>
  );
}
