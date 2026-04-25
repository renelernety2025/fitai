/**
 * FitAI custom pictogram system.
 * Monoline stroke icons, 24x24 viewBox, currentColor.
 * Usage: <FitIcon name="dumbbell" size={20} />
 */

const ICONS: Record<string, string> = {
  // Training
  dumbbell: 'M3 12h2m14 0h2M7 8v8m10-8v8M5 10v4m14-4v4',
  barbell: 'M4 12h16M6 8v8m12-8v8M4 10v4m16-4v4',
  kettlebell: 'M9 6a3 3 0 0 1 6 0M8 9h8l1 6a5 5 0 0 1-10 0z',
  muscle: 'M5 18c0-4 2-6 4-7s3-3 3-6M19 18c0-4-2-6-4-7s-3-3-3-6M8 12h8',
  run: 'M13 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-1 3l-3 8m1-8l4 4-2 4m-5-3l2-2m3 7l2 3',
  timer: 'M12 6v6l4 2M12 2v2m0 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
  flame: 'M12 22c-4 0-7-3-7-7 0-3 2-5 4-7l3-3 3 3c2 2 4 4 4 7 0 4-3 7-7 7zm0-4c-1.5 0-3-1-3-3s1.5-3 3-4c1.5 1 3 2 3 4s-1.5 3-3 3z',
  target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',

  // Body
  heart: 'M12 21l-1-1C5 14 2 11 2 7.5 2 4.4 4.4 2 7.5 2c1.7 0 3.4.8 4.5 2.1C13.1 2.8 14.8 2 16.5 2 19.6 2 22 4.4 22 7.5 22 11 19 14 13 20l-1 1z',
  lungs: 'M12 4v14M8 8c-3 0-5 2-5 5v3a2 2 0 0 0 2 2h3m4-10c3 0 5 2 5 5v3a2 2 0 0 1-2 2h-3',
  brain: 'M12 2a4 4 0 0 0-4 4c-2 0-4 2-4 4s1 3 2 4c-1 1-2 3-2 4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-1-1-3-2-4 1-1 2-2 2-4s-2-4-4-4a4 4 0 0 0-4-4z',
  shield: 'M12 2l8 4v5c0 5-3 9-8 11-5-2-8-6-8-11V6z',

  // Nutrition
  apple: 'M12 3c1-2 3-3 5-3-0 2-2 3-5 3m0 4c-3 0-5 2-6 5s-1 7 1 9 4 3 5 3 3-1 5-3 3-6 1-9-1-5-6-5z',
  drop: 'M12 2l6 8a6 6 0 1 1-12 0z',
  leaf: 'M17 8C8 10 5 16 3 22c5-1 12-3 14-14zm0 0c2-2 3-5 4-6-1 1-4 2-6 4',
  pill: 'M10.5 1.5l-8 8a4.2 4.2 0 0 0 6 6l8-8a4.2 4.2 0 0 0-6-6zM6.5 9.5l7-7',

  // Social
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm12 10v-2a4 4 0 0 0-3-4m-1-8a4 4 0 0 1 0 8',
  trophy: 'M6 9a6 6 0 0 0 12 0V3H6zm-3 0a3 3 0 0 0 3 3m12-3a3 3 0 0 1-3 3m-3 3v4m-3 0h6',
  crown: 'M3 18h18l-2-10-4 4-5-6-5 6-4-4z',
  sword: 'M14.5 2.5l7 7M4 15l10-10 5 5-10 10zm-2 2l4 4M7 18l-3 3',
  star: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',

  // Analytics
  chart: 'M3 3v18h18M7 15l4-4 4 4 5-8',
  trending: 'M3 17l6-6 4 4L21 7m-7 0h7v7',
  pulse: 'M2 12h4l2-6 3 12 2-8 2 4h7',
  gauge: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-12a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4v4l3 2',

  // Gear
  shoe: 'M3 16l2-6c1-2 3-4 5-4h4c2 0 4 2 5 4l2 6H3zm0 0h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7-3h2M3 12h2m7-9v2m0 14v2m6.4-15.4l1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6l-1.4-1.4',
  camera: 'M4 7h2l1-2h10l1 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',

  // Navigation
  home: 'M3 10l9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm10 18l-4-4',
  menu: 'M3 6h18M3 12h18M3 18h18',
  arrow: 'M5 12h14m-7-7l7 7-7 7',
  plus: 'M12 5v14m-7-7h14',
  check: 'M5 12l5 5L20 7',
  x: 'M6 6l12 12M18 6L6 18',

  // Misc
  music: 'M9 18V5l12-2v13m-12 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',
  book: 'M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14l-8-3z',
  lock: 'M5 11h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zm2 0V7a5 5 0 0 1 10 0v4',
  gift: 'M4 8h16v4H4zm2 4v7h12v-7m-6 0V8m0 0c-2 0-4-2-4-3s2-2 4 0c2-2 4-1 4 0s-2 3-4 3z',
};

interface FitIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FitIcon({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.8,
  className,
  style,
}: FitIconProps) {
  const path = ICONS[name];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d={path} />
    </svg>
  );
}

export function FitIconBox({
  name,
  size = 44,
  iconSize,
  bg,
  color,
  radius = 14,
  style,
}: {
  name: string;
  size?: number;
  iconSize?: number;
  bg: string;
  color?: string;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      ...style,
    }}>
      <FitIcon name={name} size={iconSize ?? size * 0.5} color={color ?? 'white'} />
    </div>
  );
}

export const iconNames = Object.keys(ICONS);
