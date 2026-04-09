import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { testPushNotification } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

const SECONDARY = [
  { screen: 'Uspechy', label: 'Úspěchy', color: v2.yellow },
  { screen: 'ProgressPhotos', label: 'Progress fotky', color: v2.purple },
  { screen: 'Jidelnicek', label: 'Jídelníček (AI)', color: v2.yellow },
  { screen: 'CameraWorkoutPro', label: 'Pose Detection (Pro)', color: v2.red },
  { screen: 'Exercises', label: 'Cviky', color: v2.green },
  { screen: 'Videos', label: 'Videa', color: v2.blue },
  { screen: 'Doma', label: 'Doma', color: v2.green },
  { screen: 'AICoach', label: 'AI Trenér', color: v2.purple },
  { screen: 'Community', label: 'Komunita', color: v2.red },
  { screen: 'Slovnik', label: 'Slovník', color: v2.yellow },
];

export function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 32 }}>
        <V2SectionLabel>Účet</V2SectionLabel>
        <V2Display size="xl">{user?.name?.split(' ')[0] || 'Profil'}.</V2Display>
        <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>{user?.email}</Text>
      </View>

      <V2SectionLabel>Více</V2SectionLabel>
      <View style={{ marginBottom: 48 }}>
        {SECONDARY.map((s) => (
          <Pressable
            key={s.screen}
            onPress={() => navigation.navigate(s.screen)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: v2.border,
              paddingVertical: 20,
            }}
          >
            <View style={{ width: 24, height: 3, borderRadius: 2, backgroundColor: s.color, marginRight: 16 }} />
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600', flex: 1 }}>{s.label}</Text>
            <Text style={{ color: v2.ghost, fontSize: 18 }}>→</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ marginBottom: 16 }}>
        <V2Button
          onPress={async () => {
            try {
              const r = await testPushNotification();
              Alert.alert('Test push', `Expo: ${r.expo?.sent ? 'sent ✓' : r.expo?.reason || 'failed'}\nWeb: ${r.web?.sent || 0}`);
            } catch (e: any) {
              Alert.alert('Test push', e.message || 'Failed');
            }
          }}
          variant="secondary"
          full
        >
          Otestovat push notifikace
        </V2Button>
      </View>

      <V2Button onPress={logout} variant="secondary" full>
        Odhlásit se
      </V2Button>
    </V2Screen>
  );
}
