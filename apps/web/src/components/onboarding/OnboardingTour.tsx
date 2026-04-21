'use client';

import { useEffect, useState, useCallback } from 'react';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  { targetSelector: '[data-tour="dashboard-hero"]', title: 'Tvuj prehled', description: 'Tady vidis sve statistiky, streak a AI doporuceni.', position: 'bottom' },
  { targetSelector: '[data-tour="activity-rings"]', title: 'Aktivita', description: 'Tri krouzky ukazuji treninky, streak a XP.', position: 'bottom' },
  { targetSelector: '[data-tour="nav-ai-chat"]', title: 'AI Trener Alex', description: 'Zeptej se Alexe na cokoli o fitness.', position: 'bottom' },
  { targetSelector: '[data-tour="nav-gym"]', title: 'Zacni trenovat', description: 'Vyber si plan nebo zacni rychly trenink.', position: 'bottom' },
  { targetSelector: '[data-tour="nav-journal"]', title: 'Tvuj denik', description: 'Zapisuj si poznamky a fotky po treninku.', position: 'bottom' },
  { targetSelector: '[data-tour="nav-leagues"]', title: 'Soutez', description: 'Pripoj se do tydenni ligy a souper s ostatnimi.', position: 'bottom' },
  { targetSelector: '[data-tour="nav-more"]', title: 'Vic funkci', description: 'V menu Vice najdes recepty, kalendar, marketplace a dalsi.', position: 'bottom' },
];

const LS_KEY = 'fitai_onboarding_completed';

function getTargetRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

function computeTooltipStyle(
  rect: DOMRect,
  position: TourStep['position'],
): React.CSSProperties {
  const pad = 12;
  const base: React.CSSProperties = { position: 'fixed', zIndex: 9999 };

  if (position === 'bottom') {
    return { ...base, top: rect.bottom + pad, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
  }
  if (position === 'top') {
    return { ...base, bottom: window.innerHeight - rect.top + pad, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
  }
  if (position === 'right') {
    return { ...base, top: rect.top + rect.height / 2, left: rect.right + pad, transform: 'translateY(-50%)' };
  }
  return { ...base, top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + pad, transform: 'translateY(-50%)' };
}

export default function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return;
    } catch { return; }
    const timer = setTimeout(() => setActive(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const updateRect = useCallback(() => {
    if (!active) return;
    const rect = getTargetRect(TOUR_STEPS[step].targetSelector);
    setTargetRect(rect);
    if (rect) {
      const el = document.querySelector(TOUR_STEPS[step].targetSelector);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

  const complete = useCallback(() => {
    try { localStorage.setItem(LS_KEY, '1'); } catch { /* noop */ }
    setActive(false);
  }, []);

  const next = useCallback(() => {
    if (step >= TOUR_STEPS.length - 1) {
      complete();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, complete]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  if (!active || !targetRect) return null;

  const pad = 8;
  const spotStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9998,
    top: targetRect.top - pad,
    left: targetRect.left - pad,
    width: targetRect.width + pad * 2,
    height: targetRect.height + pad * 2,
    borderRadius: 12,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none' as const,
  };

  const tooltipStyle = computeTooltipStyle(targetRect, TOUR_STEPS[step].position);
  const current = TOUR_STEPS[step];

  return (
    <>
      {/* Overlay click to skip */}
      <div
        className="fixed inset-0 z-[9997]"
        onClick={complete}
        aria-hidden
      />

      {/* Spotlight cutout */}
      <div style={spotStyle} />

      {/* Tooltip */}
      <div
        style={tooltipStyle}
        className="w-72 rounded-2xl border border-[#A8FF00]/20 bg-black/95 p-5 shadow-2xl backdrop-blur"
      >
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A8FF00]">
          {step + 1}/{TOUR_STEPS.length}
        </div>
        <div className="mb-2 text-sm font-bold text-white">
          {current.title}
        </div>
        <p className="mb-4 text-[12px] leading-relaxed text-white/60">
          {current.description}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={complete}
            className="text-[11px] font-medium text-white/30 transition hover:text-white/60"
          >
            Preskocit
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-semibold text-white/60 transition hover:text-white"
              >
                Zpet
              </button>
            )}
            <button
              onClick={next}
              className="rounded-full bg-[#A8FF00] px-4 py-1.5 text-[11px] font-semibold text-black transition hover:bg-[#A8FF00]/80"
            >
              {step >= TOUR_STEPS.length - 1 ? 'Hotovo' : 'Dalsi'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Call this to clear the onboarding flag and restart the tour */
export function resetOnboardingTour() {
  try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
}
