'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  getGymSession, completeGymSet, endGymSession, getAdaptiveRecommendation,
  type GymSessionData, type ProgressResult,
} from '@/lib/api';
import type { ExercisePhaseDefinition } from '@fitai/shared';
import { type PoseLandmarks } from '@/lib/pose-detection';
import { createRepCounter } from '@/lib/rep-counter';
import { createRestTimer } from '@/lib/rest-timer';
import { speak } from '@/lib/voice-feedback';
import { checkSafety } from '@/lib/safety-checker';
import { initSmartVoice, speakCoaching, cleanup as cleanupVoice } from '@/lib/smart-voice';
import { requestCoachingFeedback, resetCoachingThrottle } from '@/lib/coaching-client';
import { getJointAngles } from '@/lib/feedback-engine';
import { CameraView } from '@/components/workout/CameraView';
import { FeedbackOverlay } from '@/components/workout/FeedbackOverlay';
import { CoachingBubble } from '@/components/workout/CoachingBubble';
import { RepCounter } from '@/components/gym/RepCounter';
import { SetTracker } from '@/components/gym/SetTracker';
import { ExerciseInstructions } from '@/components/gym/ExerciseInstructions';
import { RestTimerOverlay } from '@/components/gym/RestTimerOverlay';
import { GymWorkoutSummary } from '@/components/gym/GymWorkoutSummary';
import { XPGainedOverlay } from '@/components/workout/XPGainedOverlay';
import type { PoseFeedback } from '@/lib/feedback-engine';

