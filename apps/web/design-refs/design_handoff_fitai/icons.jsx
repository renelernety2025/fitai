// FIT_AI — Icon library
// Stroke icons, 24x24, 1.6 stroke. Sportif but precise.

const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.6, style = {} }) => {
  const props = {
    width: size, height: size,
    viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style,
  };
  switch (name) {
    case 'home':       return <svg {...props}><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2v-9z"/></svg>;
    case 'calendar':   return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'play':       return <svg {...props} fill={color} stroke="none"><path d="M7 4v16l13-8z"/></svg>;
    case 'pause':      return <svg {...props} fill={color} stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>;
    case 'plus':       return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search':     return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'arrow-r':    return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-ur':   return <svg {...props}><path d="M7 17L17 7M9 7h8v8"/></svg>;
    case 'chevron-r':  return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-d':  return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'flame':      return <svg {...props}><path d="M12 2s4 5 4 9a4 4 0 11-8 0c0-1 .5-2 1-3-2 1-3 3-3 6a6 6 0 1012 0c0-5-6-12-6-12z"/></svg>;
    case 'bolt':       return <svg {...props}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>;
    case 'heart':      return <svg {...props}><path d="M12 21s-7-4.5-9.5-9C.7 8.7 2 5 5.5 5c2 0 3.5 1 4.5 2.5l2 2 2-2C15 6 16.5 5 18.5 5 22 5 23.3 8.7 21.5 12 19 16.5 12 21 12 21z"/></svg>;
    case 'pulse':      return <svg {...props}><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>;
    case 'dumbbell':   return <svg {...props}><path d="M2 12h2M22 12h-2M6 8v8M18 8v8M9 6v12M15 6v12M9 12h6"/></svg>;
    case 'timer':      return <svg {...props}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6M12 5V2"/></svg>;
    case 'user':       return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'users':      return <svg {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M16 4a4 4 0 010 8M22 21c0-3-2-5-4-6"/></svg>;
    case 'trophy':     return <svg {...props}><path d="M8 4h8v6a4 4 0 11-8 0V4zM8 6H4v2a3 3 0 003 3M16 6h4v2a3 3 0 01-3 3M10 16h4v3h2v2H8v-2h2v-3z"/></svg>;
    case 'target':     return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>;
    case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6 6-2z"/></svg>;
    case 'sparkles':   return <svg {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14zM5 16l.5 1.5L7 18l-1.5.5L5 20l-.5-1.5L3 18l1.5-.5L5 16z"/></svg>;
    case 'mic':        return <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>;
    case 'message':    return <svg {...props}><path d="M3 6a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H8l-5 4V6z"/></svg>;
    case 'bell':       return <svg {...props}><path d="M6 8a6 6 0 0112 0v5l2 3H4l2-3V8zM10 19a2 2 0 004 0"/></svg>;
    case 'settings':   return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1A1.7 1.7 0 0015 4.6a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case 'check':      return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'close':      return <svg {...props}><path d="M5 5l14 14M19 5L5 19"/></svg>;
    case 'menu':       return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'filter':     return <svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>;
    case 'sort':       return <svg {...props}><path d="M3 7h13M3 12h9M3 17h5M17 7v12l4-4M17 19l-4-4"/></svg>;
    case 'more':       return <svg {...props}><circle cx="5" cy="12" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="19" cy="12" r="1.5" fill={color}/></svg>;
    case 'lock':       return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>;
    case 'eye':        return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'apple':      return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><path d="M17.05 20.28c-.98.95-2.05.83-3.08.38-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>;
    case 'google':     return <svg width={size} height={size} viewBox="0 0 24 24" style={style}><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.8h5.4c-.23 1.25-.94 2.31-2 3.02v2.5h3.23c1.89-1.74 2.97-4.3 2.97-7.32z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.58A10 10 0 0012 22z"/><path fill="#FBBC04" d="M6.4 13.9a6 6 0 010-3.83V7.5H3.06a10 10 0 000 9l3.34-2.6z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.78.5 3.82 1.5l2.86-2.86A10 10 0 003.06 7.5L6.4 10.07C7.19 7.71 9.4 5.95 12 5.95z"/></svg>;
    case 'logo': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <path d="M4 4h16v3H7v4h11v3H7v6H4z" fill={color}/>
        <circle cx="20" cy="18" r="2.5" fill="#FF4B12"/>
      </svg>
    );
    default:           return null;
  }
};

window.Icon = Icon;
