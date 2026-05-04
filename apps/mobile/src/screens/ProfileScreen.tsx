import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { testPushNotification } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, NativeConfirm } from '../components/native';

const SECONDARY = [
  { screen: 'AIChat', label: 'AI Chat', color: v2.green },
  { screen: 'Journal', label: 'Journal', color: v2.blue },
  { screen: 'Calendar', label: 'Calendar', color: v2.orange },
  { screen: 'Leagues', label: 'Leagues', color: v2.purple },
  { screen: 'Uspechy', label: 'Achievements', color: v2.yellow },
  { screen: 'ProgressPhotos', label: 'Progress Photos', color: v2.purple },
  { screen: 'Jidelnicek', label: 'Meal Plan (AI)', color: v2.yellow },
  { screen: 'CameraWorkoutPro', label: 'Pose Detection (Pro)', color: v2.red },
  { screen: 'Exercises', label: 'Exercises', color: v2.green },
  { screen: 'Videos', label: 'Videos', color: v2.blue },
  { screen: 'Doma', label: 'Home Training', color: v2.green },
  { screen: 'AICoach', label: 'AI Coach', color: v2.purple },
  { screen: 'Community', label: 'Community', color: v2.red },
  { screen: 'Slovnik', label: 'Glossary', color: v2.yellow },
  { screen: 'Duels', label: 'Duels', color: v2.red },
  { screen: 'Supplements', label: 'Supplements', color: v2.green },
  { screen: 'Gear', label: 'Gear', color: v2.blue },
  { screen: 'Records', label: 'Records', color: v2.orange },
  { screen: 'Drops', label: 'Limited Drops', color: v2.yellow },
  { screen: 'Experiences', label: 'Experiences', color: v2.purple },
  { screen: 'Clips', label: 'Clips', color: v2.blue },
  { screen: 'Trainers', label: 'Trainers', color: v2.green },
  { screen: 'RoutineBuilder', label: 'Routine', color: v2.orange },
  { screen: 'Bundles', label: 'Bundles', color: v2.yellow },
  { screen: 'Wishlist', label: 'Wishlist', color: v2.purple },
  { screen: 'VIP', label: 'VIP', color: v2.yellow },
  { screen: 'Squads', label: 'Squads', color: v2.blue },
  { screen: 'Maintenance', label: 'Maintenance', color: v2.orange },
  { screen: 'CoachingNotes', label: 'AI Notes', color: v2.purple },
  { screen: 'Playlists', label: 'Playlists', color: v2.green },
  { screen: 'Streaks', label: 'Streaks', color: v2.red },
  { screen: 'FormCheck', label: 'Form Check', color: v2.green },
  { screen: 'HealthSync', label: 'Health Sync', color: v2.red },
];

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const haptic = useHaptic();

  async function runPushTest() {
    haptic.tap();
    try {
      const r = await testPushNotification();
      haptic.success();
      setPushResult(`Expo: ${r.expo?.sent ? 'sent ✓' : r.expo?.reason || 'failed'} · Web: ${r.web?.sent || 0}`);
    } catch (e: any) {
      haptic.error();
      setPushResult(e?.message || 'Push test failed');
    }
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 32 }}>
        <V2SectionLabel>Account</V2SectionLabel>
        <V2Display size="xl">{user?.name?.split(' ')[0] || 'Profile'}.</V2Display>
        <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>{user?.email}</Text>
      </View>

      <V2SectionLabel>More</V2SectionLabel>
      <View style={{ marginBottom: 48 }}>
        {SECONDARY.map((s) => (
          <Pressable
            key={s.screen}
            onPress={() => { haptic.tap(); navigation.navigate(s.screen); }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: v2.border,
              paddingVertical: 20,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ width: 24, height: 3, borderRadius: 2, backgroundColor: s.color, marginRight: 16 }} />
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600', flex: 1 }}>{s.label}</Text>
            <Text style={{ color: v2.ghost, fontSize: 18 }}>›</Text>
          </Pressable>
        ))}
      </View>

      {pushResult && (
        <View style={{ marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: v2.border }}>
          <Text style={{ color: v2.muted, fontSize: 12 }}>{pushResult}</Text>
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <V2Button onPress={runPushTest} variant="secondary" full>
          Test push notifications
        </V2Button>
      </View>

      <V2Button onPress={() => { haptic.press(); setConfirmLogout(true); }} variant="secondary" full>
        Log out
      </V2Button>

      <NativeConfirm
        visible={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to keep training."
        confirmLabel="Log out"
        destructive
        onConfirm={() => { setConfirmLogout(false); logout(); }}
        onCancel={() => setConfirmLogout(false)}
      />
    </V2Screen>
  );
}
