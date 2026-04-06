import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../lib/auth-context';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Odhlásit se</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 32 },
  logoutBtn: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  logoutText: { color: '#ef4444', fontSize: 16 },
});
