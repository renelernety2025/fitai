import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getActiveDuels, getDuelHistory, submitDuelScore } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Button, v2 } from '../components/v2/V2';

export function DuelsScreen() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [active, setActive] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    getActiveDuels().then(setActive).catch(() => setActive([]));
    getDuelHistory().then(setHistory).catch(() => setHistory([]));
  }

  function handleSubmitScore(id: string) {
    // Alert.prompt is iOS-only — use a simple confirm for now
    Alert.alert('Submit Score', 'Submit your score for this duel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: () => {
          submitDuelScore(id, 0)
            .then(loadData)
            .catch(() => Alert.alert('Error', 'Failed to submit score'));
        },
      },
    ]);
  }

  const items = tab === 'active' ? active : history;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Souper</V2SectionLabel>
        <V2Display size="xl">Duely.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Aktivni" selected={tab === 'active'} onPress={() => setTab('active')} />
        <V2Chip label="Historie" selected={tab === 'history'} onPress={() => setTab('history')} />
      </View>

      {items.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          {tab === 'active' ? 'Zadne aktivni duely' : 'Zatim zadna historie'}
        </Text>
      )}

      {items.map((d) => (
        <View
          key={d.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
              {(d.type || 'DUEL').toUpperCase()}
            </Text>
            {d.endsAt && (
              <Text style={{ color: v2.orange, fontSize: 10, fontWeight: '600' }}>
                {new Date(d.endsAt).toLocaleDateString('cs-CZ')}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                {d.challengerName || 'Ty'}
              </Text>
              <Text style={{ color: v2.green, fontSize: 32, fontWeight: '700' }}>
                {d.challengerScore ?? '-'}
              </Text>
            </View>

            <Text style={{ color: v2.ghost, fontSize: 18, fontWeight: '700', marginHorizontal: 12 }}>VS</Text>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                {d.opponentName || 'Souper'}
              </Text>
              <Text style={{ color: v2.red, fontSize: 32, fontWeight: '700' }}>
                {d.opponentScore ?? '-'}
              </Text>
            </View>
          </View>

          {tab === 'active' && (
            <V2Button onPress={() => handleSubmitScore(d.id)} variant="secondary" full>
              Zadat score
            </V2Button>
          )}

          {tab === 'history' && d.winnerId && (
            <Text style={{ color: v2.green, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
              Vitez: {d.winnerName || 'N/A'}
            </Text>
          )}
        </View>
      ))}
    </V2Screen>
  );
}
