'use client';

import { useState, useEffect, useCallback } from 'react';

interface SpotlightStep {
  selector: string;
  title: string;
  description: string;
}

const STEPS: SpotlightStep[] = [
  {
    selector: '[data-tour="dashboard-hero"]',
    title: 'Dashboard',
    description: 'Prehled tvych statistik, streaku a AI doporuceni.',
  },
  {
    selector: '[data-tour="activity-rings"]',
    title: 'Zacni trenovat',
    description: 'Kruhy ukazuji treninky, streak a XP. Klikni a jdi na to.',
  },
  {
    selector: '[data-tour="nav-ai-chat"]',
    title: 'AI Chat',
    description: 'Zeptej se AI trenera na cokoli o fitness.',
  },
  {
    selector: 'a[href="/vyziva"]',
    title: 'Sleduj vyzivu',
    description: 'Zaznamenej jidlo a sleduj makra.',
  },
  {
    selector: 'a[href="/progress"]',
    title: 'Zkontroluj pokrok',
    description: 'Statistiky, plateaux a slabe stranky na jednom miste.',
  },
];

const LS_KEY = 'fitai_spotlight_done';

export default function OnboardingSpotlight() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setActive(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const updateRect = useCallback(() => {
    if (!active) return;
    const el = document.querySelector(STEPS[step].selector);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [active, step]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, '1');
    } catch {
      /* noop */
    }
    setActive(false);
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, finish]);

  if (!active || !rect) return null;

  const pad = 10;
  const current = STEPS[step];

  return (
    <>
      <div
        className="fixed inset-0 z-[9990]"
        onClick={finish}
        aria-hidden
      />
      <div
        style={{
          position: 'fixed',
          zIndex: 9991,
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          borderRadius: 14,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8)',
          transition: 'all 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          zIndex: 9992,
          top: rect.bottom + 16,
          left: Math.max(
            16,
            rect.left + rect.width / 2 - 140,
          ),
        }}
        className="w-72 rounded-2xl border border-[#BF5AF2]/20 bg-black/95 p-5 shadow-2xl backdrop-blur"
      >
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BF5AF2]">
          {step + 1}/{STEPS.length}
        </div>
        <div className="mb-2 text-sm font-bold text-white">
          {current.title}
        </div>
        <p className="mb-4 text-[12px] leading-relaxed text-white/60">
          {current.description}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-[11px] font-medium text-white/30 transition hover:text-white/60"
          >
            Preskocit
          </button>
          <button
            onClick={next}
            className="rounded-full bg-[#BF5AF2] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#BF5AF2]/80"
          >
            {step >= STEPS.length - 1 ? 'Hotovo' : 'Dalsi'}
          </button>
        </div>
      </div>
    </>
  );
}
