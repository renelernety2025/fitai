export interface UserData {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    level: string;
    isAdmin: boolean;
    createdAt: string;
}
export interface AuthResponse {
    user: UserData;
    accessToken: string;
}
export interface VideoData {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    durationSeconds: number;
    thumbnailUrl: string;
    hlsUrl: string | null;
    s3RawKey: string;
    choreographyUrl: string | null;
    preprocessingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    preprocessingError: string | null;
    isPublished: boolean;
    createdAt: string;
}
export interface PreprocessingStatusData {
    id: string;
    preprocessingStatus: string;
    preprocessingError: string | null;
    preprocessingJobId: string | null;
    choreographyUrl: string | null;
}
export declare function authLogin(email: string, password: string): Promise<AuthResponse>;
export declare function authRegister(data: {
    email: string;
    password: string;
    name: string;
    level?: string;
}): Promise<AuthResponse>;
export declare function authMe(): Promise<UserData>;
export declare function getVideos(filters?: {
    category?: string;
    difficulty?: string;
}): Promise<VideoData[]>;
export declare function getVideo(id: string): Promise<VideoData>;
export declare function getUploadUrl(filename: string, contentType: string): Promise<{
    uploadUrl: string;
    s3Key: string;
}>;
export interface SessionData {
    id: string;
    userId: string;
    videoId: string;
    startedAt: string;
    completedAt: string | null;
    durationSeconds: number;
    accuracyScore: number;
    video?: {
        title: string;
        category: string;
        thumbnailUrl: string;
    };
}
export interface ProgressResult {
    xpGained: number;
    totalXP: number;
    currentStreak: number;
    levelUp: boolean;
    levelName: string;
}
export interface StatsData {
    totalSessions: number;
    totalMinutes: number;
    averageAccuracy: number;
    currentStreak: number;
    longestStreak: number;
    totalXP: number;
    levelName: string;
    levelNumber: number;
    weeklyActivity: {
        date: string;
        minutes: number;
    }[];
}
export interface ReminderData {
    shouldRemind: boolean;
    daysSinceLastWorkout: number | null;
    message: string;
}
export declare function startSession(videoId: string): Promise<SessionData>;
export declare function endSession(sessionId: string, data: {
    durationSeconds: number;
    accuracyScore: number;
}): Promise<{
    session: SessionData;
    progress: ProgressResult;
}>;
export declare function savePoseSnapshot(sessionId: string, data: {
    timestamp: number;
    poseName: string;
    isCorrect: boolean;
    errorMessage?: string;
    jointAngles: Record<string, number>;
}): Promise<any>;
export declare function getMySessions(): Promise<SessionData[]>;
export declare function getMyStats(): Promise<StatsData>;
export declare function getReminderStatus(): Promise<ReminderData>;
export declare function createVideo(dto: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    durationSeconds: number;
    thumbnailUrl: string;
    s3RawKey: string;
}): Promise<VideoData>;
export declare function getAdminVideos(): Promise<VideoData[]>;
export declare function publishVideo(id: string): Promise<VideoData>;
export declare function deleteVideo(id: string): Promise<void>;
export declare function startPreprocessing(videoId: string): Promise<{
    jobId: string;
    status: string;
    message: string;
}>;
export declare function getPreprocessingStatus(videoId: string): Promise<PreprocessingStatusData>;
export declare function reprocessVideo(videoId: string): Promise<{
    jobId: string;
    status: string;
    message: string;
}>;
export interface ExerciseData {
    id: string;
    name: string;
    nameCs: string;
    description: string;
    descriptionCs: string;
    muscleGroups: string[];
    difficulty: string;
    phases: any[];
    thumbnailUrl: string | null;
}
export declare function getExercises(filters?: {
    muscleGroup?: string;
    difficulty?: string;
}): Promise<ExerciseData[]>;
export declare function getExercise(id: string): Promise<ExerciseData>;
export interface WorkoutPlanData {
    id: string;
    name: string;
    nameCs: string;
    description: string;
    type: string;
    difficulty: string;
    isTemplate: boolean;
    daysPerWeek: number;
    days: {
        id: string;
        dayIndex: number;
        name: string;
        nameCs: string;
        plannedExercises: {
            id: string;
            exerciseId: string;
            orderIndex: number;
            targetSets: number;
            targetReps: number;
            targetWeight: number | null;
            restSeconds: number;
            exercise: {
                id: string;
                name: string;
                nameCs: string;
                muscleGroups: string[];
            };
        }[];
    }[];
}
export declare function getWorkoutPlans(): Promise<WorkoutPlanData[]>;
export declare function getWorkoutPlan(id: string): Promise<WorkoutPlanData>;
export declare function cloneWorkoutPlan(id: string): Promise<WorkoutPlanData>;
export interface GymSessionData {
    id: string;
    userId: string;
    workoutPlanId: string | null;
    startedAt: string;
    completedAt: string | null;
    totalReps: number;
    averageFormScore: number;
    durationSeconds: number;
    exerciseSets: {
        id: string;
        exerciseId: string;
        setNumber: number;
        targetReps: number;
        actualReps: number;
        targetWeight: number | null;
        actualWeight: number | null;
        formScore: number;
        status: string;
        exercise: ExerciseData;
    }[];
}
export declare function startGymSession(data: {
    workoutPlanId?: string;
    workoutDayIndex?: number;
    adHocExercises?: {
        exerciseId: string;
        targetSets: number;
        targetReps: number;
        targetWeight?: number;
    }[];
}): Promise<GymSessionData>;
export declare function getGymSession(id: string): Promise<GymSessionData>;
export declare function completeGymSet(sessionId: string, data: {
    setId: string;
    actualReps: number;
    actualWeight?: number;
    formScore: number;
    repData?: any;
}): Promise<any>;
export declare function endGymSession(sessionId: string): Promise<{
    session: GymSessionData;
    progress: ProgressResult;
    totalReps: number;
    avgForm: number;
}>;
export declare function getAdaptiveRecommendation(exerciseId: string): Promise<{
    exerciseId: string;
    currentWeight: number | null;
    recommendedWeight: number | null;
    reasonCs: string;
}>;
export interface FitnessProfileData {
    id: string;
    userId: string;
    goal: string;
    experienceMonths: number;
    daysPerWeek: number;
    sessionMinutes: number;
    hasGymAccess: boolean;
    equipment: string[];
    injuries: string[];
    notes: string | null;
}
export interface AsymmetryReport {
    asymmetries: {
        joint: string;
        count: number;
        recommendation: string;
    }[];
    fatigue: {
        earlySetAvgForm: number;
        lateSetAvgForm: number;
        dropPercentage: number;
        recommendation: string;
    };
}
export interface BreakRecovery {
    daysSinceLastWorkout: number;
    intensityMultiplier: number;
    message: string;
}
export declare function getFitnessProfile(): Promise<FitnessProfileData>;
export declare function updateFitnessProfile(data: Partial<FitnessProfileData>): Promise<FitnessProfileData>;
export declare function generateAIPlan(): Promise<WorkoutPlanData>;
export declare function getBreakRecovery(): Promise<BreakRecovery | null>;
export declare function getAsymmetryReport(): Promise<AsymmetryReport>;
export declare function getHomeAlternative(): Promise<{
    message: string;
    exercises: any[];
}>;
//# sourceMappingURL=api.d.ts.map