-- Required for the vector(1536) embedding columns below.
-- (HNSW partial indexes exist in production but were created via raw SQL
--  outside the Prisma schema; they are perf-only and not part of this baseline.)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('YOGA', 'PILATES', 'STRENGTH', 'CARDIO', 'MOBILITY');

-- CreateEnum
CREATE TYPE "VideoDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PreprocessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'CORE', 'FULL_BODY');

-- CreateEnum
CREATE TYPE "WorkoutPlanType" AS ENUM ('PUSH_PULL_LEGS', 'UPPER_LOWER', 'FULL_BODY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SetStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "JournalMood" AS ENUM ('GREAT', 'GOOD', 'NEUTRAL', 'TIRED', 'BAD');

-- CreateEnum
CREATE TYPE "CoachPersonality" AS ENUM ('DRILL', 'CHILL', 'MOTIVATIONAL');

-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'WEIGHT_LOSS', 'GENERAL_FITNESS', 'MOBILITY');

-- CreateEnum
CREATE TYPE "LeagueTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND');

-- CreateEnum
CREATE TYPE "PhotoSide" AS ENUM ('FRONT', 'SIDE', 'BACK');

-- CreateEnum
CREATE TYPE "WorkoutMode" AS ENUM ('CRUISE', 'SPORT', 'TRACK');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('FRESH', 'DUE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CoachingCategory" AS ENUM ('FORM', 'TECHNIQUE', 'RECOVERY', 'NUTRITION', 'MINDSET');

-- CreateEnum
CREATE TYPE "DuelType" AS ENUM ('MAX_REPS', 'HEAVIEST_LIFT', 'LONGEST_HOLD', 'FASTEST_DISTANCE');

-- CreateEnum
CREATE TYPE "DuelDuration" AS ENUM ('HOUR_1', 'HOUR_6', 'HOUR_24', 'HOUR_48', 'WEEK');

-- CreateEnum
CREATE TYPE "DuelStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SupplementCategory" AS ENUM ('PROTEIN', 'CREATINE', 'PRE_WORKOUT', 'VITAMIN', 'AMINO', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplementTiming" AS ENUM ('MORNING', 'PRE_WORKOUT', 'DURING', 'POST_WORKOUT', 'EVENING', 'WITH_MEAL');

-- CreateEnum
CREATE TYPE "GearCategory" AS ENUM ('SHOES', 'BELT', 'GLOVES', 'WRAPS', 'CLOTHING', 'EQUIPMENT', 'OTHER_GEAR');

-- CreateEnum
CREATE TYPE "ExperienceCategory" AS ENUM ('GROUP', 'OUTDOOR', 'WELLNESS', 'COMBAT', 'ADVENTURE', 'NUTRITION_WORKSHOP');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKING_PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'BOOKING_COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "RoutineItemType" AS ENUM ('SUPPLEMENT_ITEM', 'WORKOUT_ITEM', 'MEAL_ITEM', 'RECOVERY_ITEM', 'CUSTOM_ITEM');

-- CreateEnum
CREATE TYPE "RoutineTime" AS ENUM ('RT_MORNING', 'RT_PRE_WORKOUT', 'RT_DURING', 'RT_POST_WORKOUT', 'RT_EVENING', 'RT_NIGHT');

-- CreateEnum
CREATE TYPE "WishlistItemType" AS ENUM ('WISH_EXERCISE', 'WISH_PLAN', 'WISH_RECIPE', 'WISH_EXPERIENCE', 'WISH_BUNDLE', 'WISH_CLIP');

-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('TRIAL_ACTIVE', 'TRIAL_COMPLETED', 'TRIAL_CONVERTED', 'TRIAL_DISMISSED');

-- CreateEnum
CREATE TYPE "DropCategory" AS ENUM ('DROP_WORKOUT_PLAN', 'DROP_CHALLENGE', 'DROP_BOSS_FIGHT', 'DROP_BADGE', 'DROP_EXPERIENCE');

-- CreateEnum
CREATE TYPE "VIPTier" AS ENUM ('GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('TEXT', 'PHOTO', 'AUTO_CARD');

-- CreateEnum
CREATE TYPE "TrendingPeriod" AS ENUM ('H24', 'D7');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('NONE', 'CREATOR', 'VERIFIED');

-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('FEATURE_DISCOVERY', 'UPGRADE', 'CHALLENGE', 'CONTENT');

-- CreateEnum
CREATE TYPE "PromoAudience" AS ENUM ('ALL', 'FREE_TIER', 'NO_STREAK', 'NEW_USER', 'NO_MEAL_PLAN', 'NO_JOURNAL');

-- CreateEnum
CREATE TYPE "SocialNotificationType" AS ENUM ('NEW_FOLLOWER', 'POST_LIKED', 'POST_COMMENTED', 'CHALLENGE_INVITE', 'CHALLENGE_COMPLETED', 'SQUAD_PR', 'BUDDY_WORKOUT', 'SUBSCRIBER_NEW', 'TIP_RECEIVED', 'POST_MILESTONE', 'STREAK_BUDDY');

-- CreateEnum
CREATE TYPE "ContentReportTargetType" AS ENUM ('POST', 'CLIP', 'POST_COMMENT', 'CLIP_COMMENT', 'USER');

-- CreateEnum
CREATE TYPE "ContentReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'NUDITY', 'VIOLENCE', 'SELF_HARM', 'MISINFORMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentReportStatus" AS ENUM ('PENDING', 'REVIEWED_VALID', 'REVIEWED_INVALID', 'DISMISSED');

-- CreateEnum
CREATE TYPE "CronRunStatus" AS ENUM ('RUNNING', 'OK', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "propsReceived" INTEGER NOT NULL DEFAULT 0,
    "level" "UserLevel" NOT NULL DEFAULT 'BEGINNER',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "expoPushToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "badgeType" "BadgeType" NOT NULL DEFAULT 'NONE',
    "badgeVerifiedAt" TIMESTAMP(3),
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutDate" TIMESTAMP(3),
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalXPSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "VideoCategory" NOT NULL,
    "difficulty" "VideoDifficulty" NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "hlsUrl" TEXT,
    "s3RawKey" TEXT NOT NULL,
    "choreographyUrl" TEXT,
    "preprocessingStatus" "PreprocessingStatus" NOT NULL DEFAULT 'PENDING',
    "preprocessingError" TEXT,
    "preprocessingJobId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT,
    "gymSessionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "accuracyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "poseData" JSONB,
    "embedding" vector(1536),

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoseSnapshot" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "poseName" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "jointAngles" JSONB NOT NULL,

    CONSTRAINT "PoseSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionCs" TEXT NOT NULL,
    "muscleGroups" "MuscleGroup"[],
    "difficulty" "VideoDifficulty" NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'isolation',
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phases" JSONB NOT NULL,
    "instructions" JSONB,
    "thumbnailUrl" TEXT,
    "instructionUrl" TEXT,
    "videoUrl" TEXT,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "nameCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WorkoutPlanType" NOT NULL,
    "difficulty" "VideoDifficulty" NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDay" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameCs" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedExercise" (
    "id" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "restSeconds" INTEGER NOT NULL DEFAULT 90,
    "notes" TEXT,
    "groupId" TEXT,
    "groupType" TEXT,
    "groupOrder" INTEGER,

    CONSTRAINT "PlannedExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "workoutDayIndex" INTEGER,
    "coachPersonality" "CoachPersonality" NOT NULL DEFAULT 'MOTIVATIONAL',
    "workoutMode" "WorkoutMode" NOT NULL DEFAULT 'SPORT',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalReps" INTEGER NOT NULL DEFAULT 0,
    "averageFormScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GymSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSet" (
    "id" TEXT NOT NULL,
    "gymSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "actualReps" INTEGER NOT NULL DEFAULT 0,
    "targetWeight" DOUBLE PRECISION,
    "actualWeight" DOUBLE PRECISION,
    "formScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rpe" INTEGER,
    "isWarmup" BOOLEAN NOT NULL DEFAULT false,
    "tempoSeconds" DOUBLE PRECISION,
    "status" "SetStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "repData" JSONB,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyVolume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "totalSets" INTEGER NOT NULL DEFAULT 0,
    "totalReps" INTEGER NOT NULL DEFAULT 0,
    "totalVolumeKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bestWeight" DOUBLE PRECISION,
    "bestReps" INTEGER NOT NULL,
    "avgFormScore" DOUBLE PRECISION NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ExerciseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingMessage" (
    "id" TEXT NOT NULL,
    "coachingSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "jointName" TEXT NOT NULL,
    "measuredAngle" DOUBLE PRECISION NOT NULL,
    "safeMin" DOUBLE PRECISION NOT NULL,
    "safeMax" DOUBLE PRECISION NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "gymSessionId" TEXT,
    "notes" TEXT,
    "rating" INTEGER,
    "mood" "JournalMood",
    "tags" TEXT[],
    "measurements" JSONB,
    "aiInsight" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalPhoto" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" "FitnessGoal" NOT NULL DEFAULT 'GENERAL_FITNESS',
    "experienceMonths" INTEGER NOT NULL DEFAULT 0,
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "sessionMinutes" INTEGER NOT NULL DEFAULT 45,
    "hasGymAccess" BOOLEAN NOT NULL DEFAULT true,
    "equipment" TEXT[],
    "injuries" TEXT[],
    "priorityMuscles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dailyKcal" INTEGER,
    "dailyProteinG" INTEGER,
    "dailyCarbsG" INTEGER,
    "dailyFatG" INTEGER,

    CONSTRAINT "FitnessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionCs" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "threshold" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AchievementUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "hydrationL" DOUBLE PRECISION,
    "steps" INTEGER,
    "mood" INTEGER,
    "energy" INTEGER,
    "soreness" INTEGER,
    "stress" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kcal" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "photoS3Key" TEXT,
    "source" TEXT,
    "sourceDetail" TEXT,
    "ingredients" TEXT,
    "recipeId" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ingredients" JSONB NOT NULL,
    "instructions" TEXT,
    "prepMinutes" INTEGER,
    "cookMinutes" INTEGER,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "kcalPerServing" INTEGER,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "photoS3Key" TEXT,
    "tags" TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "LeagueTier" NOT NULL DEFAULT 'BRONZE',
    "weekStart" DATE NOT NULL,
    "weeklyXP" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "relegated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillCode" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "workoutDayIdx" INTEGER,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "gymSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonMission" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "SeasonMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodworkEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "testType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceMin" DOUBLE PRECISION,
    "referenceMax" DOUBLE PRECISION,
    "lab" TEXT,
    "notes" TEXT,
    "aiInsight" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodworkEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RehabPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "targetDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "aiPlan" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehabPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RehabSession" (
    "id" TEXT NOT NULL,
    "rehabPlanId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "exercises" JSONB NOT NULL,
    "painLevel" INTEGER,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RehabSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakFreeze" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakFreeze_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "planId" TEXT,
    "priceXP" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplacePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "xpPaid" INTEGER NOT NULL,
    "userRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplacePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bossCode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "defeated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BossAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gymName" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "rating" INTEGER NOT NULL,
    "equipment" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GymReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gymSessionId" TEXT,
    "cardData" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gym" TEXT,
    "schedule" TEXT,
    "goals" TEXT,
    "bio" TEXT,
    "lookingFor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddySwipe" (
    "id" TEXT NOT NULL,
    "swiperId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddySwipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Props" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Props_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashChallenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashParticipant" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleCs" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyCs" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 3,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "termCs" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "definitionCs" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneRepMax" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "estimatedKg" DOUBLE PRECISION NOT NULL,
    "testReps" INTEGER NOT NULL,
    "testWeight" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'calculated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneRepMax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGeneratedPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "goal" "FitnessGoal" NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "isDeloadWeek" BOOLEAN NOT NULL DEFAULT false,
    "claudePrompt" TEXT NOT NULL,
    "claudeResponse" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGeneratedPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutReminder" BOOLEAN NOT NULL DEFAULT true,
    "streakWarning" BOOLEAN NOT NULL DEFAULT true,
    "achievements" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" INTEGER NOT NULL DEFAULT 22,
    "quietHoursEnd" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityFeedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityFeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipant" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearableData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "provider" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WearableData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WearableConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WearableConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentImport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "videoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'claude',
    "modelUsed" TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
    "payload" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "side" "PhotoSide" NOT NULL DEFAULT 'FRONT',
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "notes" TEXT,
    "isAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyAnalysis" (
    "id" TEXT NOT NULL,
    "bodyPhotoId" TEXT NOT NULL,
    "estimatedBodyFatPct" DOUBLE PRECISION,
    "estimatedMuscleMass" TEXT,
    "postureNotes" TEXT,
    "visibleStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "areasToWork" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "comparisonNotes" TEXT,
    "rawClaudeResponse" TEXT,
    "modelUsed" TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceItem" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleCs" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "linkedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorTime" (
    "id" TEXT NOT NULL,
    "exerciseSetId" TEXT NOT NULL,
    "eccentricMs" INTEGER NOT NULL,
    "holdMs" INTEGER NOT NULL,
    "concentricMs" INTEGER NOT NULL,
    "totalMs" INTEGER NOT NULL,

    CONSTRAINT "SectorTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "sessionsSinceDeload" INTEGER NOT NULL DEFAULT 0,
    "lastDeloadDate" TIMESTAMP(3),
    "nextRecommendedDate" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'FRESH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insight" TEXT NOT NULL,
    "category" "CoachingCategory" NOT NULL,
    "metricBefore" DOUBLE PRECISION,
    "metricAfter" DOUBLE PRECISION,
    "improvementPct" DOUBLE PRECISION,

    CONSTRAINT "CoachingMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "type" "DuelType" NOT NULL,
    "metric" TEXT NOT NULL,
    "duration" "DuelDuration" NOT NULL,
    "xpBet" INTEGER NOT NULL DEFAULT 0,
    "status" "DuelStatus" NOT NULL DEFAULT 'PENDING',
    "challengerScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "challengedScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "motto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadMembership" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonStreak" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastBothDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" "SupplementCategory" NOT NULL,
    "defaultDosage" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSupplement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "timing" "SupplementTiming" NOT NULL,
    "monthlyCostKc" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementLog" (
    "id" TEXT NOT NULL,
    "userSupplementId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplementLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "GearCategory" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "priceKc" DOUBLE PRECISION,
    "photoS3Key" TEXT,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "maxSessions" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GearItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GearReview" (
    "id" TEXT NOT NULL,
    "gearItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GearReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "thumbnailS3Key" TEXT,
    "durationSeconds" INTEGER NOT NULL,
    "exerciseId" TEXT,
    "tags" TEXT[],
    "caption" TEXT,
    "overlayConfig" JSONB,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" TIMESTAMP(3),
    "hiddenReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipLike" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClipLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipComment" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClipComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuetComparison" (
    "id" TEXT NOT NULL,
    "clipAId" TEXT NOT NULL,
    "clipBId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuetComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "workoutType" TEXT,
    "spotifyUrl" TEXT,
    "appleMusicUrl" TEXT,
    "title" TEXT NOT NULL,
    "bpm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftmanshipStory" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "biomechanics" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "expertQuotes" JSONB NOT NULL DEFAULT '[]',
    "funFacts" TEXT[],
    "scientificReferences" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CraftmanshipStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "certifications" TEXT[],
    "specializations" TEXT[],
    "videoIntroUrl" TEXT,
    "supertrainer" BOOLEAN NOT NULL DEFAULT false,
    "responseRate" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "avgResponseMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerReview" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationLat" DOUBLE PRECISION,
    "locationLng" DOUBLE PRECISION,
    "locationAddress" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "priceXP" INTEGER NOT NULL DEFAULT 0,
    "priceKc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "category" "ExperienceCategory" NOT NULL,
    "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FLEXIBLE',
    "photos" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKING_PENDING',
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "rating" INTEGER,
    "reviewText" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItem" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "type" "RoutineItemType" NOT NULL,
    "timing" "RoutineTime" NOT NULL,
    "referenceId" TEXT,
    "referenceName" TEXT NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "priceXP" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "giftable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundlePurchase" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BundlePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuestCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xpAwarded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuestCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "WishlistItemType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "TrialStatus" NOT NULL DEFAULT 'TRIAL_ACTIVE',
    "convertedToPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalEditions" INTEGER NOT NULL,
    "remainingEditions" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "priceXP" INTEGER NOT NULL DEFAULT 0,
    "exclusiveRewardType" TEXT NOT NULL,
    "exclusiveRewardData" JSONB NOT NULL DEFAULT '{}',
    "category" "DropCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropPurchase" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "VIPTier" NOT NULL DEFAULT 'GOLD',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitedById" TEXT,
    "privileges" TEXT[],

    CONSTRAINT "VIPMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTitle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "earnedCondition" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBrand" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "colorTheme" TEXT,
    "avatarConfig" JSONB,
    "monogram" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessScoreHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,

    CONSTRAINT "FitnessScoreHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaidChallenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entryFeeXP" INTEGER NOT NULL DEFAULT 0,
    "entryFeeKc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potXP" INTEGER NOT NULL DEFAULT 0,
    "potKc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxParticipants" INTEGER NOT NULL DEFAULT 100,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "metric" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "winnerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaidChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaidChallengeEntry" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaidChallengeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "specializations" TEXT[],
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subscriberCount" INTEGER NOT NULL DEFAULT 0,
    "subscriptionPriceXP" INTEGER NOT NULL DEFAULT 500,
    "totalXPEarned" INTEGER NOT NULL DEFAULT 0,
    "monthlyXPEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverUrl" TEXT,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "studentCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedLessons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "adminId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'TEAM',
    "maxMembers" INTEGER NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationChallenge" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metric" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" VARCHAR(2000),
    "type" "PostType" NOT NULL DEFAULT 'TEXT',
    "cardData" JSONB,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isSubscriberOnly" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3),
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenAt" TIMESTAMP(3),
    "hiddenReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPhoto" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHashtag" (
    "postId" TEXT NOT NULL,
    "hashtagId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TrendingSnapshot" (
    "id" TEXT NOT NULL,
    "hashtagId" TEXT NOT NULL,
    "period" "TrendingPeriod" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCard" (
    "id" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "ctaText" TEXT NOT NULL,
    "ctaUrl" TEXT NOT NULL,
    "imageS3Key" TEXT,
    "targetAudience" "PromoAudience" NOT NULL DEFAULT 'ALL',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "PromoCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorSubscription" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "xpPerMonth" INTEGER NOT NULL DEFAULT 500,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CreatorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorTip" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toCreatorId" TEXT NOT NULL,
    "xpAmount" INTEGER NOT NULL,
    "message" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SocialNotificationType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ContentReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reason" "ContentReportReason" NOT NULL,
    "details" VARCHAR(500),
    "status" "ContentReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewerNotes" VARCHAR(500),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronRun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CronRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "error" VARCHAR(2000),

    CONSTRAINT "CronRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_key" ON "UserProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_gymSessionId_key" ON "WorkoutSession"("gymSessionId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_idx" ON "WorkoutSession"("userId");

-- CreateIndex
CREATE INDEX "WorkoutSession_videoId_idx" ON "WorkoutSession"("videoId");

-- CreateIndex
CREATE INDEX "PoseSnapshot_sessionId_idx" ON "PoseSnapshot"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDay_workoutPlanId_dayIndex_key" ON "WorkoutDay"("workoutPlanId", "dayIndex");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedExercise_workoutDayId_orderIndex_key" ON "PlannedExercise"("workoutDayId", "orderIndex");

-- CreateIndex
CREATE INDEX "GymSession_userId_idx" ON "GymSession"("userId");

-- CreateIndex
CREATE INDEX "ExerciseSet_gymSessionId_idx" ON "ExerciseSet"("gymSessionId");

-- CreateIndex
CREATE INDEX "WeeklyVolume_userId_idx" ON "WeeklyVolume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyVolume_userId_weekStart_muscleGroup_key" ON "WeeklyVolume"("userId", "weekStart", "muscleGroup");

-- CreateIndex
CREATE INDEX "ExerciseHistory_userId_exerciseId_idx" ON "ExerciseHistory"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseHistory_userId_date_idx" ON "ExerciseHistory"("userId", "date");

-- CreateIndex
CREATE INDEX "CoachingSession_userId_idx" ON "CoachingSession"("userId");

-- CreateIndex
CREATE INDEX "CoachingMessage_coachingSessionId_idx" ON "CoachingMessage"("coachingSessionId");

-- CreateIndex
CREATE INDEX "SafetyEvent_userId_idx" ON "SafetyEvent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_gymSessionId_key" ON "JournalEntry"("gymSessionId");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_userId_date_key" ON "JournalEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "JournalPhoto_journalEntryId_idx" ON "JournalPhoto"("journalEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessProfile_userId_key" ON "FitnessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "AchievementUnlock_userId_idx" ON "AchievementUnlock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementUnlock_userId_achievementId_key" ON "AchievementUnlock"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "DailyCheckIn_userId_date_idx" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "FoodLog_userId_date_idx" ON "FoodLog"("userId", "date");

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- CreateIndex
CREATE INDEX "LeagueMembership_weekStart_tier_idx" ON "LeagueMembership"("weekStart", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMembership_userId_weekStart_key" ON "LeagueMembership"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "SkillUnlock_userId_idx" ON "SkillUnlock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillUnlock_userId_skillCode_key" ON "SkillUnlock"("userId", "skillCode");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_date_idx" ON "ScheduledWorkout"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonMission_seasonId_code_key" ON "SeasonMission"("seasonId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonProgress_userId_seasonId_key" ON "SeasonProgress"("userId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionCompletion_userId_missionId_key" ON "MissionCompletion"("userId", "missionId");

-- CreateIndex
CREATE INDEX "BloodworkEntry_userId_testType_date_idx" ON "BloodworkEntry"("userId", "testType", "date");

-- CreateIndex
CREATE INDEX "RehabPlan_userId_idx" ON "RehabPlan"("userId");

-- CreateIndex
CREATE INDEX "RehabSession_rehabPlanId_idx" ON "RehabSession"("rehabPlanId");

-- CreateIndex
CREATE INDEX "StreakFreeze_userId_idx" ON "StreakFreeze"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StreakFreeze_userId_usedDate_key" ON "StreakFreeze"("userId", "usedDate");

-- CreateIndex
CREATE INDEX "MarketplaceListing_authorId_idx" ON "MarketplaceListing"("authorId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_type_isPublished_idx" ON "MarketplaceListing"("type", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplacePurchase_userId_listingId_key" ON "MarketplacePurchase"("userId", "listingId");

-- CreateIndex
CREATE INDEX "BossAttempt_userId_bossCode_idx" ON "BossAttempt"("userId", "bossCode");

-- CreateIndex
CREATE INDEX "GymReview_userId_idx" ON "GymReview"("userId");

-- CreateIndex
CREATE INDEX "Story_userId_idx" ON "Story"("userId");

-- CreateIndex
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");

-- CreateIndex
CREATE INDEX "Reaction_targetType_targetId_idx" ON "Reaction"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_targetType_targetId_key" ON "Reaction"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "Comment_feedItemId_idx" ON "Comment"("feedItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyProfile_userId_key" ON "BuddyProfile"("userId");

-- CreateIndex
CREATE INDEX "BuddySwipe_targetId_direction_idx" ON "BuddySwipe"("targetId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "BuddySwipe_swiperId_targetId_key" ON "BuddySwipe"("swiperId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_key" ON "Conversation"("participant1Id", "participant2Id");

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_createdAt_idx" ON "DirectMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Props_toUserId_idx" ON "Props"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashParticipant_challengeId_userId_key" ON "FlashParticipant"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLesson_slug_key" ON "EducationLesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryTerm_termCs_key" ON "GlossaryTerm"("termCs");

-- CreateIndex
CREATE INDEX "OneRepMax_profileId_idx" ON "OneRepMax"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "OneRepMax_profileId_exerciseId_key" ON "OneRepMax"("profileId", "exerciseId");

-- CreateIndex
CREATE INDEX "AIGeneratedPlan_userId_idx" ON "AIGeneratedPlan"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_endpoint_key" ON "PushSubscription"("userId", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followedId_idx" ON "Follow"("followedId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followedId_key" ON "Follow"("followerId", "followedId");

-- CreateIndex
CREATE INDEX "ActivityFeedItem_userId_idx" ON "ActivityFeedItem"("userId");

-- CreateIndex
CREATE INDEX "ActivityFeedItem_createdAt_idx" ON "ActivityFeedItem"("createdAt");

-- CreateIndex
CREATE INDEX "ChallengeParticipant_challengeId_idx" ON "ChallengeParticipant"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipant_challengeId_userId_key" ON "ChallengeParticipant"("challengeId", "userId");

-- CreateIndex
CREATE INDEX "WearableData_userId_dataType_idx" ON "WearableData"("userId", "dataType");

-- CreateIndex
CREATE INDEX "WearableData_userId_sessionId_idx" ON "WearableData"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "WearableConnection_provider_expiresAt_idx" ON "WearableConnection"("provider", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "WearableConnection_userId_provider_key" ON "WearableConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "ContentImport_userId_idx" ON "ContentImport"("userId");

-- CreateIndex
CREATE INDEX "MealPlan_userId_weekStart_idx" ON "MealPlan"("userId", "weekStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_userId_weekStart_key" ON "MealPlan"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "BodyPhoto_userId_takenAt_idx" ON "BodyPhoto"("userId", "takenAt" DESC);

-- CreateIndex
CREATE INDEX "BodyPhoto_userId_side_takenAt_idx" ON "BodyPhoto"("userId", "side", "takenAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "BodyAnalysis_bodyPhotoId_key" ON "BodyAnalysis"("bodyPhotoId");

-- CreateIndex
CREATE INDEX "MarketplaceItem_trainerId_idx" ON "MarketplaceItem"("trainerId");

-- CreateIndex
CREATE INDEX "MarketplaceItem_type_idx" ON "MarketplaceItem"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "SectorTime_exerciseSetId_idx" ON "SectorTime"("exerciseSetId");

-- CreateIndex
CREATE INDEX "MaintenanceSchedule_userId_idx" ON "MaintenanceSchedule"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceSchedule_userId_muscleGroup_key" ON "MaintenanceSchedule"("userId", "muscleGroup");

-- CreateIndex
CREATE INDEX "MaintenanceAlert_userId_isDismissed_idx" ON "MaintenanceAlert"("userId", "isDismissed");

-- CreateIndex
CREATE INDEX "CoachingMemory_userId_exerciseId_idx" ON "CoachingMemory"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "CoachingMemory_userId_date_idx" ON "CoachingMemory"("userId", "date");

-- CreateIndex
CREATE INDEX "Duel_challengerId_status_idx" ON "Duel"("challengerId", "status");

-- CreateIndex
CREATE INDEX "Duel_challengedId_status_idx" ON "Duel"("challengedId", "status");

-- CreateIndex
CREATE INDEX "SquadMembership_userId_idx" ON "SquadMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMembership_squadId_userId_key" ON "SquadMembership"("squadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonStreak_userAId_userBId_key" ON "PersonStreak"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSupplement_userId_supplementId_key" ON "UserSupplement"("userId", "supplementId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplementLog_userSupplementId_date_key" ON "SupplementLog"("userSupplementId", "date");

-- CreateIndex
CREATE INDEX "GearItem_userId_idx" ON "GearItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GearReview_gearItemId_userId_key" ON "GearReview"("gearItemId", "userId");

-- CreateIndex
CREATE INDEX "Clip_userId_idx" ON "Clip"("userId");

-- CreateIndex
CREATE INDEX "Clip_createdAt_idx" ON "Clip"("createdAt");

-- CreateIndex
CREATE INDEX "Clip_isHidden_idx" ON "Clip"("isHidden");

-- CreateIndex
CREATE UNIQUE INDEX "ClipLike_clipId_userId_key" ON "ClipLike"("clipId", "userId");

-- CreateIndex
CREATE INDEX "ClipComment_clipId_createdAt_idx" ON "ClipComment"("clipId", "createdAt");

-- CreateIndex
CREATE INDEX "PlaylistLink_exerciseId_idx" ON "PlaylistLink"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "CraftmanshipStory_exerciseId_key" ON "CraftmanshipStory"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerProfile_userId_key" ON "TrainerProfile"("userId");

-- CreateIndex
CREATE INDEX "TrainerReview_trainerId_idx" ON "TrainerReview"("trainerId");

-- CreateIndex
CREATE INDEX "Experience_trainerId_idx" ON "Experience"("trainerId");

-- CreateIndex
CREATE INDEX "Experience_category_dateTime_idx" ON "Experience"("category", "dateTime");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_experienceId_status_idx" ON "Booking"("experienceId", "status");

-- CreateIndex
CREATE INDEX "Routine_userId_idx" ON "Routine"("userId");

-- CreateIndex
CREATE INDEX "RoutineItem_routineId_idx" ON "RoutineItem"("routineId");

-- CreateIndex
CREATE INDEX "Bundle_creatorId_idx" ON "Bundle"("creatorId");

-- CreateIndex
CREATE INDEX "BundlePurchase_userId_idx" ON "BundlePurchase"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BundlePurchase_bundleId_userId_key" ON "BundlePurchase"("bundleId", "userId");

-- CreateIndex
CREATE INDEX "DailyQuestCompletion_userId_date_idx" ON "DailyQuestCompletion"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuestCompletion_userId_questId_date_key" ON "DailyQuestCompletion"("userId", "questId", "date");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_itemType_itemId_key" ON "Wishlist"("userId", "itemType", "itemId");

-- CreateIndex
CREATE INDEX "PlanTrial_userId_status_idx" ON "PlanTrial"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DropPurchase_dropId_userId_key" ON "DropPurchase"("dropId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VIPMembership_userId_key" ON "VIPMembership"("userId");

-- CreateIndex
CREATE INDEX "UserTitle_userId_isActive_idx" ON "UserTitle"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UserBrand_userId_key" ON "UserBrand"("userId");

-- CreateIndex
CREATE INDEX "FitnessScoreHistory_userId_date_idx" ON "FitnessScoreHistory"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessScoreHistory_userId_date_key" ON "FitnessScoreHistory"("userId", "date");

-- CreateIndex
CREATE INDEX "PaidChallenge_status_idx" ON "PaidChallenge"("status");

-- CreateIndex
CREATE INDEX "PaidChallenge_createdById_idx" ON "PaidChallenge"("createdById");

-- CreateIndex
CREATE INDEX "PaidChallengeEntry_challengeId_idx" ON "PaidChallengeEntry"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaidChallengeEntry_challengeId_userId_key" ON "PaidChallengeEntry"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE INDEX "Course_creatorId_idx" ON "Course"("creatorId");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX "CourseLesson_courseId_idx" ON "CourseLesson"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_courseId_userId_key" ON "CourseEnrollment"("courseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_adminId_idx" ON "Organization"("adminId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_orgId_userId_key" ON "OrganizationMember"("orgId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationChallenge_orgId_idx" ON "OrganizationChallenge"("orgId");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_engagementScore_idx" ON "Post"("engagementScore");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_isPublic_isScheduled_createdAt_idx" ON "Post"("isPublic", "isScheduled", "createdAt");

-- CreateIndex
CREATE INDEX "Post_isHidden_idx" ON "Post"("isHidden");

-- CreateIndex
CREATE INDEX "PostPhoto_postId_idx" ON "PostPhoto"("postId");

-- CreateIndex
CREATE INDEX "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE INDEX "Hashtag_postCount_idx" ON "Hashtag"("postCount");

-- CreateIndex
CREATE INDEX "PostHashtag_hashtagId_idx" ON "PostHashtag"("hashtagId");

-- CreateIndex
CREATE UNIQUE INDEX "PostHashtag_postId_hashtagId_key" ON "PostHashtag"("postId", "hashtagId");

-- CreateIndex
CREATE INDEX "TrendingSnapshot_period_rank_idx" ON "TrendingSnapshot"("period", "rank");

-- CreateIndex
CREATE INDEX "TrendingSnapshot_snapshotAt_idx" ON "TrendingSnapshot"("snapshotAt");

-- CreateIndex
CREATE INDEX "PromoCard_isActive_targetAudience_idx" ON "PromoCard"("isActive", "targetAudience");

-- CreateIndex
CREATE INDEX "CreatorSubscription_creatorId_isActive_idx" ON "CreatorSubscription"("creatorId", "isActive");

-- CreateIndex
CREATE INDEX "CreatorSubscription_renewsAt_idx" ON "CreatorSubscription"("renewsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorSubscription_subscriberId_creatorId_key" ON "CreatorSubscription"("subscriberId", "creatorId");

-- CreateIndex
CREATE INDEX "CreatorTip_toCreatorId_createdAt_idx" ON "CreatorTip"("toCreatorId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialNotification_userId_isRead_createdAt_idx" ON "SocialNotification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "SocialNotification_userId_type_actorId_targetId_idx" ON "SocialNotification"("userId", "type", "actorId", "targetId");

-- CreateIndex
CREATE INDEX "ContentReport_status_createdAt_idx" ON "ContentReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContentReport_targetType_targetId_idx" ON "ContentReport"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ContentReport_reportedUserId_idx" ON "ContentReport"("reportedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentReport_reporterId_targetType_targetId_key" ON "ContentReport"("reporterId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "UserBlock_blockerId_idx" ON "UserBlock"("blockerId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "CronRun_name_startedAt_idx" ON "CronRun"("name", "startedAt");

-- CreateIndex
CREATE INDEX "CronRun_startedAt_idx" ON "CronRun"("startedAt");

-- CreateIndex
CREATE INDEX "CronRun_status_startedAt_idx" ON "CronRun"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_gymSessionId_fkey" FOREIGN KEY ("gymSessionId") REFERENCES "GymSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoseSnapshot" ADD CONSTRAINT "PoseSnapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedExercise" ADD CONSTRAINT "PlannedExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSession" ADD CONSTRAINT "GymSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSession" ADD CONSTRAINT "GymSession_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_gymSessionId_fkey" FOREIGN KEY ("gymSessionId") REFERENCES "GymSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseHistory" ADD CONSTRAINT "ExerciseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseHistory" ADD CONSTRAINT "ExerciseHistory_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingSession" ADD CONSTRAINT "CoachingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingMessage" ADD CONSTRAINT "CoachingMessage_coachingSessionId_fkey" FOREIGN KEY ("coachingSessionId") REFERENCES "CoachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyEvent" ADD CONSTRAINT "SafetyEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_gymSessionId_fkey" FOREIGN KEY ("gymSessionId") REFERENCES "GymSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalPhoto" ADD CONSTRAINT "JournalPhoto_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessProfile" ADD CONSTRAINT "FitnessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementUnlock" ADD CONSTRAINT "AchievementUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AchievementUnlock" ADD CONSTRAINT "AchievementUnlock_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodLog" ADD CONSTRAINT "FoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodLog" ADD CONSTRAINT "FoodLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMembership" ADD CONSTRAINT "LeagueMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillUnlock" ADD CONSTRAINT "SkillUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonMission" ADD CONSTRAINT "SeasonMission_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonProgress" ADD CONSTRAINT "SeasonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonProgress" ADD CONSTRAINT "SeasonProgress_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionCompletion" ADD CONSTRAINT "MissionCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodworkEntry" ADD CONSTRAINT "BloodworkEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehabPlan" ADD CONSTRAINT "RehabPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehabSession" ADD CONSTRAINT "RehabSession_rehabPlanId_fkey" FOREIGN KEY ("rehabPlanId") REFERENCES "RehabPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakFreeze" ADD CONSTRAINT "StreakFreeze_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplacePurchase" ADD CONSTRAINT "MarketplacePurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossAttempt" ADD CONSTRAINT "BossAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymReview" ADD CONSTRAINT "GymReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "ActivityFeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyProfile" ADD CONSTRAINT "BuddyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddySwipe" ADD CONSTRAINT "BuddySwipe_swiperId_fkey" FOREIGN KEY ("swiperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Props" ADD CONSTRAINT "Props_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Props" ADD CONSTRAINT "Props_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashParticipant" ADD CONSTRAINT "FlashParticipant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "FlashChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashParticipant" ADD CONSTRAINT "FlashParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneRepMax" ADD CONSTRAINT "OneRepMax_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "FitnessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedPlan" ADD CONSTRAINT "AIGeneratedPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedPlan" ADD CONSTRAINT "AIGeneratedPlan_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityFeedItem" ADD CONSTRAINT "ActivityFeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipant" ADD CONSTRAINT "ChallengeParticipant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipant" ADD CONSTRAINT "ChallengeParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearableData" ADD CONSTRAINT "WearableData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WearableConnection" ADD CONSTRAINT "WearableConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentImport" ADD CONSTRAINT "ContentImport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyPhoto" ADD CONSTRAINT "BodyPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyAnalysis" ADD CONSTRAINT "BodyAnalysis_bodyPhotoId_fkey" FOREIGN KEY ("bodyPhotoId") REFERENCES "BodyPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceItem" ADD CONSTRAINT "MarketplaceItem_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorTime" ADD CONSTRAINT "SectorTime_exerciseSetId_fkey" FOREIGN KEY ("exerciseSetId") REFERENCES "ExerciseSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAlert" ADD CONSTRAINT "MaintenanceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingMemory" ADD CONSTRAINT "CoachingMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingMemory" ADD CONSTRAINT "CoachingMemory_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMembership" ADD CONSTRAINT "SquadMembership_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMembership" ADD CONSTRAINT "SquadMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonStreak" ADD CONSTRAINT "PersonStreak_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonStreak" ADD CONSTRAINT "PersonStreak_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSupplement" ADD CONSTRAINT "UserSupplement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSupplement" ADD CONSTRAINT "UserSupplement_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "Supplement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementLog" ADD CONSTRAINT "SupplementLog_userSupplementId_fkey" FOREIGN KEY ("userSupplementId") REFERENCES "UserSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearItem" ADD CONSTRAINT "GearItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearReview" ADD CONSTRAINT "GearReview_gearItemId_fkey" FOREIGN KEY ("gearItemId") REFERENCES "GearItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearReview" ADD CONSTRAINT "GearReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipLike" ADD CONSTRAINT "ClipLike_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipLike" ADD CONSTRAINT "ClipLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipComment" ADD CONSTRAINT "ClipComment_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipComment" ADD CONSTRAINT "ClipComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuetComparison" ADD CONSTRAINT "DuetComparison_clipAId_fkey" FOREIGN KEY ("clipAId") REFERENCES "Clip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuetComparison" ADD CONSTRAINT "DuetComparison_clipBId_fkey" FOREIGN KEY ("clipBId") REFERENCES "Clip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuetComparison" ADD CONSTRAINT "DuetComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistLink" ADD CONSTRAINT "PlaylistLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistLink" ADD CONSTRAINT "PlaylistLink_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftmanshipStory" ADD CONSTRAINT "CraftmanshipStory_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerProfile" ADD CONSTRAINT "TrainerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "TrainerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bundle" ADD CONSTRAINT "Bundle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePurchase" ADD CONSTRAINT "BundlePurchase_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundlePurchase" ADD CONSTRAINT "BundlePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuestCompletion" ADD CONSTRAINT "DailyQuestCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrial" ADD CONSTRAINT "PlanTrial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTrial" ADD CONSTRAINT "PlanTrial_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropPurchase" ADD CONSTRAINT "DropPurchase_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropPurchase" ADD CONSTRAINT "DropPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPMembership" ADD CONSTRAINT "VIPMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrand" ADD CONSTRAINT "UserBrand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessScoreHistory" ADD CONSTRAINT "FitnessScoreHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidChallenge" ADD CONSTRAINT "PaidChallenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidChallenge" ADD CONSTRAINT "PaidChallenge_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidChallengeEntry" ADD CONSTRAINT "PaidChallengeEntry_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "PaidChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaidChallengeEntry" ADD CONSTRAINT "PaidChallengeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationChallenge" ADD CONSTRAINT "OrganizationChallenge_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPhoto" ADD CONSTRAINT "PostPhoto_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingSnapshot" ADD CONSTRAINT "TrendingSnapshot_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubscription" ADD CONSTRAINT "CreatorSubscription_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorSubscription" ADD CONSTRAINT "CreatorSubscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorTip" ADD CONSTRAINT "CreatorTip_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorTip" ADD CONSTRAINT "CreatorTip_toCreatorId_fkey" FOREIGN KEY ("toCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialNotification" ADD CONSTRAINT "SocialNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialNotification" ADD CONSTRAINT "SocialNotification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReport" ADD CONSTRAINT "ContentReport_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

