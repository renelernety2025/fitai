import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { updateUserName, changeUserPassword, deleteUserAccount } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, NativeConfirm } from '../components/native';

export function AccountScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth() as any;
  const haptic = useHaptic();

  const [name, setName] = useState(user?.name || '');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveName() {
    if (!name.trim() || nameBusy) return;
    haptic.tap();
    setNameBusy(true);
    setNameMsg(null);
    try {
      await updateUserName(name.trim());
      if (typeof updateUser === 'function') updateUser({ ...user, name: name.trim() });
      haptic.success();
      setNameMsg('Saved.');
    } catch (e: any) {
      haptic.error();
      setNameMsg(e?.message || 'Could not save');
    } finally {
      setNameBusy(false);
    }
  }

  async function handleChangePassword() {
    if (pwBusy) return;
    setPwErr(null);
    setPwMsg(null);
    if (newPw.length < 8) {
      setPwErr('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwErr('New passwords do not match.');
      return;
    }
    haptic.tap();
    setPwBusy(true);
    try {
      await changeUserPassword(currentPw, newPw);
      haptic.success();
      setPwMsg('Password updated.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e: any) {
      haptic.error();
      setPwErr(e?.message || 'Could not change password');
    } finally {
      setPwBusy(false);
    }
  }

  async function performDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    haptic.tap();
    try {
      await deleteUserAccount();
      haptic.success();
      await logout();
    } catch (e: any) {
      haptic.error();
      setDeleting(false);
    }
  }

  return (
    <V2Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingTop: 24, marginBottom: 32 }}>
          <V2SectionLabel>Account</V2SectionLabel>
          <V2Display size="xl">Your data.</V2Display>
          <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>{user?.email}</Text>
        </View>

        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>Display name</V2SectionLabel>
          <V2Input label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          {nameMsg ? <Text style={{ color: v2.muted, fontSize: 12, marginBottom: 12 }}>{nameMsg}</Text> : null}
          <V2Button onPress={handleSaveName} disabled={nameBusy || !name.trim() || name.trim() === user?.name} full>
            {nameBusy ? 'Saving…' : 'Save name'}
          </V2Button>
        </View>

        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>Change password</V2SectionLabel>
          <V2Input label="Current password" value={currentPw} onChangeText={setCurrentPw} placeholder="••••••••" secureTextEntry />
          <V2Input label="New password" value={newPw} onChangeText={setNewPw} placeholder="At least 8 chars" secureTextEntry />
          <V2Input label="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} placeholder="Repeat" secureTextEntry />
          {pwErr ? <Text style={{ color: v2.red, fontSize: 13, marginBottom: 12 }}>{pwErr}</Text> : null}
          {pwMsg ? <Text style={{ color: v2.muted, fontSize: 12, marginBottom: 12 }}>{pwMsg}</Text> : null}
          <V2Button onPress={handleChangePassword} disabled={pwBusy || !currentPw || !newPw || !confirmPw} full>
            {pwBusy ? 'Updating…' : 'Update password'}
          </V2Button>
        </View>

        <View style={{ marginBottom: 24 }}>
          <V2SectionLabel>Danger zone</V2SectionLabel>
          <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
            Permanently delete your FitAI account, all workout data, photos, and progress. This cannot be undone.
          </Text>
          <V2Button onPress={() => { haptic.press(); setConfirmDelete(true); }} variant="secondary" full>
            {deleting ? 'Deleting…' : 'Delete my account'}
          </V2Button>
        </View>
      </KeyboardAvoidingView>

      <NativeConfirm
        visible={confirmDelete}
        title="Delete account?"
        message="This permanently erases your workouts, plans, photos, AI history, and progress. You can't undo this."
        confirmLabel="Delete forever"
        destructive
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </V2Screen>
  );
}
