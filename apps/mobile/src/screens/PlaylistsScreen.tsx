import React, { useEffect, useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { getPlaylists } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

export function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    getPlaylists().then(setPlaylists).catch(() => setPlaylists([]));
  }, []);

  function openLink(url?: string) {
    if (url) Linking.openURL(url).catch(() => {});
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Hudba</V2SectionLabel>
        <V2Display size="xl">Playlisty.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          Hudba k treninku od komunity
        </Text>
      </View>

      {playlists.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zatim zadne playlisty
        </Text>
      )}

      {playlists.map((p) => (
        <View
          key={p.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            {p.title}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: v2.faint, fontSize: 11 }}>
              {p.user?.name || 'Uzivatel'}
            </Text>
            {p.bpm && (
              <Text style={{ color: v2.orange, fontSize: 11, fontWeight: '600' }}>
                {p.bpm} BPM
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {p.spotifyUrl && (
              <View style={{ flex: 1 }}>
                <V2Button onPress={() => openLink(p.spotifyUrl)} variant="secondary" full>
                  Spotify
                </V2Button>
              </View>
            )}
            {p.appleMusicUrl && (
              <View style={{ flex: 1 }}>
                <V2Button onPress={() => openLink(p.appleMusicUrl)} variant="secondary" full>
                  Apple Music
                </V2Button>
              </View>
            )}
          </View>

          {p.workoutType && (
            <Text style={{ color: v2.ghost, fontSize: 10, marginTop: 8, textAlign: 'center' }}>
              {p.workoutType}
            </Text>
          )}
        </View>
      ))}
    </V2Screen>
  );
}
