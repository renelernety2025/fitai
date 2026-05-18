import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { authForgotPassword } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, v2 } from '../components/v2/V2';
import { useHaptic } from '../components/native';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const haptic = useHaptic();

  async function handleSubmit() {
    haptic.tap();
    setError('');
    setLoading(true);
    try {
      await authForgotPassword(email);
      haptic.success();
      setSent(true);
    } catch (e: any) {
      haptic.error();
      setError(e.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <V2Screen>
        <View style={{ paddingTop: 80, alignItems: 'center', marginBottom: 48 }}>
          <V2SectionLabel>Check your inbox</V2SectionLabel>
          <V2Display size="lg">Sent.</V2Display>
        </View>
        <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginBottom: 32, textAlign: 'center' }}>
          If <Text style={{ color: v2.text }}>{email}</Text> is registered, a password reset link is on the way. Open it on this device to set a new password.
        </Text>
        <V2Button onPress={() => { haptic.tap(); navigation.goBack(); }} full>
          Back to sign in
        </V2Button>
      </V2Screen>
    );
  }

  return (
    <V2Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 80, alignItems: 'center', marginBottom: 48 }}>
          <V2SectionLabel>Forgot password</V2SectionLabel>
          <V2Display size="lg">Reset it.</V2Display>
        </View>

        <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginBottom: 24, textAlign: 'center' }}>
          Enter the email on your account. We&apos;ll send you a reset link.
        </Text>

        <V2Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />

        {error ? <Text style={{ color: v2.red, marginBottom: 16 }}>{error}</Text> : null}

        <V2Button onPress={handleSubmit} disabled={loading || !email} full>
          {loading ? 'Sending…' : 'Send reset link →'}
        </V2Button>

        <Pressable
          onPress={() => { haptic.tap(); navigation.goBack(); }}
          hitSlop={8}
          style={({ pressed }) => [{ marginTop: 32, alignItems: 'center' }, pressed && { opacity: 0.5 }]}
        >
          <Text style={{ color: v2.faint, fontSize: 14 }}>
            Remembered it? <Text style={{ color: v2.text }}>Sign in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </V2Screen>
  );
}
