'use client';

import { useState } from 'react';

interface MeasurementsInputProps {
  measurements: Record<string, number> | null;
  onChange: (m: Record<string, number>) => void;
}

const FIELDS = [
  { key: 'weightKg', label: 'Váha', unit: 'kg' },
  { key: 'armCm', label: 'Paže', unit: 'cm' },
  { key: 'chestCm', label: 'Hrudník', unit: 'cm' },
  { key: 'waistCm', label: 'Pas', unit: 'cm' },
];

export function MeasurementsInput({ measurements, onChange }: MeasurementsInputProps) {
  const [expanded, setExpanded] = useState(false);
  const data = measurements || {};

  function handleChange(key: string, value: string) {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    onChange({ ...data, [key]: num });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-[11px] text-white/40 transition hover:text-white/60"
      >
        {expanded ? '- Skrýt měření' : '+ Měření'}
      </button>
      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-1">
              <label className="text-[10px] text-white/40">{f.label}</label>
              <input
                type="number"
                step="0.1"
                value={data[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-14 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-white tabular-nums focus:border-[#A8FF00]/40 focus:outline-none"
              />
              <span className="text-[9px] text-white/30">{f.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
