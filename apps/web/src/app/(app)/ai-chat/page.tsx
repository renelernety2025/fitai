'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Sparkline, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { sendChatMessage } from '@/lib/api';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const COACHES = [
  { name: 'Alex', role: 'Lead coach', active: true, unread: 2 },
  { name: 'Maya', role: 'Mobility' },
  { name: 'Kai', role: 'Running' },
];

const QUICK_PROMPTS = [
  'Plan my week',
  'I\'m sore today',
  'What should I eat?',
  'Show my progress',
  'How to improve bench press?',
  'I\'m tired, should I train?',
];

const SLEEP_DATA = [7.5, 7, 6.5, 8, 6, 5.5, 6.5];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null!);

  useEffect(() => { document.title = 'FitAI — AI Coach'; }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (text: string) => {
    setError(null);
    const userMsg: Msg = { role: 'user', content: text };
    const assistantMsg: Msg = { role: 'assistant', content: '', isStreaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    try {
      await sendChatMessage(
        text,
        conversationId,
        (delta) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: last.content + delta };
            }
            return updated;
          });
        },
        (id) => setConversationId(id),
      );
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, isStreaming: false };
        }
        return updated;
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send';
      setError(errMsg);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant' && last.isStreaming) {
          updated[updated.length - 1] = { role: 'assistant', content: `Error: ${errMsg}`, isStreaming: false };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: '100vh', background: 'var(--bg-0)' }}>
      <Sidebar onPromptClick={handleSend} />
      <ChatColumn
        messages={messages}
        loading={loading}
        error={error}
        scrollRef={scrollRef}
        onSend={handleSend}
        hasMessages={messages.length > 0}
      />
      <ContextPanel />
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────── */

function Sidebar({ onPromptClick }: { onPromptClick: (t: string) => void }) {
  return (
    <div style={{ borderRight: '1px solid var(--stroke-1)', padding: 24, overflow: 'auto' }}>
      <div className="v3-eyebrow" style={{ marginBottom: 20 }}>Your coaches</div>
      {COACHES.map((c) => (
        <div key={c.name} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 12,
          background: c.active ? 'var(--bg-card)' : 'transparent',
          borderRadius: 10, marginBottom: 6, cursor: 'pointer',
          border: c.active ? '1px solid var(--stroke-2)' : '1px solid transparent',
        }}>
          <Avatar name={c.name} size={40} online={c.active} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.role}</div>
          </div>
          {c.unread && (
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{c.unread}</div>
          )}
        </div>
      ))}

      <div className="v3-eyebrow" style={{ marginTop: 32, marginBottom: 16 }}>Quick prompts</div>
      {QUICK_PROMPTS.map((p) => (
        <div key={p} onClick={() => onPromptClick(p)} style={{
          padding: '10px 12px', fontSize: 13, color: 'var(--text-2)',
          borderRadius: 8, cursor: 'pointer', background: 'var(--bg-2, var(--bg-card))', marginBottom: 6,
        }}>{p}</div>
      ))}
    </div>
  );
}

/* ── Chat Column ─────────────────────────────────────── */

function ChatColumn({ messages, loading, error, scrollRef, onSend, hasMessages }: {
  messages: Msg[];
  loading: boolean;
  error: string | null;
  scrollRef: React.RefObject<HTMLDivElement>;
  onSend: (t: string) => void;
  hasMessages: boolean;
}) {
  const [text, setText] = useState('');

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <ChatHeader />
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!hasMessages && <EmptyState onPrompt={onSend} />}
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} isStreaming={msg.isStreaming} />
        ))}
      </div>
      <div style={{ padding: 20, borderTop: '1px solid var(--stroke-1)' }}>
        {error && !loading && <p className="v3-caption" style={{ color: 'var(--danger, #ef4444)', marginBottom: 8, textAlign: 'center' }}>{error}</p>}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--bg-2, var(--bg-card))', border: '1px solid var(--stroke-2)',
          borderRadius: 12, padding: '8px 8px 8px 16px',
        }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message Alex..."
            disabled={loading}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: 14, outline: 'none' }}
          />
          <button onClick={send} disabled={loading || !text.trim()} style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 600,
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--r-pill)', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || !text.trim() ? 0.45 : 1,
          }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatHeader() {
  return (
    <div style={{ padding: 24, borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Avatar name="Alex" size={44} online />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>Alex</div>
        <div style={{ fontSize: 12, color: 'var(--sage)' }}>Online</div>
      </div>
    </div>
  );
}

function EmptyState({ onPrompt }: { onPrompt: (t: string) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 64 }}>
      <Avatar name="Alex" size={72} />
      <div className="v3-display-3" style={{ marginTop: 16 }}>Ask me anything</div>
      <div className="v3-body" style={{ color: 'var(--text-3)', marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>
        Training, nutrition, recovery — I have your full context.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 32 }}>
        {QUICK_PROMPTS.slice(0, 4).map((p) => (
          <button key={p} onClick={() => onPrompt(p)} style={{
            padding: '10px 16px', fontSize: 13, color: 'var(--text-2)',
            borderRadius: 'var(--r-pill)', cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--stroke-2)',
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}

/* ── Context Panel ───────────────────────────────────── */

function ContextPanel() {
  return (
    <div style={{ borderLeft: '1px solid var(--stroke-1)', padding: 24, overflow: 'auto' }}>
      <div className="v3-eyebrow" style={{ marginBottom: 16 }}>What Alex sees</div>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <div className="v3-caption" style={{ marginBottom: 4 }}>Recovery score</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="v3-numeric" style={{ fontSize: 32, color: 'var(--accent-hot)' }}>62</span>
          <span className="v3-caption">down 18 from yesterday</span>
        </div>
      </Card>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <div className="v3-caption" style={{ marginBottom: 8 }}>Sleep — last 7 nights</div>
        <Sparkline data={SLEEP_DATA} width={240} height={40} />
        <div className="v3-caption" style={{ marginTop: 6 }}>Avg 6h 42m</div>
      </Card>

      <Card padding={16} style={{ marginBottom: 12 }}>
        <div className="v3-caption" style={{ marginBottom: 8 }}>This week</div>
        <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>
          3 sessions completed<br />Total: 4h 12min
        </div>
      </Card>

      <div className="v3-caption" style={{ lineHeight: 1.5, padding: '12px 4px' }}>
        Alex only sees data you share.{' '}
        <span style={{ color: 'var(--accent-hot)', fontWeight: 600, cursor: 'pointer' }}>Manage privacy</span>
      </div>
    </div>
  );
}
