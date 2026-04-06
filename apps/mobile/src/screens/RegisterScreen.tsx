import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authRegister } from '../lib/api';
import { useAuth } from '../lib/auth-context';

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await authRegister({ name, email, password });
      login(res.accessToken, res.user);
    } catch (err: any) {
      Alert.alert('Chyba', err.message || 'Registrace selhala');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.logo}>FitAI</Text>
      <Text style={s.subtitle}>Vytvoř si nový účet</Text>

      <TextInput style={s.input} placeholder="Jméno" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#6b7280" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={s.input} placeholder="Heslo (min. 8 znaků)" placeholderTextColor="#6b7280"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
        <Text style={s.buttonText}>{loading ? 'Registrace...' : 'Vytvořit účet'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={s.link}>Už máš účet? <Text style={s.linkGreen}>Přihlaš se</Text></Text>
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
