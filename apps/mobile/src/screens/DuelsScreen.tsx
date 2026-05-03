import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getActiveDuels, getDuelHistory, submitDuelScore } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

/** Resolve names from nested backend shape (challenger/challenged objects) */
function getChallengerName(d: any): string {
  return d.challengerName || d.challenger?.name || 'You';
}
function getOpponentName(d: any): string {
  return d.opponentName || d.challenged?.name || 'Opponent';
}
function getOpponentScore(d: any): number | null {
  return d.opponentScore ?? d.challengedScore ?? null;
}
function getWinnerName(d: any): string {
  if (d.winnerName) return d.winnerName;
  if (d.winnerId === d.challengerId) return getChallengerName(d);
  if (d.winnerId === d.challengedId) return getOpponentName(d);
  return d.challenger?.id === d.winnerId ? getChallengerName(d) : getOpponentName(d);
}

export function DuelsScreen() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [active, setActive] = useState<any[] | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    getActiveDuels().then(setActive).catch(() => setActive([]));
    getDuelHistory().then(setHistory).catch(() => setHistory([]));
  }

  async function confirmSubmit() {
    if (!pendingSubmit) return;
    const id = pendingSubmit;
    setPendingSubmit(null);
    setError(null);
    try {
      await submitDuelScore(id, 0);
      haptic.success();
      loadData();
    } catch {
      haptic.error();
      setError('Failed to submit score');
    }
  }

  const items = tab === 'active' ? (active ?? []) : (history ?? []);
  const loading = (tab === 'active' && active === null) || (tab === 'history' && history === null);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Competition</V2SectionLabel>
        <V2Display size="xl">Duels.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Active" selected={tab === 'active'} onPress={() => { haptic.selection(); setTab('active'); }} />
        <V2Chip label="History" selected={tab === 'history'} onPress={() => { haptic.selection(); setTab('history'); }} />
      </View>

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {loading ? (
        <LoadingState label="Loading duels" />
      ) : items.length === 0 ? (
        <EmptyState
          icon="⚔"
          title={tab === 'active' ? 'No active duels' : 'No history yet'}
          body={tab === 'active' ? 'Challenge someone from the community to get started.' : 'Past duels will appear here once finished.'}
        />
      ) : null}

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
                {new Date(d.endsAt).toLocaleDateString('en-US')}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                {getChallengerName(d)}
              </Text>
              <Text style={{ color: v2.green, fontSize: 32, fontWeight: '700' }}>
                {d.challengerScore ?? '-'}
              </Text>
            </View>

            <Text style={{ color: v2.ghost, fontSize: 18, fontWeight: '700', marginHorizontal: 12 }}>VS</Text>

            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                {getOpponentName(d)}
              </Text>
              <Text style={{ color: v2.red, fontSize: 32, fontWeight: '700' }}>
                {getOpponentScore(d) ?? '-'}
              </Text>
            </View>
          </View>

          {tab === 'active' && (
            <V2Button
              onPress={() => { haptic.tap(); setPendingSubmit(d.id); }}
              variant="secondary"
              full
            >
              Submit score
            </V2Button>
          )}

          {tab === 'history' && d.winnerId && (
            <Text style={{ color: v2.green, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
              Winner: {getWinnerName(d)}
            </Text>
          )}
        </View>
      ))}

      <NativeConfirm
        visible={!!pendingSubmit}
        title="Submit score?"
        message="Mark this duel as completed using your current workout data."
        confirmLabel="Submit"
        onConfirm={confirmSubmit}
        onCancel={() => setPendingSubmit(null)}
      />
    </V2Screen>
  );
}
