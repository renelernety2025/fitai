# ROADMAP archive — Wave 1 completed sections (moved 2026-07-02)

> Aktivní roadmap: @ROADMAP.md

## Hotovo (2026-05-04 — odkaz)

### Wave 1 backend (tech-uplift) ✅
Plán: `~/.claude/plans/super-m-e-se-pros-m-snazzy-nebula.md`. Wave 1 backend dokončený:
- **pgvector setup**, HNSW indexy, Prisma schema (Exercise/Recipe/WorkoutSession `embedding vector(1536)`)
- **EmbeddingsService** (@Global, OpenAI text-embedding-3-small)
- **Semantic exercise search**: `POST /api/exercises/search/semantic`
- **RAG history query**: `POST /api/ai-insights/history-query` (top-10 sessions → Claude Haiku, cache 24h, throttle 10/h) + weekly cron pro re-embed
- **HealthKit-aware Daily Brief**: `calcRecoveryScoreSmart` preferuje HRV/sleep/restingHR z `WearableData` před self-reported `DailyCheckIn`
- **Wearables DTO**: přidány providery `google_fit` + `health_connect`

### Wave 3 sneak — Oura Ring OAuth ✅
- `WearableConnection` model + `OuraOAuthService` (CSRF přes JWT state) + `OuraSyncService` + daily cron `@Cron('0 4 * * *')`
- 5 new endpointů: `oauth/oura/{authorize,callback,sync}`, DELETE, `wearables/connections`
- Mobile `HealthSyncScreen` rozšířený o Oura sekci s `expo-web-browser` OAuth flow
- Production deploy: env `OURA_CLIENT_ID/SECRET/REDIRECT_URI` přes Secrets Manager
- Wave 2 #20/#21 (VisionCamera mobile pose) — **už shipped** v `apps/mobile/src/lib/pose/` + `CameraWorkoutProScreen`

### Wave 1 mobile ✅
- `@kingstinct/react-native-healthkit` + `react-native-health-connect` installed + plugin config v `app.json`
- Cross-platform `health-sync.ts` wrapper + `HealthSyncScreen` + ProfileScreen entry
- Code-complete; user-driven: `expo prebuild --clean` + `pod install` + EAS dev build + device test

### Wave 1 zbývá pro produkci (user-driven)
- EAS development build (iOS + Android, ~15 min každá)
- Device test HealthKit/Health Connect permissions + initial 7d sync
- RDS: `CREATE EXTENSION vector;` + schema push (Exercise/Recipe/WorkoutSession `embedding` column) přes ECS migrate task
- Embedding seed přes ECS task (`OPENAI_API_KEY` ze Secrets Manager, ~$0.05)
- Smoke test prod (`bash test-production.sh` → 115/115)

---

