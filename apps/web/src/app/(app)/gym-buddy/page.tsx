'use client';

import { useEffect, useState, useCallback } from 'react';
import BuddyProfileForm from '@/components/social/BuddyProfileForm';
import BuddyCard from '@/components/social/BuddyCard';
import {
  getBuddyProfile,
  getBuddyCards,
  getBuddyMatches,
  swipeBuddy,
  startConversation,
} from '@/lib/api';
import { useRouter } from 'next/navigation';

type Step = 'loading' | 'profile' | 'swipe' | 'matches';

export default function GymBuddyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [cards, setCards] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchAnim, setMatchAnim] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'FitAI — Gym Buddy'; }, []);

  useEffect(() => {
    getBuddyProfile()
      .then((p) => {
        if (p?.id) {
          loadCards();
        } else {
          setStep('profile');
        }
      })
      .catch(() => setStep('profile'));
  }, []);

  function loadCards() {
    getBuddyCards()
      .then((c) => {
        setCards(c);
        setStep('swipe');
      })
      .catch(() => setStep('swipe'));
  }

  function loadMatches() {
    getBuddyMatches()
      .then((m) => {
        setMatches(m);
        setStep('matches');
      })
      .catch(() => setStep('matches'));
  }

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      const card = cards[0];
      if (!card) return;
      try {
        const result = await swipeBuddy(
          card.user.id,
          direction,
        );
        if (result?.matched) {
          setMatchAnim(true);
          setTimeout(() => setMatchAnim(false), 2000);
        }
      } catch {
        // silent
      }
      setCards((prev) => prev.slice(1));
    },
    [cards],
  );

  async function handleMessage(userId: string) {
    try {
      const conv = await startConversation(userId);
      router.push(`/messages?c=${conv.id}`);
    } catch {
      setError('Failed to start conversation');
    }
  }

  if (step === 'loading') {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">Gym Buddy</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Find your<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>training partner.</em>
        </h1>
      </section>

      {error && (
        <div
          className="mb-6 rounded-xl p-4 text-sm"
          style={{
            backgroundColor: 'rgba(255,55,95,0.1)',
            color: '#FF375F',
          }}
        >
          {error}
        </div>
      )}

      {/* Match animation overlay */}
      {matchAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div
              className="mb-4 text-5xl font-black"
              style={{ color: 'var(--sage)' }}
            >
              Match!
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              You both want to train together
            </div>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      {step !== 'profile' && (
        <div className="mb-12 flex gap-2">
          <button
            onClick={() => {
              loadCards();
            }}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              step === 'swipe'
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60'
            }`}
          >
            Cards
          </button>
          <button
            onClick={loadMatches}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              step === 'matches'
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60'
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setStep('profile')}
            className="rounded-full border border-white/15 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition"
          >
            Profile
          </button>
        </div>
      )}

      {/* Profile form */}
      {step === 'profile' && (
        <section className="max-w-md">
          <BuddyProfileForm onDone={loadCards} />
        </section>
      )}

      {/* Swipe cards */}
      {step === 'swipe' && (
        <section className="mx-auto max-w-md">
          {cards.length === 0 ? (
            <div
              className="py-20 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No more cards. Try again later.
            </div>
          ) : (
            <BuddyCard
              key={cards[0].id}
              card={cards[0]}
              onSwipe={handleSwipe}
            />
          )}
        </section>
      )}

      {/* Matches list */}
      {step === 'matches' && (
        <section className="space-y-1">
          {matches.length === 0 && (
            <div
              className="py-20 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No matches yet. Swipe some cards!
            </div>
          )}
          {matches.map((m: any) => (
            <div
              key={m.id}
              className="flex items-center justify-between border-b py-5"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {m.user.name}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {m.user.level}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleMessage(m.user.id)}
                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--sage) 10%, transparent)',
                  color: 'var(--sage)',
                  border: '1px solid color-mix(in srgb, var(--sage) 20%, transparent)',
                }}
              >
                Message
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