export default function GymSessionPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<GymSessionData | null>(null);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [completedReps, setCompletedReps] = useState(0);
  const [feedback, setFeedback] = useState<PoseFeedback | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTotal, setRestTotal] = useState(90);
  const [isFinished, setIsFinished] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [progressResult, setProgressResult] = useState<ProgressResult | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [coachingMsg, setCoachingMsg] = useState<string | null>(null);
  const [coachingPriority, setCoachingPriority] = useState<'safety' | 'correction' | 'encouragement' | 'info' | null>(null);

  const repCounterRef = useRef<ReturnType<typeof createRepCounter> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof createRestTimer> | null>(null);
  const repDataRef = useRef<any[]>([]);

  useEffect(() => {
    initSmartVoice();
    resetCoachingThrottle();
    getGymSession(params.sessionId).then((s) => {
      setSession(s);
      setLoading(false);
      if (s.exerciseSets.length > 0) {
        initExercise(s, 0);
      }
    }).catch(console.error);
    return () => cleanupVoice();
  }, [params.sessionId]);

  function initExercise(s: GymSessionData, setIdx: number) {
    const set = s.exerciseSets[setIdx];
    if (!set) return;
    const phases = set.exercise.phases as ExercisePhaseDefinition[];
    repCounterRef.current = createRepCounter(phases);
    setCompletedReps(0);
    setPhaseIndex(0);
    repDataRef.current = [];

    // Fetch recommendation
    getAdaptiveRecommendation(set.exerciseId)
      .then((r) => setRecommendation(r.reasonCs))
      .catch(() => setRecommendation(null));
  }

  const handlePoseDetected = useCallback((landmarks: PoseLandmarks) => {
    if (!repCounterRef.current || isResting || isFinished) return;

    // Safety check FIRST
    const exerciseName = session?.exerciseSets[currentSetIdx]?.exercise?.nameCs || '';
    const safetyAlerts = checkSafety(landmarks, exerciseName);
    if (safetyAlerts.length > 0) {
      const critical = safetyAlerts.find((a) => a.severity === 'critical');
      if (critical) {
        speakCoaching(critical.messageCs, 'safety');
        setCoachingMsg(critical.messageCs);
        setCoachingPriority('safety');
      }
    }

    const result = repCounterRef.current.processFrame(landmarks, Date.now());
    setFeedback(result.feedback);
    setPhaseIndex(result.phaseIndex);
    setCompletedReps(result.completedReps);

    if (result.repJustCompleted) {
      speakCoaching(`${result.completedReps}`, 'info');
      if (result.lastRepData) repDataRef.current.push(result.lastRepData);

      // Request AI coaching on rep completion
      const sid = session?.id;
      const set = session?.exerciseSets[currentSetIdx];
      if (sid && set) {
        const angles = getJointAngles(landmarks);
        requestCoachingFeedback({
          sessionType: 'gym',
          sessionId: sid,
          exerciseName: set.exercise.nameCs,
          currentPhase: result.currentPhase.nameCs,
          formScore: result.formScore,
          repCount: result.completedReps,
          targetReps: set.targetReps,
          jointAngles: angles.map((a) => ({ joint: a.joint, angle: Math.round(a.angle) })),
          recentErrors: result.feedback.errors,
        }).then((res) => {
          if (res) {
            setCoachingMsg(res.message);
            setCoachingPriority(res.priority);
            speakCoaching(res.message, res.priority, res.audioBase64);
          }
        });
      }

      // Check if set is complete
      if (set && result.completedReps >= set.targetReps) {
        handleSetComplete();
      }
    }
  }, [session, currentSetIdx, isResting, isFinished]);

  async function handleSetComplete() {
    if (!session) return;
    const set = session.exerciseSets[currentSetIdx];
    const reps = repCounterRef.current?.getState().completedReps ?? 0;
    const avgForm = repDataRef.current.length
      ? repDataRef.current.reduce((s, r) => s + r.formScore, 0) / repDataRef.current.length
      : 0;

    speak('Set hotový!');

    // Save to backend
    await completeGymSet(session.id, {
      setId: set.id,
      actualReps: reps,
      actualWeight: set.targetWeight ?? undefined,
      formScore: Math.round(avgForm),
      repData: repDataRef.current,
    }).catch(console.error);

    // Check if more sets
    const nextIdx = currentSetIdx + 1;
    if (nextIdx >= session.exerciseSets.length) {
      handleEndSession();
      return;
    }

    // Start rest timer
    const nextSet = session.exerciseSets[nextIdx];
    const restSeconds = 90; // Default
    setRestTotal(restSeconds);
    setIsResting(true);

    restTimerRef.current = createRestTimer(restSeconds, {
      onTick: (r) => setRestRemaining(r),
      onComplete: () => {
        setIsResting(false);
        setCurrentSetIdx(nextIdx);
        initExercise(session, nextIdx);
        speak(`${nextSet.exercise.nameCs}, set ${nextSet.setNumber}`);
      },
    }, true);
    restTimerRef.current.start();
  }

  async function handleEndSession() {
    if (!session) return;
    try {
      const result = await endGymSession(session.id);
      setProgressResult(result.progress);
      setShowXP(true);
    } catch {
      setIsFinished(true);
    }
  }

  function handleSkipRest() {
    restTimerRef.current?.cancel();
    setIsResting(false);
    const nextIdx = currentSetIdx + 1;
    if (session && nextIdx < session.exerciseSets.length) {
      setCurrentSetIdx(nextIdx);
      initExercise(session, nextIdx);
    }
  }

  if (loading || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]"><p className="text-gray-500">Načítání tréninku...</p></div>;
  }

  const currentSet = session.exerciseSets[currentSetIdx];
  const currentExercise = currentSet?.exercise;
  const phases = (currentExercise?.phases || []) as ExercisePhaseDefinition[];
  const completedSetsCount = session.exerciseSets.filter((_, i) => i < currentSetIdx).length;

  // Group sets by exercise for set tracker
  const exerciseSets = session.exerciseSets.filter((s) => s.exerciseId === currentSet?.exerciseId);
  const exerciseSetIdx = exerciseSets.findIndex((s) => s.id === currentSet?.id);

  const skeletonColor = feedback && !feedback.isCorrect && feedback.currentPoseName
    ? 'rgba(255,0,0,0.8)' : 'rgba(0,255,0,0.8)';

  // Summary data
  const exerciseSummary = () => {
    const groups = new Map<string, { name: string; sets: number; reps: number; formScores: number[] }>();
    for (const s of session.exerciseSets) {
      const key = s.exerciseId;
      const g = groups.get(key) || { name: s.exercise.nameCs, sets: 0, reps: 0, formScores: [] };
      if (s.status === 'COMPLETED') {
        g.sets++;
        g.reps += s.actualReps;
        g.formScores.push(s.formScore);
      }
      groups.set(key, g);
    }
    return Array.from(groups.values()).map((g) => ({
      name: g.name,
      sets: g.sets,
      totalReps: g.reps,
      avgFormScore: g.formScores.length ? g.formScores.reduce((a, b) => a + b, 0) / g.formScores.length : 0,
    }));
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] lg:flex-row">
      {/* Left: Instructions */}
      <div className="h-1/2 w-full overflow-y-auto lg:h-full lg:w-1/2">
        {currentExercise && (
          <ExerciseInstructions
            exerciseName={currentExercise.nameCs}
            muscleGroups={currentExercise.muscleGroups}
            phases={phases}
            currentPhaseIndex={phaseIndex}
            targetSets={exerciseSets.length}
            completedSets={exerciseSetIdx}
            currentSet={exerciseSetIdx}
            targetReps={currentSet.targetReps}
            completedReps={completedReps}
            weight={currentSet.targetWeight}
            recommendation={recommendation}
          />
        )}
      </div>

      {/* Right: Camera */}
      <div className="relative h-1/2 w-full lg:h-full lg:w-1/2">
        <CameraView
          onPoseDetected={handlePoseDetected}
          active={!isResting && !isFinished}
          skeletonColor={skeletonColor}
        />

        {/* Rep counter overlay */}
        <div className="absolute right-4 top-4 z-10">
          <RepCounter current={completedReps} target={currentSet?.targetReps ?? 0} />
        </div>

        {/* Set tracker */}
        <div className="absolute left-4 top-4 z-10">
          <SetTracker
            totalSets={exerciseSets.length}
            completedSets={exerciseSetIdx}
            currentSet={exerciseSetIdx}
          />
        </div>

        <FeedbackOverlay feedback={feedback} />
        <CoachingBubble message={coachingMsg} priority={coachingPriority} />

        {/* Manual set complete button */}
        <button
          onClick={handleSetComplete}
          className="absolute bottom-4 right-4 z-10 rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Set hotový
        </button>
      </div>

      {/* Rest timer */}
      {isResting && currentSetIdx + 1 < session.exerciseSets.length && (
        <RestTimerOverlay
          remaining={restRemaining}
          total={restTotal}
          nextExerciseName={session.exerciseSets[currentSetIdx + 1]?.exercise.nameCs ?? ''}
          nextSetNumber={session.exerciseSets[currentSetIdx + 1]?.setNumber ?? 0}
          onSkip={handleSkipRest}
        />
      )}

      {/* XP overlay */}
      {showXP && progressResult && (
        <XPGainedOverlay
          progress={progressResult}
          onComplete={() => { setShowXP(false); setIsFinished(true); }}
        />
      )}

      {/* Summary */}
      {isFinished && progressResult && (
        <GymWorkoutSummary
          durationSeconds={Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)}
          totalReps={session.exerciseSets.reduce((s, set) => s + set.actualReps, 0)}
          avgFormScore={session.averageFormScore}
          exercises={exerciseSummary()}
          progress={progressResult}
        />
      )}
    </div>
  );
}
