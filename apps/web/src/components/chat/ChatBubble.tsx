'use client';

import { motion } from 'framer-motion';

function formatContent(raw: string): string {
  let html = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Bullet lists: lines starting with "- "
  html = html.replace(
    /(?:^|\n)- (.+?)(?=\n|$)/g,
    (_m, item) => `<li class="ml-4 list-disc">${item}</li>`,
  );

  // Newlines to <br>
  html = html.replace(/\n/g, '<br/>');

  return html;
}

export function ChatBubble({
  role,
  content,
  isStreaming,
}: {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}) {
  const isUser = role === 'user';

  if (!isUser && !content && isStreaming) {
    return (
      <div className="flex items-start gap-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
          style={{ background: 'linear-gradient(135deg, #A8FF00, #00E5FF)' }}
        >
          A
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#A8FF00]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed text-black"
          style={{ background: 'linear-gradient(135deg, #A8FF00, #00E5FF)' }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
        style={{ background: 'linear-gradient(135deg, #A8FF00, #00E5FF)' }}
      >
        A
      </div>
      <div
        className="max-w-[80%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}
