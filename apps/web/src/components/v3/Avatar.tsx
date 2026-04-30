interface AvatarProps {
  src?: string;
  size?: number;
  online?: boolean;
  ring?: string;
  name?: string;
  className?: string;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function Avatar({ src, size = 32, online, ring, name, className = '' }: AvatarProps) {
  return (
    <div
      className={`v3-avatar ${className}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        position: 'relative', flexShrink: 0, overflow: 'hidden',
        background: 'var(--bg-3)',
        border: ring ? `2px solid ${ring}` : 'none',
      }}
    >
      {src ? (
        <img src={src} alt={name ? `${name} avatar` : 'User avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : name ? (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.36, fontWeight: 600, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
        }}>
          {getInitials(name)}
        </div>
      ) : null}
      {online && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 10, height: 10, borderRadius: '50%',
          background: 'var(--positive, #34d399)',
          border: '2px solid var(--bg-0)',
        }} />
      )}
    </div>
  );
}

interface AvatarStackProps {
  avatars: { src?: string; name?: string }[];
  size?: number;
  max?: number;
}

export function AvatarStack({ avatars, size = 28, max = 4 }: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((a, i) => (
        <div key={i} style={{
          marginLeft: i ? -size * 0.25 : 0,
          border: '2px solid var(--bg-0)', borderRadius: '50%',
        }}>
          <Avatar src={a.src} name={a.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          marginLeft: -size * 0.25, width: size, height: size,
          borderRadius: '50%', background: 'var(--bg-3)',
          border: '2px solid var(--bg-0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
        }}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
