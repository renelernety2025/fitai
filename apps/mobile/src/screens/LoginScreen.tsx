import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { authLogin } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, v2 } from '../components/v2/V2';
import { useHaptic } from '../components/native';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const haptic = useHaptic();

  async function handleLogin() {
    haptic.tap();
    setError('');
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      haptic.success();
      await login(res.accessToken, res.user);
    } catch (e: any) {
      haptic.error();
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 80, alignItems: 'center', marginBottom: 48 }}>
          <V2SectionLabel>Welcome back</V2SectionLabel>
          <V2Display size="lg">Sign in.</V2Display>
        </View>

        <V2Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" />
        <V2Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        {error ? <Text style={{ color: v2.red, marginBottom: 16 }}>{error}</Text> : null}

        <V2Button onPress={handleLogin} disabled={loading} full>
          {loading ? 'Signing in...' : 'Continue →'}
        </V2Button>

        <Pressable
          onPress={() => { haptic.tap(); navigation.navigate('Register'); }}
          hitSlop={8}
          style={({ pressed }) => [{ marginTop: 32, alignItems: 'center' }, pressed && { opacity: 0.5 }]}
        >
          <Text style={{ color: v2.faint, fontSize: 14 }}>
            No account? <Text style={{ color: v2.text }}>Sign up</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </V2Screen>
  );
}
