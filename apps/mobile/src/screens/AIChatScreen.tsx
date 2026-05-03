import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { v2, V2SectionLabel } from '../components/v2/V2';
import { useHaptic } from '../components/native';
import { sendChatMessage } from '../lib/api';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const SUGGESTED = [
  'How to deadlift properly?',
  'My knees hurt, what to adjust?',
  'Build me a 4-day plan',
  'How much protein do I need?',
  'How to improve bench press?',
  'Suggest back exercises',
  'I\'m tired, should I train?',
  'How to warm up before squats?',
];

const MAX_MESSAGE_LENGTH = 1000;

function AvatarBadge() {
  return (
    <View style={s.avatar}>
      <Text style={s.avatarText}>A</Text>
    </View>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <View style={s.userRow}>
      <View style={s.userBubble}>
        <Text style={s.userText}>{content}</Text>
      </View>
    </View>
  );
}

function AssistantBubble({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <View style={s.assistantRow}>
      <View style={s.assistantAvatarWrap}>
        <Text style={s.assistantAvatarLetter}>A</Text>
      </View>
      <View style={s.assistantBubble}>
        <Text style={s.assistantText}>
          {content || (streaming ? '...' : '')}
        </Text>
      </View>
    </View>
  );
}

export function AIChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const haptic = useHaptic();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    if (text.trim().length > MAX_MESSAGE_LENGTH) {
      haptic.warning();
      setError(`Message too long (${text.trim().length}/${MAX_MESSAGE_LENGTH} chars)`);
      return;
    }
    haptic.tap();
    setError(null);
    setInput('');

    const userMsg: Msg = { role: 'user', content: text.trim() };
    const assistantMsg: Msg = { role: 'assistant', content: '', isStreaming: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setLoading(true);
    scrollToEnd();

    try {
      await sendChatMessage(
        text.trim(),
        conversationId,
        (delta) => {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + delta };
            }
            return updated;
          });
          scrollToEnd();
        },
        (id) => setConversationId(id),
      );
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, isStreaming: false };
        }
        return updated;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      haptic.error();
      setError(msg);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant' && last.isStreaming) {
          updated[updated.length - 1] = { role: 'assistant', content: `Error: ${msg}`, isStreaming: false };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, scrollToEnd, haptic]);

  const hasMessages = messages.length > 0;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <KeyboardAvoidingView
          style={s.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header — native iOS chevron + title */}
          <View style={s.header}>
            <Pressable
              onPress={() => { haptic.tap(); navigation.goBack(); }}
              hitSlop={12}
              style={({ pressed }) => [s.backBtnWrap, pressed && { opacity: 0.5 }]}
            >
              <Text style={s.backChevron}>‹</Text>
              <Text style={s.backBtn}>Back</Text>
            </Pressable>
            <Text style={s.headerTitle}>Alex</Text>
            <View style={{ width: 64 }} />
          </View>

          {/* Messages or Hero */}
          {!hasMessages ? (
            <ScrollView
              contentContainerStyle={s.heroContainer}
              showsVerticalScrollIndicator={false}
            >
              <AvatarBadge />
              <Text style={s.heroTitle}>Alex</Text>
              <Text style={s.heroSub}>
                Your AI fitness coach. Ask about training, nutrition, recovery.
              </Text>

              <View style={s.suggestedWrap}>
                <V2SectionLabel>Try asking</V2SectionLabel>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {SUGGESTED.map(p => (
                    <Pressable
                      key={p}
                      onPress={() => { haptic.selection(); handleSend(p); }}
                      style={({ pressed }) => [s.suggestChip, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={s.suggestText}>{p}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
              renderItem={({ item }) =>
                item.role === 'user'
                  ? <UserBubble content={item.content} />
                  : <AssistantBubble content={item.content} streaming={item.isStreaming} />
              }
            />
          )}

          {/* Error */}
          {error && !loading && (
            <Text style={s.errorText}>{error}</Text>
          )}

          {/* Input — bottom safe area handled here (KAV pads top edge) */}
          <View style={[s.inputRow, { paddingBottom: 12 + insets.bottom }]}>
            <TextInput
              style={s.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              maxLength={MAX_MESSAGE_LENGTH}
              placeholderTextColor={v2.ghost}
              returnKeyType="send"
              onSubmitEditing={() => handleSend(input)}
              editable={!loading}
              multiline
              blurOnSubmit
            />
            <Pressable
              onPress={() => handleSend(input)}
              disabled={loading || !input.trim()}
              style={({ pressed }) => [
                s.sendBtn,
                (!input.trim() || loading) && { opacity: 0.3 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={s.sendText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: v2.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: v2.border,
  },
  backBtnWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 64 },
  backChevron: { color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 },
  backBtn: { color: v2.text, fontSize: 16, fontWeight: '500' },
  headerTitle: { color: v2.text, fontSize: 16, fontWeight: '700' },
  heroContainer: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: v2.green,
  },
  avatarText: { color: '#000', fontSize: 28, fontWeight: '800' },
  heroTitle: { color: v2.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  heroSub: { color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 280 },
  suggestedWrap: { marginTop: 40, width: '100%' },
  suggestChip: {
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  suggestText: { color: v2.muted, fontSize: 12 },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: {
    backgroundColor: v2.green,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userText: { color: '#000', fontSize: 15, lineHeight: 21 },
  assistantRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  assistantAvatarWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: v2.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  assistantAvatarLetter: { color: '#000', fontSize: 12, fontWeight: '800' },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  assistantText: { color: v2.text, fontSize: 15, lineHeight: 21 },
  errorText: { color: v2.red, fontSize: 12, textAlign: 'center', marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: v2.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: v2.text,
    fontSize: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendBtn: {
    backgroundColor: v2.text,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendText: { color: '#000', fontSize: 14, fontWeight: '700' },
});
