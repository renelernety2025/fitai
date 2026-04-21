'use client';

import { useState } from 'react';

const PRESET_TAGS = [
  { label: 'Push Day', color: '#FF375F' },
  { label: 'Pull Day', color: '#00E5FF' },
  { label: 'Leg Day', color: '#A8FF00' },
  { label: 'Cardio', color: '#FF9500' },
  { label: 'Mobility', color: '#BF5AF2' },
  { label: 'Deload', color: '#FFD600' },
  { label: 'Rest Day', color: 'rgba(255,255,255,0.3)' },
  { label: 'Outdoor', color: '#30D158' },
];

interface TagPickerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function getTagColor(tag: string): string {
  const preset = PRESET_TAGS.find((p) => p.label === tag);
  return preset ? preset.color : '#A8FF00';
}

export function TagPicker({ tags, onChange }: TagPickerProps) {
  const [customInput, setCustomInput] = useState('');

  function toggleTag(label: string) {
    if (tags.includes(label)) {
      onChange(tags.filter((t) => t !== label));
    } else {
      onChange([...tags, label]);
    }
  }

  function addCustomTag() {
    const trimmed = customInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setCustomInput('');
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.map((preset) => {
          const active = tags.includes(preset.label);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => toggleTag(preset.label)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                active ? 'text-white' : 'text-white/50 hover:text-white/70'
              }`}
              style={{
                border: `1px solid ${active ? preset.color : 'rgba(255,255,255,0.1)'}`,
                backgroundColor: active ? `${preset.color}22` : 'transparent',
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {/* Custom tags not in presets */}
      {tags.filter((t) => !PRESET_TAGS.find((p) => p.label === t)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags
            .filter((t) => !PRESET_TAGS.find((p) => p.label === t))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="rounded-full border border-[#A8FF00] bg-[#A8FF00]/10 px-2.5 py-0.5 text-[11px] font-medium text-white transition hover:bg-[#A8FF00]/20"
              >
                {tag} &times;
              </button>
            ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
          placeholder="Custom tag..."
          className="w-32 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-[#A8FF00]/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={addCustomTag}
          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/50 transition hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
