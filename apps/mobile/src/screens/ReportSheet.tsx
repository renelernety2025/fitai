import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { reportContent, type ReportReason, type ReportTargetType } from '../lib/api';
import { V2Button, v2 } from '../components/v2/V2';
import { useHaptic } from '../components/native';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'HATE_SPEECH', label: 'Hate speech or symbols' },
  { value: 'NUDITY', label: 'Nudity or sexual content' },
  { value: 'VIOLENCE', label: 'Violence or threats' },
  { value: 'SELF_HARM', label: 'Self-harm or suicide' },
  { value: 'MISINFORMATION', label: 'False or harmful information' },
  { value: 'OTHER', label: 'Something else' },
];

interface ReportSheetProps {
  visible: boolean;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  onClose: () => void;
}

export function ReportSheet({ visible, targetType, targetId, targetLabel, onClose }: ReportSheetProps) {
  const haptic = useHaptic();
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setReason('SPAM');
    setDetails('');
    setSent(false);
    setErr(null);
  }

  async function submit() {
    if (busy) return;
    haptic.tap();
    setBusy(true);
    setErr(null);
    try {
      await reportContent({ targetType, targetId, reason, details: details.trim() || undefined });
      haptic.success();
      setSent(true);
    } catch (e: any) {
      haptic.error();
      setErr(e?.message || 'Could not send report');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => { reset(); onClose(); }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#0E0E0E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' }}>
          {sent ? (
            <View style={{ paddingVertical: 24 }}>
              <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 }}>THANKS</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Report received.</Text>
              <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
                We&apos;ll review {targetLabel} within 24 hours.
              </Text>
              <V2Button onPress={() => { reset(); onClose(); }} full>Done</V2Button>
            </View>
          ) : (
            <ScrollView>
              <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 }}>REPORT</Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>What&apos;s wrong?</Text>
              <Text style={{ color: v2.muted, fontSize: 13, marginBottom: 20 }}>
                Reporting {targetLabel}. Your report is anonymous to the author.
              </Text>

              {REASONS.map((r) => (
                <Pressable
                  key={r.value}
                  onPress={() => { haptic.selection(); setReason(r.value); }}
                  style={{
                    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 8,
                    backgroundColor: reason === r.value ? 'rgba(232,93,44,0.15)' : v2.surface,
                    borderWidth: 1,
                    borderColor: reason === r.value ? v2.red : v2.border,
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 14 }}>{r.label}</Text>
                </Pressable>
              ))}

              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="More details (optional)"
                placeholderTextColor={v2.muted}
                maxLength={500}
                multiline
                style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  backgroundColor: v2.surface, borderWidth: 1, borderColor: v2.border,
                  color: '#FFF', minHeight: 80, fontSize: 14,
                }}
              />

              {err && <Text style={{ color: v2.red, fontSize: 13, marginTop: 12 }}>{err}</Text>}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 32 }}>
                <View style={{ flex: 1 }}>
                  <V2Button onPress={() => { reset(); onClose(); }} variant="secondary" full>Cancel</V2Button>
                </View>
                <View style={{ flex: 1 }}>
                  <V2Button onPress={submit} disabled={busy} full>
                    {busy ? 'Sending…' : 'Send report'}
                  </V2Button>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
