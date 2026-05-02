import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { authRegister } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, V2Chip, v2 } from '../components/v2/V2';

const LEVELS = [
  { v: 'BEGINNER', l: 'Beginner' },
  { v: 'INTERMEDIATE', l: 'Intermediate' },
  { v: 'ADVANCED', l: 'Expert' },
];

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      const res = await authRegister({ name, email, password, level });
      await login(res.accessToken, res.user);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 80, alignItems: 'center', marginBottom: 48 }}>
          <V2SectionLabel>Get started</V2SectionLabel>
          <V2Display size="lg">Create account.</V2Display>
        </View>

        <V2Input label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        <V2Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" />
        <V2Input label="Password" value={password} onChangeText={setPassword} placeholder="Min. 8 characters" secureTextEntry />

        <V2SectionLabel>Level</V2SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          {LEVELS.map((l) => (
            <V2Chip key={l.v} label={l.l} selected={level === l.v} onPress={() => setLevel(l.v)} />
          ))}
        </View>

        {error ? <Text style={{ color: v2.red, marginBottom: 16 }}>{error}</Text> : null}

        <V2Button onPress={handleRegister} disabled={loading} full>
          {loading ? 'Creating...' : 'Create account →'}
        </V2Button>

        <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: v2.faint, fontSize: 14 }}>
            Already have an account? <Text style={{ color: v2.text }}>Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </V2Screen>
  );
}
