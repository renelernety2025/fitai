'use client';

import { useState } from 'react';
import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

const NAVY = '#0B1A2E';
const NAVY_LIGHT = '#132744';
const ORANGE = '#FF7A2F';
const CREAM = '#FFF8F0';

const conversations = [
  { id: 1, title: 'Deadlift form check', time: 'Today, 14:22', active: true },
  { id: 2, title: 'Nutrition plan update', time: 'Yesterday', active: false },
  { id: 3, title: 'Recovery after illness', time: 'Apr 20', active: false },
  { id: 4, title: 'Bench plateau help', time: 'Apr 18', active: false },
  { id: 5, title: 'Shoulder warm-up', time: 'Apr 15', active: false },
];

const messages = [
  { role: 'ai', text: 'Hey! I reviewed your last deadlift session. Your form score was 87% which is solid, but I noticed your lower back rounding slightly on reps 8-10. Want me to break down the fix?' },
  { role: 'user', text: 'Yes please, I felt it in my lower back too. What should I focus on?' },
  { role: 'ai', text: 'Great self-awareness! Here are 3 key fixes:\n\n1. Brace harder before each rep - take a big belly breath and push your abs out against your belt.\n\n2. Keep the bar closer to your shins - it drifted 2-3cm forward on later reps.\n\n3. Drop to 6 reps at this weight until form is locked in. Quality over quantity.' },
  { role: 'user', text: 'Should I add any accessory work for lower back strength?' },
];

const prompts = ['Jak na deadlift?', 'Dnesni plan', 'Tip na vyzivu'];

export default function AIChatPage() {
  const [input, setInput] = useState('');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }
        @keyframes dotPulse { 0%,80%,100% { opacity:0.3 } 40% { opacity:1 } }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 280, background: NAVY, borderRight: `1px solid ${NAVY_LIGHT}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FitIconBox name="brain" size={36} bg={ORANGE} color="#fff" radius={10} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>AI Coach</span>
        </div>
        <button style={{ margin: '0 16px 16px', padding: '10px 16px', background: NAVY_LIGHT, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FitIcon name="plus" size={16} color={ORANGE} /> New conversation
        </button>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {conversations.map((c) => (
            <div key={c.id} style={{ padding: '12px 14px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: c.active ? NAVY_LIGHT : 'transparent', borderLeft: c.active ? `3px solid ${ORANGE}` : '3px solid transparent' }}>
              <div style={{ fontSize: 14, fontWeight: c.active ? 700 : 500, color: c.active ? '#fff' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{c.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: CREAM }}>
        {/* Chat header */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(11,26,46,0.08)', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
          <FitIconBox name="brain" size={40} bg="rgba(255,122,47,0.12)" color={ORANGE} radius={12} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: NAVY }}>AI Coach</div>
            <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: '#22c55e', display: 'inline-block' }} /> Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-end' }}>
              {m.role === 'ai' && <FitIconBox name="brain" size={30} bg={NAVY} color={ORANGE} radius={8} style={{ flexShrink: 0, marginBottom: 2 }} />}
              <div style={{
                maxWidth: '65%',
                padding: '14px 18px',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.role === 'user' ? NAVY : '#fff',
                color: m.role === 'user' ? '#fff' : NAVY,
                fontSize: 14,
                lineHeight: 1.65,
                border: m.role === 'ai' ? '1px solid rgba(11,26,46,0.08)' : 'none',
                whiteSpace: 'pre-line',
              }}>{m.text}</div>
            </div>
          ))}

          {/* Typing indicator */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <FitIconBox name="brain" size={30} bg={NAVY} color={ORANGE} radius={8} style={{ marginBottom: 2 }} />
            <div style={{ background: '#fff', border: '1px solid rgba(11,26,46,0.08)', borderRadius: '16px 16px 16px 4px', padding: '14px 20px', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map((d) => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: 4, background: NAVY_LIGHT, display: 'inline-block', animation: 'dotPulse 1.2s infinite', animationDelay: `${d * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        <div style={{ padding: '0 28px 12px', display: 'flex', gap: 10 }}>
          {prompts.map((p) => (
            <button key={p} style={{ background: '#fff', border: '1px solid rgba(11,26,46,0.1)', borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: NAVY, cursor: 'pointer', whiteSpace: 'nowrap' }}>{p}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 28px 20px', background: CREAM }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#fff', borderRadius: 14, padding: '6px 6px 6px 18px', border: '1px solid rgba(11,26,46,0.1)' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your AI coach..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: NAVY, fontFamily: 'inherit' }} />
            <button style={{ width: 42, height: 42, borderRadius: 11, background: ORANGE, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FitIcon name="arrow" size={20} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
