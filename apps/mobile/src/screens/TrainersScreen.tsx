import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { getTrainers } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function TrainersScreen() {
  const [trainers, setTrainers] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      getTrainers(search || undefined).then(setTrainers).catch(() => setTrainers([]));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const items = trainers ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Community</V2SectionLabel>
        <V2Display size="xl">Trainers.</V2Display>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search trainer..."
        placeholderTextColor={v2.ghost}
        returnKeyType="search"
        style={{
          borderWidth: 1,
          borderColor: v2.border,
          borderRadius: 16,
          padding: 14,
          color: '#FFF',
          fontSize: 14,
          marginBottom: 24,
          backgroundColor: v2.surface,
        }}
      />

      {trainers === null ? (
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          No trainers found
        </Text>
      ) : null}

      {items.map((t) => (
        <View
          key={t.id}
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
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
              {t.user?.name || 'Trainer'}
            </Text>
            {t.isVerified && (
              <Text style={{ color: v2.green, fontSize: 10, fontWeight: '700' }}>VERIFIED</Text>
            )}
          </View>

          <Text style={{ color: v2.muted, fontSize: 13, marginBottom: 8 }} numberOfLines={2}>
            {t.bio || 'No bio'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={{ color: v2.faint, fontSize: 11 }}>
              {t.totalSessions || 0} sessions
            </Text>
            {t.avgRating != null && (
              <Text style={{ color: v2.yellow, fontSize: 11 }}>
                {Number(t.avgRating).toFixed(1)} rating
              </Text>
            )}
          </View>

          {t.specializations?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {t.specializations.map((s: string, i: number) => (
                <View key={i} style={{ borderRadius: 8, borderWidth: 1, borderColor: v2.border, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: v2.muted, fontSize: 10 }}>{s}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </V2Screen>
  );
}
