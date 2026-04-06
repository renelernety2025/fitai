'use client';

import { useEffect, useState } from 'react';

interface CoachingBubbleProps {
  message: string | null;
  priority: 'safety' | 'correction' | 'encouragement' | 'info' | null;
}

const priorityStyles: Record<string, string> = {
  safety: 'bg-red-600/90 border-red-500',
  correction: 'bg-yellow-600/90 border-yellow-500',
  encouragement: 'bg-green-600/90 border-green-500',
  info: 'bg-gray-700/90 border-gray-600',
};

export function CoachingBubble({ message, priority }: CoachingBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');
  const [displayPriority, setDisplayPriority] = useState('info');

  useEffect(() => {
    if (message && priority) {
      setDisplayMsg(message);
      setDisplayPriority(priority);
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, priority]);

  if (!visible || !displayMsg) return null;

  return (
    <div className="absolute left-4 bottom-16 z-20 max-w-xs">
      <div
        className={`rounded-xl border px-4 py-2.5 backdrop-blur transition-all duration-300 ${
          priorityStyles[displayPriority] || priorityStyles.info
        } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <p className="text-sm font-medium text-white">{displayMsg}</p>
      </div>
    </div>
  );
}
