'use client';

type CoachPersonality = 'DRILL' | 'CHILL' | 'MOTIVATIONAL';

interface CoachPersonalityPickerProps {
  value: CoachPersonality;
  onChange: (personality: CoachPersonality) => void;
}

const PERSONALITIES: {
  id: CoachPersonality;
  name: string;
  description: string;
  icon: string;
  accent: string;
}[] = [
  {
    id: 'DRILL',
    name: 'Drill Sergeant',
    description: 'Tvrdej ale ferovej. Zadny vymluvy.',
    icon: 'sergeant',
    accent: '#FF375F',
  },
  {
    id: 'MOTIVATIONAL',
    name: 'Motivator',
    description: 'Pozitivni energie. Kazdy rep se pocita!',
    icon: 'fire',
    accent: '#FF9F0A',
  },
  {
    id: 'CHILL',
    name: 'Chill Coach',
    description: 'V klidu, vlastnim tempem. Zadny tlak.',
    icon: 'peace',
    accent: '#30D5C8',
  },
];

const ICONS: Record<string, string> = {
  sergeant: '\u{1F3D6}',
  fire: '\u{1F525}',
  peace: '\u{270C}',
};

/** 3-card coach personality picker for gym session start. */
export default function CoachPersonalityPicker({
  value,
  onChange,
}: CoachPersonalityPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {PERSONALITIES.map((p) => {
        const isSelected = value === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`rounded-xl border p-4 text-left transition ${
              isSelected
                ? 'border-white/30 bg-white/8'
                : 'border-white/8 hover:border-white/15 hover:bg-white/3'
            }`}
          >
            <div className="mb-2 text-2xl">{ICONS[p.icon]}</div>
            <div
              className="mb-1 text-sm font-bold"
              style={{ color: isSelected ? p.accent : 'white' }}
            >
              {p.name}
            </div>
            <div className="text-[11px] leading-tight text-white/50">
              {p.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
