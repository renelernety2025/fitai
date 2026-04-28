'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { useAuth } from '@/lib/auth-context';
import {
  getConversations,
  getMessages,
  sendDirectMessage,
} from '@/lib/api';

interface Conversation {
  id: string;
  otherUser: { id: string; name: string };
  lastMessage?: { content: string; createdAt: string };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const m = Math.floor(
    (Date.now() - new Date(date).getTime()) / 60000,
  );
  if (m < 1) return 'ted';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (c: Conversation) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div
        className="py-12 text-center text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Zadne zpravy. Najdi trenaka nebo sleduj pratele.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="flex w-full items-center gap-3 border-b px-3 py-4 text-left transition"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            backgroundColor:
              activeId === c.id
                ? 'rgba(255,255,255,0.04)'
                : 'transparent',
          }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-primary)',
            }}
          >
            {c.otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {c.otherUser.name}
            </div>
            {c.lastMessage && (
              <div
                className="truncate text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {c.lastMessage.content}
              </div>
            )}
          </div>
          {c.lastMessage && (
            <span
              className="flex-shrink-0 text-[9px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {timeAgo(c.lastMessage.createdAt)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function ChatPanel({
  conversationId,
  otherName,
}: {
  conversationId: string;
  otherName: string;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(() => {
    getMessages(conversationId)
      .then(setMessages)
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    const iv = setInterval(loadMessages, 10000);
    return () => clearInterval(iv);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendDirectMessage(
        conversationId,
        text.trim(),
      );
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch {
      // silent
    }
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="border-b px-4 py-3"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {otherName}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === user?.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[75%] rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: mine
                    ? 'rgba(168,255,0,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'var(--text-primary)',
                }}
              >
                <p className="text-sm">{m.content}</p>
                <p
                  className="mt-1 text-right text-[9px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {timeAgo(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 border-t p-4"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Napsat zpravu..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="text-[11px] font-semibold uppercase tracking-[0.15em] transition disabled:opacity-30"
          style={{ color: '#A8FF00' }}
        >
          Odeslat
        </button>
      </div>
    </div>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={<><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-[#A8FF00] rounded-full animate-spin" /></div></>}>
      <MessagesPage />
    </Suspense>
  );
}

function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(
    [],
  );
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'FitAI — Zprávy'; }, []);

  useEffect(() => {
    getConversations()
      .then((data) => {
        setConversations(data);
        const cId = searchParams.get('c');
        if (cId) {
          const found = data.find(
            (c: Conversation) => c.id === cId,
          );
          if (found) setActive(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <>
      <section className="pt-12 pb-6">
        <V2SectionLabel>Zpravy</V2SectionLabel>
        <V2Display size="lg">Chat.</V2Display>
      </section>

      {loading ? (
        <div
          className="py-20 text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Nacitam...
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            height: '60vh',
          }}
        >
          <div className="flex h-full">
            {/* Left: conversations */}
            <div
              className="w-1/3 overflow-y-auto border-r"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <ConversationList
                conversations={conversations}
                activeId={active?.id ?? null}
                onSelect={setActive}
              />
            </div>

            {/* Right: chat */}
            <div className="flex-1">
              {active ? (
                <ChatPanel
                  key={active.id}
                  conversationId={active.id}
                  otherName={active.otherUser.name}
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Vyber konverzaci
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
