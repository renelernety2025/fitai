'use client';

import React from 'react';

function renderContent(raw: string): React.ReactNode[] {
  const lines = raw.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (i > 0) nodes.push(<br key={`br-${i}`} />);

    if (line.startsWith('- ')) {
      nodes.push(
        <li key={`li-${i}`} className="ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>,
      );
    } else {
      nodes.push(<React.Fragment key={`l-${i}`}>{renderInline(line)}</React.Fragment>);
    }
  });

  return nodes;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(<strong key={`b-${match.index}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
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
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: 'var(--accent)', color: 'var(--bg-0)' }}
        >
          AI
        </div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke-1)' }}>
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)', animation: `typingDot 0.6s ease-in-out ${i * 0.15}s infinite` }}
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
          className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: 'var(--accent)', color: 'var(--bg-0)' }}
      >
        AI
      </div>
      <div
        className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)' }}
      >
        {renderContent(content)}
      </div>
    </div>
  );
}
