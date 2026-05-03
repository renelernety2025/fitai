import React, { useEffect, useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { getPlaylists } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';

const ALLOWED_DOMAINS = ['open.spotify.com', 'music.apple.com', 'spotify.com', 'itunes.apple.com'];

export function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<any[] | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getPlaylists().then(setPlaylists).catch(() => setPlaylists([]));
  }, []);

  function openLink(url?: string) {
    if (!url) return;
    try {
      const domain = new URL(url).hostname.toLowerCase();
      // Match exactly or as a subdomain — prevents bypass via "evilspotify.com"
      const allowed = ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
      if (!allowed) return;
      haptic.tap();
      Linking.openURL(url).catch(() => { haptic.error(); });
    } catch { /* invalid URL — ignore */ }
  }

  const items = playlists ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Music</V2SectionLabel>
        <V2Display size="xl">Playlists.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          Workout music from the community
        </Text>
      </View>

      {playlists === null ? (
        <LoadingState label="Loading playlists" />
      ) : items.length === 0 ? (
        <EmptyState icon="🎧" title="No playlists yet" body="Workout playlists from the community will appear here." />
      ) : null}

      {items.map((p) => (
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
              {p.user?.name || 'User'}
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
