-- CreateIndex
CREATE INDEX "WorkoutSession_userId_startedAt_idx" ON "WorkoutSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "GymSession_userId_startedAt_idx" ON "GymSession"("userId", "startedAt");

