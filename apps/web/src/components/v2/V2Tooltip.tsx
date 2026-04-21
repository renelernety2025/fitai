'use client';

import { useEffect, useState } from 'react';

interface V2TooltipProps {
  id: string;
  children: React.ReactNode;
  tip: string;
  position?: 'top' | 'bottom';
}

/**
 * One-time tooltip that shows on first visit, dismissible.
 * Uses localStorage to track which tips have been seen.
 */
export function V2Tooltip({ id, children, tip, position = 'bottom' }: V2TooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const key = `fitai_tip_${id}`;
      if (!localStorage.getItem(key)) {
        setTimeout(() => setVisible(true), 1000);
      }
    } catch { /* private browsing / storage full */ }
  }, [id]);

  function dismiss() {
    try { localStorage.setItem(`fitai_tip_${id}`, '1'); } catch {}
    setVisible(false);
  }

  return (
    <div className="relative inline-block">
      {children}
      {visible && (
        <div
          className={`absolute z-50 w-64 rounded-xl border border-[#A8FF00]/20 bg-black/95 p-4 shadow-xl backdrop-blur ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-1/2 -translate-x-1/2`}
        >
          <p className="text-[12px] leading-relaxed text-white/70">{tip}</p>
          <button
            onClick={dismiss}
            className="mt-2 text-[10px] font-semibold text-[#A8FF00] transition hover:text-[#A8FF00]/80"
          >
            Rozumim
          </button>
          <div
            className={`absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-[#A8FF00]/20 bg-black/95 ${
              position === 'top' ? 'top-full -mt-1 border-b border-r' : 'bottom-full -mb-1 border-t border-l'
            }`}
          />
        </div>
      )}
    </div>
  );
}
