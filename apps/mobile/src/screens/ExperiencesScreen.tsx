import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getExperiences, bookExperience } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Chip, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

const categoryColors: Record<string, string> = {
  GROUP: v2.blue,
  OUTDOOR: v2.green,
  WELLNESS: v2.purple,
  COMBAT: v2.red,
  ADVENTURE: v2.orange,
  NUTRITION_WORKSHOP: v2.yellow,
};

function getName(e: any): string { return e.name || e.title || 'Experience'; }
function getLocation(e: any): string | null { return e.location || e.locationAddress || null; }
function getTrainerName(e: any): string | null { return e.trainerName || e.trainer?.user?.name || null; }
function getPrice(e: any): number | null { return e.price ?? e.priceKc ?? null; }

export function ExperiencesScreen() {
  const [experiences, setExperiences] = useState<any[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [pending, setPending] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getExperiences().then(setExperiences).catch(() => setExperiences([]));
  }, []);

  async function confirmBook() {
    if (!pending) return;
    const id = pending.id;
    setPending(null);
    setError(null);
    try {
      await bookExperience(id);
      haptic.success();
      setExperiences((prev) =>
        (prev ?? []).map((e) => (e.id === id ? { ...e, booked: true } : e)),
      );
    } catch (e: any) {
      haptic.error();
      setError(e?.message || 'Could not book');
    }
  }

  const items = experiences ?? [];
  const categories = Array.from(new Set(items.map((e) => e.category).filter(Boolean)));
  const filtered = filter === 'all' ? items : items.filter((e) => e.category === filter);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Events</V2SectionLabel>
        <V2Display size="xl">Experiences.</V2Display>
      </View>

      {categories.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          <V2Chip label="All" selected={filter === 'all'} onPress={() => { haptic.selection(); setFilter('all'); }} />
          {categories.map((c) => (
            <V2Chip key={c} label={c.replace(/_/g, ' ')} selected={filter === c} onPress={() => { haptic.selection(); setFilter(c); }} />
          ))}
        </View>
      )}

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {experiences === null ? (
        <LoadingState label="Loading experiences" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎟" title="No experiences" body="New events appear here as trainers publish them." />
      ) : null}

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
            {getName(exp)}
          </Text>

          {exp.description && (
            <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              {exp.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {getLocation(exp) && (
              <View style={{ marginRight: 24, marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>LOCATION</Text>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{getLocation(exp)}</Text>
              </View>
            )}
            {getTrainerName(exp) && (
              <View style={{ marginRight: 24, marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>TRAINER</Text>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{getTrainerName(exp)}</Text>
              </View>
            )}
            {getPrice(exp) != null && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>PRICE</Text>
                <Text style={{ color: v2.green, fontSize: 14, fontWeight: '600' }}>{getPrice(exp)} CZK</Text>
              </View>
            )}
          </View>

          <V2Button
            onPress={() => { haptic.tap(); setPending({ id: exp.id, name: getName(exp) }); }}
            variant={exp.booked ? 'secondary' : 'primary'}
            full
            disabled={exp.booked}
          >
            {exp.booked ? 'Booked' : 'Book'}
          </V2Button>
        </View>
      ))}

      <NativeConfirm
        visible={!!pending}
        title={pending ? `Book "${pending.name}"?` : ''}
        confirmLabel="Book"
        onConfirm={confirmBook}
        onCancel={() => setPending(null)}
      />
    </V2Screen>
  );
}
