import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { authLogin } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, v2 } from '../components/v2/V2';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      await login(res.accessToken, res.user);
    } catch (e: any) {
      setError(e.message || 'Přihlášení selhalo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <V2Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 80, alignItems: 'center', marginBottom: 48 }}>
          <V2SectionLabel>Vítej zpět</V2SectionLabel>
          <V2Display size="lg">Přihlas se.</V2Display>
        </View>

        <V2Input label="Email" value={email} onChangeText={setEmail} placeholder="tvuj@email.cz" keyboardType="email-address" />
        <V2Input label="Heslo" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        {error ? <Text style={{ color: v2.red, marginBottom: 16 }}>{error}</Text> : null}

        <V2Button onPress={handleLogin} disabled={loading} full>
          {loading ? 'Přihlašování…' : 'Pokračovat →'}
        </V2Button>

        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ color: v2.faint, fontSize: 14 }}>
            Nemáš účet? <Text style={{ color: v2.text }}>Vytvoř si ho</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </V2Screen>
  );
}
