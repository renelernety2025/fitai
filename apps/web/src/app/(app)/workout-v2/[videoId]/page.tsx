'use client';

/**
 * Video workout with pose detection (v2 reskin).
 * IMPORTANT: 1:1 logic from /workout/[videoId]/page.tsx.
 * Only chrome reskin (loading + pre-start hero).
 * Pose pipeline / safety / coaching untouched.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getVideo,
  startSession,
  endSession,
  savePoseSnapshot,
  type VideoData,
  type ProgressResult,
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

export default function WorkoutV2Page({ params }: { params: { videoId: string } }) {
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
  const [coachingPriority, setCoachingPriority] = useState<
    'safety' | 'correction' | 'encouragement' | 'info' | null
  >(null);

  const previousFeedbackRef = useRef<PoseFeedback | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const lastSnapTimeRef = useRef(0);

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
      const snapSid = sessionIdRef.current;
      if (snapSid && currentTime - lastSnapTimeRef.current >= 10 && checkpoint) {
        lastSnapTimeRef.current = currentTime;
        const angles = getJointAngles(landmarks);
        const angleObj: Record<string, number> = {};
        angles.forEach((a) => {
          angleObj[a.joint] = Math.round(a.angle);
        });
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
      } catch {
        setShowSummary(true);
      }
    } else {
      setShowSummary(true);
    }
  };

  useEffect(() => {
    return () => cleanupVoice();
  }, []);

  const skeletonColor =
    currentFeedback && !currentFeedback.isCorrect && currentFeedback.currentPoseName
      ? 'rgba(255,55,95,0.9)'
      : 'rgba(168,255,0,0.9)';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-[#FF375F]">
        Video nenalezeno
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(255, 55, 95, 0.10) 0%, rgba(0, 0, 0, 1) 60%)',
          }}
        />
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {video.category} · {Math.floor(video.durationSeconds / 60)} min · {video.difficulty}
        </div>
        <h1
          className="mb-12 max-w-3xl font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          {video.title}
        </h1>

        <div className="mb-12 max-w-md border-t border-white/10 pt-8">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Příprava
          </div>
          <p className="text-sm leading-relaxed text-white/60">
            Umísti telefon nebo počítač před sebe tak, aby bylo vidět celé tělo. Ujisti se, že máš
            dostatek prostoru.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="group inline-flex items-center gap-3 rounded-full bg-white px-12 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105"
        >
          Začít cvičit
          <span className="transition group-hover:translate-x-1">→</span>
        </button>
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
    <div className="flex h-screen flex-col bg-black lg:flex-row">
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
          onComplete={() => {
            setShowXP(false);
            setShowSummary(true);
          }}
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
