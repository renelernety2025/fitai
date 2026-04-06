'use client';

import { useRef, useEffect, useState } from 'react';
import { initPose, stopPose, type PoseLandmarks } from '@/lib/pose-detection';

interface CameraViewProps {
  onPoseDetected: (landmarks: PoseLandmarks) => void;
  active: boolean;
  skeletonColor?: string;
}

export function CameraView({ onPoseDetected, active, skeletonColor }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function start() {
      try {
        setStatus('loading');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        await initPose(video, canvasRef.current!, onPoseDetected, {
          color: skeletonColor,
        });

        if (!cancelled) setStatus('ready');
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'Přístup ke kameře byl zamítnut. Povolte kameru v nastavení prohlížeče.'
              : `Chyba kamery: ${err.message}`,
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      stopPose();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [active]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-900">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <p className="text-sm text-gray-300">Načítám AI model...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 p-4">
          <p className="text-center text-sm text-red-400">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
