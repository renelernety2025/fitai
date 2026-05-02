import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { getGlossary } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function SlovnikScreen() {
  const [terms, setTerms] = useState<any[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    const t = setTimeout(() => {
      getGlossary(query || undefined)
        .then(setTerms)
        .catch(() => setError(true));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Library</V2SectionLabel>
        <V2Display size="xl">Glossary.</V2Display>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search term..."
        placeholderTextColor={v2.ghost}
        style={{
          color: '#FFF',
          fontSize: 22,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: v2.border,
          marginBottom: 32,
        }}
      />

      {error ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: '#FF375F', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>Failed to load glossary</Text>
          <Pressable onPress={() => setQuery(q => q)} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      ) : terms === null ? (
        <V2Loading />
      ) : terms.length === 0 ? (
        <Text style={{ color: v2.faint, textAlign: 'center', marginTop: 24 }}>No results.</Text>
      ) : (
        terms.map((t) => (
          <View key={t.id} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{t.termCs}</Text>
              {t.category && (
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginLeft: 12 }}>
                  {t.category.toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginTop: 8 }}>{t.definitionCs}</Text>
          </View>
        ))
      )}
    </V2Screen>
  );
}
