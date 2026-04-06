'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getVideo, startSession, endSession, savePoseSnapshot,
  type VideoData, type ProgressResult,
} from '@/lib/api';
import { loadChoreography, getCurrentCheckpoint } from '@/lib/choreography';
import { checkPose, getJointAngles, type PoseFeedback } from '@/lib/feedback-engine';
import { giveFeedback } from '@/lib/voice-feedback';
import { type PoseLandmarks } from '@/lib/pose-detection';
import { checkSafety } from '@/lib/safety-checker';
import { initSmartVoice, speakCoaching, cleanup as cleanupVoice } from '@/lib/smart-voice';
import { requestCoachingFeedback, resetCoachingThrottle } from '@/lib/coaching-client';
import type { ChoreographyJson } from '@fitai/shared';
import { VideoPlayer, type VideoPlayerHandle } from '@/components/workout/VideoPlayer';
import { CameraView } from '@/components/workout/CameraView';
import { FeedbackOverlay } from '@/components/workout/FeedbackOverlay';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';
import { XPGainedOverlay } from '@/components/workout/XPGainedOverlay';
import { CoachingBubble } from '@/components/workout/CoachingBubble';

export default function WorkoutPage({ params }: { params: { videoId: string } }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [choreography, setChoreography] = useState<ChoreographyJson | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState<PoseFeedback | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [progressResult, setProgressResult] = useState<ProgressResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [coachingMsg, setCoachingMsg] = useState<string | null>(null);
  const [coachingPriority, setCoachingPriority] = useState<'safety' | 'correction' | 'encouragement' | 'info' | null>(null);

  const previousFeedbackRef = useRef<PoseFeedback | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const lastSnapTimeRef = useRef(0);

  // Stats tracking
  const scoresRef = useRef<number[]>([]);
  const correctPosesRef = useRef(0);
  const totalPosesRef = useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const v = await getVideo(params.videoId);
        setVideo(v);
        const c = await loadChoreography(v.choreographyUrl ?? null);
        setChoreography(c);
      } catch (err) {
        console.error('Failed to load video:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.videoId]);

  const handleTimeUpdate = useCallback((seconds: number) => {
    setCurrentTime(seconds);
  }, []);

  const handlePoseDetected = useCallback(
    (landmarks: PoseLandmarks) => {
      const checkpoint = getCurrentCheckpoint(choreography, currentTime);
      const feedback = checkPose(landmarks, checkpoint);
      setCurrentFeedback(feedback);

      if (checkpoint) {
        scoresRef.current.push(feedback.score);
        totalPosesRef.current++;
        if (feedback.isCorrect) correctPosesRef.current++;
      }

      // Safety check
      const safetyAlerts = checkSafety(landmarks, feedback.currentPoseName || video?.title || '');
      if (safetyAlerts.length > 0) {
        const critical = safetyAlerts.find((a) => a.severity === 'critical');
        if (critical) {
          speakCoaching(critical.messageCs, 'safety');
          setCoachingMsg(critical.messageCs);
          setCoachingPriority('safety');
        }
      }

      giveFeedback(feedback, previousFeedbackRef.current);
      previousFeedbackRef.current = feedback;

      // Request AI coaching feedback periodically
      const sid = sessionIdRef.current;
      if (sid && checkpoint) {
        const angles = getJointAngles(landmarks);
        requestCoachingFeedback({
          sessionType: 'video',
          sessionId: sid,
          exerciseName: checkpoint.name || video?.title || '',
          currentPhase: checkpoint.name || '',
          formScore: feedback.score,
          repCount: 0,
          targetReps: 0,
          jointAngles: angles.map((a) => ({ joint: a.joint, angle: Math.round(a.angle) })),
          recentErrors: feedback.errors,
        }).then((res) => {
          if (res) {
            setCoachingMsg(res.message);
            setCoachingPriority(res.priority);
            speakCoaching(res.message, res.priority, res.audioBase64);
          }
        });
      }

      // Save snapshot every 10 seconds
      const snapSid = sessionIdRef.current;
      if (snapSid && currentTime - lastSnapTimeRef.current >= 10 && checkpoint) {
        lastSnapTimeRef.current = currentTime;
        const angles = getJointAngles(landmarks);
        const angleObj: Record<string, number> = {};
        angles.forEach((a) => { angleObj[a.joint] = Math.round(a.angle); });
        savePoseSnapshot(snapSid, {
          timestamp: currentTime,
          poseName: feedback.currentPoseName || 'unknown',
          isCorrect: feedback.isCorrect,
          errorMessage: feedback.errors[0],
          jointAngles: angleObj,
        }).catch(() => {});
      }
    },
    [choreography, currentTime],
  );

  const handleStart = async () => {
    setIsStarted(true);
    sessionStartRef.current = new Date();
    initSmartVoice();
    resetCoachingThrottle();
    try {
      const session = await startSession(params.videoId);
      sessionIdRef.current = session.id;
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const handleVideoEnded = async () => {
    const elapsed = sessionStartRef.current
      ? Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000)
      : 0;
    const avgScore =
      scoresRef.current.length > 0
        ? Math.round(scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length)
        : 100;

    if (sessionIdRef.current) {
      try {
        const result = await endSession(sessionIdRef.current, {
          durationSeconds: elapsed,
          accuracyScore: avgScore,
        });
        setProgressResult(result.progress);
        setShowXP(true);
      } catch (err) {
        console.error('Failed to end session:', err);
        setShowSummary(true);
      }
    } else {
      setShowSummary(true);
    }
  };

  // Cleanup smart voice on unmount
  useEffect(() => {
    return () => cleanupVoice();
  }, []);

  const skeletonColor =
    currentFeedback && !currentFeedback.isCorrect && currentFeedback.currentPoseName
      ? 'rgba(255,0,0,0.8)'
      : 'rgba(0,255,0,0.8)';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-500">Načítání...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <p className="text-red-400">Video nenalezeno</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="max-w-lg text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">{video.title}</h1>
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
              {Math.floor(video.durationSeconds / 60)} min
            </span>
            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
              {video.difficulty}
            </span>
          </div>
          <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="mb-2 text-sm font-medium text-gray-300">Příprava</p>
            <p className="text-sm leading-relaxed text-gray-400">
              Umístěte telefon nebo počítač před sebe tak, aby bylo vidět celé
              vaše tělo. Ujistěte se, že máte dostatek prostoru na cvičení.
            </p>
          </div>
          <p className="mb-6 text-xs text-gray-600 sm:hidden">
            Pro nejlepší zážitek otočte telefon na šířku.
          </p>
          <button
            onClick={handleStart}
            className="rounded-xl bg-[#16a34a] px-10 py-4 text-lg font-bold text-white transition hover:bg-green-700"
          >
            Začít cvičit
          </button>
        </div>
      </div>
    );
  }

  const elapsed = sessionStartRef.current
    ? Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000)
    : 0;
  const avgScore =
    scoresRef.current.length > 0
      ? scoresRef.current.reduce((a, b) => a + b, 0) / scoresRef.current.length
      : 100;

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] lg:flex-row">
      <div className="relative h-1/2 w-full lg:h-full lg:w-[60%]">
        <VideoPlayer
          ref={playerRef}
          hlsUrl={video.hlsUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          autoPlay
        />
      </div>

      <div className="relative h-1/2 w-full lg:h-full lg:w-[40%]">
        <CameraView
          onPoseDetected={handlePoseDetected}
          active={isStarted}
          skeletonColor={skeletonColor}
        />
        <FeedbackOverlay feedback={currentFeedback} />
        <CoachingBubble message={coachingMsg} priority={coachingPriority} />
      </div>

      {showXP && progressResult && (
        <XPGainedOverlay
          progress={progressResult}
          onComplete={() => { setShowXP(false); setShowSummary(true); }}
        />
      )}

      {showSummary && (
        <WorkoutSummary
          durationSeconds={elapsed}
          averageScore={avgScore}
          correctPoses={correctPosesRef.current}
          totalPoses={totalPosesRef.current}
        />
      )}
    </div>
  );
}
