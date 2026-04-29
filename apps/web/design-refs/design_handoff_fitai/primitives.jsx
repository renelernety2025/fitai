// FIT_AI — Shared UI primitives
// Buttons, chips, badges, avatars, progress, mini-charts, blocks.

// ─── Button ──────────────────────────────────────────────────
const Button = ({ children, variant = 'primary', size = 'md', icon, iconRight, full, onClick, style = {}, ...rest }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-display)', fontWeight: 600,
    letterSpacing: '-0.01em', borderRadius: 'var(--r-pill)',
    transition: 'transform .15s ease, background .15s ease, box-shadow .2s ease',
    whiteSpace: 'nowrap', userSelect: 'none',
    width: full ? '100%' : undefined,
  };
  const sizes = {
    sm: { height: 34, padding: '0 14px', fontSize: 13 },
    md: { height: 44, padding: '0 22px', fontSize: 15 },
    lg: { height: 56, padding: '0 30px', fontSize: 17 },
  };
  const variants = {
    primary: { background: '#fff', color: '#000' },
    accent:  { background: 'var(--accent)', color: '#fff', boxShadow: 'var(--shadow-ember)' },
    glass:   { background: 'var(--bg-glass)', color: 'var(--text-1)', border: '1px solid var(--stroke-2)', backdropFilter: 'blur(20px)' },
    ghost:   { background: 'transparent', color: 'var(--text-1)', border: '1px solid var(--stroke-3)' },
    plain:   { background: 'transparent', color: 'var(--text-1)' },
    dark:    { background: '#000', color: '#fff' },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 16} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 16} />}
    </button>
  );
};

// ─── Icon button (square, 40px) ──────────────────────────────
const IconButton = ({ icon, size = 40, variant = 'glass', onClick, badge, style = {} }) => {
  const variants = {
    glass: { background: 'var(--bg-glass)', border: '1px solid var(--stroke-2)' },
    plain: { background: 'transparent' },
    solid: { background: 'var(--bg-3)', border: '1px solid var(--stroke-2)' },
  };
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 'var(--r-pill)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-1)', position: 'relative',
      ...variants[variant], ...style,
    }}>
      <Icon name={icon} size={size > 36 ? 18 : 16} />
      {badge && <span style={{
        position: 'absolute', top: 6, right: 6, width: 8, height: 8,
        borderRadius: '50%', background: 'var(--accent)',
        boxShadow: '0 0 0 2px var(--bg-1)',
      }}/>}
    </button>
  );
};

// ─── Chip (filter pill) ──────────────────────────────────────
const Chip = ({ children, active, onClick, icon, style = {} }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)',
    fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em',
    background: active ? '#fff' : 'var(--bg-glass)',
    color: active ? '#000' : 'var(--text-1)',
    border: `1px solid ${active ? '#fff' : 'var(--stroke-2)'}`,
    transition: 'all .15s', whiteSpace: 'nowrap',
    ...style,
  }}>
    {icon && <Icon name={icon} size={14} />}
    {children}
  </button>
);

// ─── Tag (small label) ───────────────────────────────────────
const Tag = ({ children, color, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px',
    borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
    background: color || 'var(--bg-3)',
    color: color ? '#000' : 'var(--text-2)',
    ...style,
  }}>{children}</span>
);

// ─── Avatar ──────────────────────────────────────────────────
const Avatar = ({ src, size = 32, online, ring, style = {} }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', position: 'relative',
    background: 'var(--bg-3)', overflow: 'hidden',
    border: ring ? `2px solid ${ring}` : 'none',
    flexShrink: 0, ...style,
  }}>
    {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
    {online && <span style={{
      position: 'absolute', bottom: 0, right: 0,
      width: size / 4, height: size / 4, borderRadius: '50%',
      background: 'var(--positive)', border: '2px solid var(--bg-1)',
    }}/>}
  </div>
);

const AvatarStack = ({ avatars, size = 28, max = 4 }) => {
  const shown = avatars.slice(0, max);
  return (
    <div style={{ display: 'flex' }}>
      {shown.map((src, i) => (
        <div key={i} style={{ marginLeft: i ? -size / 3 : 0, border: '2px solid var(--bg-1)', borderRadius: '50%' }}>
          <Avatar src={src} size={size} />
        </div>
      ))}
      {avatars.length > max && (
        <div style={{
          marginLeft: -size / 3, width: size, height: size, borderRadius: '50%',
          background: 'var(--bg-3)', border: '2px solid var(--bg-1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
        }}>+{avatars.length - max}</div>
      )}
    </div>
  );
};

