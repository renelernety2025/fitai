'use client';

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string | null;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

const FALLBACK_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ hlsUrl, onTimeUpdate, onEnded, autoPlay }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [playing, setPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const src = hlsUrl || FALLBACK_URL;

      if (src.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else {
        video.src = src;
      }
    }, [hlsUrl]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTime = () => {
        onTimeUpdate?.(Math.floor(video.currentTime));
      };
      const handlePlay = () => setPlaying(true);
      const handlePause = () => setPlaying(false);
      const handleEnded = () => {
        setPlaying(false);
        onEnded?.();
      };

      video.addEventListener('timeupdate', handleTime);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTime);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
      };
    }, [onTimeUpdate, onEnded]);

    useEffect(() => {
      if (autoPlay && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, [autoPlay]);

    function togglePlay() {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) video.play();
      else video.pause();
    }

    return (
      <div className="relative h-full w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          playsInline
          onClick={togglePlay}
        />
        <button
          onClick={togglePlay}
          className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/70"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    );
  },
);
