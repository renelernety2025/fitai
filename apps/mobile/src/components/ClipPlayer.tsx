import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getClipPlayUrl } from '../lib/api';
import { v2 } from './v2/V2';

interface ClipPlayerProps {
  clipId: string;
  /** Width/height in px for the player. Default fills its container. */
  width?: number;
  height?: number;
  /** Auto-resolve play-url on mount. Default true. */
  autoLoad?: boolean;
}

/**
 * Lightweight wrapper around expo-video so the screen file stays platform-agnostic
 * and the screen can still bundle for web (where expo-video isn't supported and
 * a graceful fallback renders).
 *
 * Native module convention (CLAUDE.md): require() inside the resolver so a
 * missing autolink at dev time doesn't crash the entire JS bundle.
 */
export function ClipPlayer({ clipId, width, height, autoLoad = true }: ClipPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!autoLoad || !clipId) return;
    setLoading(true);
    setUrl(null);
    setError(null);
    getClipPlayUrl(clipId)
      .then(({ url }) => setUrl(url))
      .catch((e: any) => setError(e?.message ?? 'Could not load video'))
      .finally(() => setLoading(false));
  }, [clipId, autoLoad]);

  if (loading) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: v2.muted, fontSize: 12 }}>Loading video…</Text>
      </View>
    );
  }
  if (error || !url) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: v2.faint, fontSize: 12 }}>{error || 'Video unavailable'}</Text>
      </View>
    );
  }

  return <NativeVideoView url={url} width={width} height={height} />;
}

function NativeVideoView({ url, width, height }: { url: string; width?: number; height?: number }) {
  // Lazy-require expo-video so the bundle still loads on platforms / dev builds
  // without autolinking (CLAUDE.md mobile rule).
  let modules: any = null;
  try {
    modules = require('expo-video');
  } catch {
    modules = null;
  }
  if (!modules?.VideoView || !modules?.useVideoPlayer) {
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: v2.faint, fontSize: 12 }}>Video player not available</Text>
      </View>
    );
  }
  return <Player url={url} width={width} height={height} mod={modules} />;
}

function Player({ url, width, height, mod }: { url: string; width?: number; height?: number; mod: any }) {
  const { VideoView, useVideoPlayer } = mod;
  const player = useVideoPlayer(url, (p: any) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      style={{ width, height, backgroundColor: '#000' }}
    />
  );
}
