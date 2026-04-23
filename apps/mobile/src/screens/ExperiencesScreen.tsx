import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getExperiences, bookExperience } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Chip, v2 } from '../components/v2/V2';

const categoryColors: Record<string, string> = {
  workshop: v2.blue,
  outdoor: v2.green,
  retreat: v2.purple,
  competition: v2.red,
  masterclass: v2.orange,
};

export function ExperiencesScreen() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getExperiences().then(setExperiences).catch(() => setExperiences([]));
  }, []);

  function handleBook(exp: any) {
    Alert.alert(
      'Rezervace',
      `Chces rezervovat "${exp.name}"?`,
      [
        { text: 'Zrusit', style: 'cancel' },
        {
          text: 'Rezervovat',
          onPress: () => {
            bookExperience(exp.id)
              .then(() => {
                setExperiences((prev) =>
                  prev.map((e) => (e.id === exp.id ? { ...e, booked: true } : e)),
                );
              })
              .catch((e: any) => Alert.alert('Chyba', e.message || 'Nelze rezervovat'));
          },
        },
      ],
    );
  }

  const categories = Array.from(new Set(experiences.map((e) => e.category).filter(Boolean)));
  const filtered = filter === 'all' ? experiences : experiences.filter((e) => e.category === filter);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Zazitky</V2SectionLabel>
        <V2Display size="xl">Experiences.</V2Display>
      </View>

      {categories.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          <V2Chip label="Vse" selected={filter === 'all'} onPress={() => setFilter('all')} />
          {categories.map((c) => (
            <V2Chip key={c} label={c} selected={filter === c} onPress={() => setFilter(c)} />
          ))}
        </View>
      )}

      {filtered.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zadne zazitky k dispozici
        </Text>
      )}

      {filtered.map((exp) => (
        <View
          key={exp.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          {exp.category && (
            <Text
              style={{
                color: categoryColors[exp.category] || v2.muted,
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              {exp.category.toUpperCase()}
            </Text>
          )}

          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 }}>
            {exp.name}
          </Text>

          {exp.description && (
            <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              {exp.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {exp.location && (
              <View style={{ marginRight: 24, marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>LOKACE</Text>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{exp.location}</Text>
              </View>
            )}
            {exp.trainerName && (
              <View style={{ marginRight: 24, marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>TRENER</Text>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{exp.trainerName}</Text>
              </View>
            )}
            {exp.price != null && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>CENA</Text>
                <Text style={{ color: v2.green, fontSize: 14, fontWeight: '600' }}>{exp.price} CZK</Text>
              </View>
            )}
          </View>

          <V2Button
            onPress={() => handleBook(exp)}
            variant={exp.booked ? 'secondary' : 'primary'}
            full
            disabled={exp.booked}
          >
            {exp.booked ? 'Rezervovano' : 'Rezervovat'}
          </V2Button>
        </View>
      ))}
    </V2Screen>
  );
}
