'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { FadeIn } from '@/components/v2/motion';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { sendChatMessage } from '@/lib/api';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  'Jak spravne delat mrtvou tah?',
  'Mam bolesti kolen, co upravit?',
  'Sestav mi treninkovy plan na 4 dny',
  'Kolik bilkovin potrebuji denne?',
  'Jak zlepsit bench press?',
  'Doporuc mi cviky na zada',
  'Jsem unaveny, mam dnes trenovat?',
  'Jak se zahrat pred drepy?',
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = 'FitAI — AI Chat'; }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    async (text: string) => {
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
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + delta,
                };
              }
              return updated;
            });
          },
          (id) => setConversationId(id),
        );
        // Mark streaming done
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, isStreaming: false };
          }
          return updated;
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Nepodarilo se odeslat zpravu';
        setError(errMsg);
        // Replace streaming bubble with error
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant' && last.isStreaming) {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `Chyba: ${errMsg}`,
              isStreaming: false,
            };
          }
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [conversationId],
  );

  const hasMessages = messages.length > 0;

  return (
    <V2Layout>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Scrollable message area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
          {/* Hero — visible only before first message */}
          {!hasMessages && (
            <section className="flex flex-col items-center pt-16 pb-12 text-center">
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #A8FF00, #00E5FF)' }}
              >
                A
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Alex</h1>
              <p className="mt-2 max-w-md text-sm text-white/50">
                Tvuj AI fitness coach. Ptej se na trenink, vyzivu, regeneraci — cokoli co te
                zajima.
              </p>

              <div className="mt-12 w-full max-w-lg">
                <V2SectionLabel>Zkus se zeptat</V2SectionLabel>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="space-y-4 pt-6">
              {messages.map((msg, i) => (
                <FadeIn key={i} delay={0.05}>
                  <ChatBubble
                    role={msg.role}
                    content={msg.content}
                    isStreaming={msg.isStreaming}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        {/* Sticky input with gradient fade */}
        <div className="relative mt-auto pt-2">
          <div
            className="pointer-events-none absolute -top-12 left-0 right-0 h-12"
            style={{
              background: 'linear-gradient(to bottom, transparent, black)',
            }}
          />
          <div className="relative pb-4">
            {error && !loading && (
              <p className="mb-2 text-center text-xs text-red-400">{error}</p>
            )}
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    </V2Layout>
  );
}
