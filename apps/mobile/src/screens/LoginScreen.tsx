import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authLogin } from '../lib/api';
import { useAuth } from '../lib/auth-context';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleLogin() {
    setLoading(true);
    try {
      const res = await authLogin(email, password);
      login(res.accessToken, res.user);
    } catch (err: any) {
      Alert.alert('Chyba', err.message || 'Přihlášení selhalo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.logo}>FitAI</Text>
      <Text style={s.subtitle}>Přihlaš se ke svému účtu</Text>

      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#6b7280" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Heslo" placeholderTextColor="#6b7280" value={password}
        onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
        <Text style={s.buttonText}>{loading ? 'Přihlašování...' : 'Přihlásit se'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={s.link}>Nemáš účet? <Text style={s.linkGreen}>Registruj se</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1f2937', color: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
  linkGreen: { color: '#16a34a', fontWeight: '600' },
});