// ─── Card (Notion-block style) ────────────────────────────────
const Card = ({ children, padding = 20, style = {}, hover = false, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--stroke-1)',
    borderRadius: 'var(--r-lg)',
    padding,
    transition: 'border-color .15s, transform .15s',
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  }}
  onMouseEnter={(e) => hover && (e.currentTarget.style.borderColor = 'var(--stroke-3)')}
  onMouseLeave={(e) => hover && (e.currentTarget.style.borderColor = 'var(--stroke-1)')}
  >
    {children}
  </div>
);

// ─── Section header (eyebrow + title + see all) ─────────────
const SectionHeader = ({ eyebrow, title, action, style = {} }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    marginBottom: 20, ...style,
  }}>
    <div>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
      <div className="display-3">{title}</div>
    </div>
    {action && (
      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        color: 'var(--text-2)', fontSize: 13, fontWeight: 500,
      }}>
        {action} <Icon name="arrow-r" size={14} />
      </button>
    )}
  </div>
);

// ─── Metric (big number) ─────────────────────────────────────
const Metric = ({ label, value, unit, delta, deltaPositive, sub }) => (
  <div>
    <div className="caption" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10, fontWeight: 500 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span className="metric" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{value}</span>
      {unit && <span className="metric" style={{ fontSize: 13, color: 'var(--text-3)' }}>{unit}</span>}
    </div>
    {(delta || sub) && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {delta && <span className="metric" style={{
          fontSize: 11, fontWeight: 500,
          color: deltaPositive ? 'var(--positive)' : 'var(--accent)',
        }}>{deltaPositive ? '↑' : '↓'} {delta}</span>}
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
    )}
  </div>
);

// ─── Sparkline ───────────────────────────────────────────────
const Sparkline = ({ data, color = 'var(--accent)', width = 120, height = 36, fill = true }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * width, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const id = 'sg' + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${id})`}/>}
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── Bars (vertical) ─────────────────────────────────────────
const BarChart = ({ data, labels, height = 80, barW = 14, gap = 6, color = 'var(--accent)', highlight }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap, height }}>
        {data.map((v, i) => (
          <div key={i} style={{
            width: barW,
            height: `${(v / max) * 100}%`,
            background: i === highlight ? color : 'var(--bg-4)',
            borderRadius: 3,
          }}/>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap }}>
          {labels.map((l, i) => (
            <div key={i} style={{
              width: barW, textAlign: 'center', fontSize: 10,
              color: i === highlight ? 'var(--text-1)' : 'var(--text-3)',
              fontFamily: 'var(--font-mono)',
            }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Ring (progress) ─────────────────────────────────────────
const Ring = ({ value, size = 64, stroke = 4, color = 'var(--accent)', label, sub }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-3)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s ease' }}/>
      </svg>
      {(label || sub) && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {label && <div className="metric" style={{ fontSize: size > 80 ? 24 : 16, fontWeight: 600 }}>{label}</div>}
          {sub && <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sub}</div>}
        </div>
      )}
    </div>
  );
};

// ─── Logo wordmark ───────────────────────────────────────────
const Logo = ({ size = 22, color = '#fff' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color }}>
    <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none">
      <path d="M5 5h18v3.5H9V13h12v3.5H9V23H5z" fill={color}/>
      <circle cx="23" cy="20" r="3" fill="var(--accent)"/>
    </svg>
    <span style={{
      fontFamily: 'var(--font-display)', fontWeight: 800,
      fontSize: size * 0.72, letterSpacing: '-0.02em',
      lineHeight: 1,
    }}>
      FIT<span style={{ color: 'var(--accent)' }}>_</span>AI
    </span>
  </div>
);

Object.assign(window, {
  Button, IconButton, Chip, Tag, Avatar, AvatarStack,
  Card, SectionHeader, Metric, Sparkline, BarChart, Ring, Logo,
});
