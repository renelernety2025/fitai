# FitAI — Project Context for Claude

## Project Overview
FitAI je AI-powered fitness platforma s real-time pose detection, gym workout trackingem a personalizovaným AI coachingem. Cíl: transformovat platformu z "fitness trackeru" na inteligentního AI trenéra.

**Produkce:** https://fitai.bfevents.cz (HTTPS přes ACM cert + ALB 443)
**GitHub:** https://github.com/renelernety2025/fitai (public)
**AWS:** eu-west-1, profile `fitai`, account 326334468637

## Tech Stack
- **Backend:** NestJS 10, TypeScript, Prisma 5, PostgreSQL 16, Redis 7
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Mobile:** React Native + Expo (apps/mobile/)
- **Pose detection:** MediaPipe Pose (33 landmarks, 8 joint angles)
- **AI:** Claude Haiku (coaching), Whisper (preprocessing), ElevenLabs (voice)
- **Infrastructure:** AWS ECS Fargate, RDS, ElastiCache, S3, CloudFront, ALB
- **CI/CD:** AWS CodeBuild (triggered manually via CLI from main branch)

## Repo Structure
```
fitai/
├── apps/
│   ├── api/            NestJS backend (27 modules)
│   ├── web/            Next.js frontend
│   └── mobile/         React Native (Expo)
├── packages/
│   └── shared/         Shared TypeScript types
├── infrastructure/     Terraform (AWS, 68 resources)
└── CLAUDE.md, ARCHITECTURE.md, ROADMAP.md
```

## Critical Conventions

### API Routing — `/api` Prefix
**ALL backend endpoints are under `/api/*`** via NestJS `setGlobalPrefix('api', { exclude: ['health'] })`.
- ALB rule: `/api/*` + `/health` → API target group, everything else → Next.js
- Frontend `api.ts`: `const API_URL = ${API_BASE}/api`
- This avoids collisions where Next.js page paths (`/exercises`, `/plans`) overlap with API paths

### Database
- **Local DB:** Docker postgres on port 5435 (`postgresql://fitai:fitai@localhost:5435/fitai_db`)
- **Production DB:** RDS — credentials in AWS Secrets Manager
- **Schema changes:** Use `npx prisma db push --accept-data-loss` (NOT migrate dev — production DB doesn't have migration history)
- **Migration task:** `aws ecs run-task --task-definition fitai-migrate:2` runs `prisma db push && prisma db seed`

### TypeScript Config (apps/api/tsconfig.json)
- `strictNullChecks: false`, `noImplicitAny: false` — relaxed due to TS 5.9 + NestJS decorator interop issues
- `useDefineForClassFields: false` — required for decorator metadata
- Build via `npx tsc -p tsconfig.json --noCheck` if local
- CodeBuild uses `nest build` (works because Docker container has clean TS env)

### Build & Deploy
**Local Docker is broken.** Deploy ONLY via AWS CodeBuild:
```bash
git add -A && git commit -m "..." && git push
export AWS_PROFILE=fitai
aws codebuild start-build --project-name fitai-api-build --region eu-west-1
aws codebuild start-build --project-name fitai-web-build --region eu-west-1
# Wait until SUCCEEDED, then ECS auto-deploys (force-new-deployment in buildspec)
# For schema changes:
aws ecs run-task --cluster fitai-production --task-definition fitai-migrate:2 \
  --launch-type FARGATE --region eu-west-1 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0bd0a6c5d4eadd609,subnet-0d261214e57e14fba],securityGroups=[sg-0bfd908240d06c541]}"
```

### CodeBuild Config
- **fitai-api-build** + **fitai-web-build** projects exist
- `ECR_URL` env var contains FULL repo URL (e.g. `326334468637.dkr.ecr.eu-west-1.amazonaws.com/fitai-api`) — buildspec uses `$ECR_URL:tag` (NOT `$ECR_URL/fitai-api:tag`)
- Buildspecs extract registry: `ECR_REGISTRY=$(echo $ECR_URL | cut -d'/' -f1)` for docker login
- Source: GitHub (renelernety2025/fitai), public repo

### Frontend Routing Trap
Pages like `/exercises`, `/plans`, `/videos` exist as Next.js routes AND used to clash with API paths. **Solution:** ALL API calls go through `/api` prefix. Never call `/exercises` directly — always `/api/exercises`.

### Suspense Required
`useSearchParams()` requires `<Suspense>` wrapper for production build. See `gym/start/page.tsx` pattern.

## Key Files

### Backend Modules (22)
| Module | Path | Purpose |
|--------|------|---------|
| Auth | `src/auth/` | JWT login/register |
| Users | `src/users/` | Profile, reminder status |
| Videos | `src/videos/` | Video catalog, S3 upload |
| Preprocessing | `src/preprocessing/` | Whisper + Claude → choreography |
| Sessions | `src/sessions/` | Video workout tracking |
| Progress | `src/progress/` | XP, streak, levels |
| Exercises | `src/exercises/` | 8 exercises with phases + instructions |
| WorkoutPlans | `src/workout-plans/` | Plan templates + custom |
| GymSessions | `src/gym-sessions/` | Gym workout, rep counter, RPE, weekly volume |
| Adaptive | `src/adaptive/` | Weight recommendations |
| Coaching | `src/coaching/` | Claude Haiku + ElevenLabs + safety |
| AIPlanner | `src/ai-planner/` | AI-generated plans, break recovery, asymmetry |
| Notifications | `src/notifications/` | Web push (VAPID) |
| Social | `src/social/` | Follow, feed, challenges, leaderboard |
| Vision | `src/vision/` | Equipment detection (rule-based) |
| Wearables | `src/wearables/` | HR sync, recovery score |
| Content | `src/content/` | URL import, marketplace |
| Intelligence | `src/intelligence/` | Plateaus, recovery, weak points (Section B) |
| Onboarding | `src/onboarding/` | 1RM test, fitness assessment (Section C) |
| Education | `src/education/` | Lessons, glossary, briefings (Section D) |

### Frontend Pages
```
/                     Landing
/login, /register     Auth
/dashboard            Stats, AI Insights, Lesson of the Week
/onboarding           3-step wizard (measurements, fitness test, review)
/videos, /videos/[id] Video catalog + workout
/workout/[videoId]    Video workout with pose detection
/exercises            Exercise library (8 cviků)
/exercises/[id]       Detailed instructions
/plans                Workout plan templates
/plans/[id]           Plan detail
/gym/start            Plan day selection
/gym/[sessionId]      Gym workout (rep counter, RPE modal, rest timer)
/ai-coach             AI Trainer profile + plan generation
/lekce                Education lessons listing
/lekce/[slug]         Lesson detail
/slovnik              Glossary (16 terms)
/community            Social: feed, challenges, people
/progress             Stats, weekly volume, streak calendar
/admin/upload         Admin panel
```

### Critical Frontend Files
- `apps/web/src/lib/api.ts` — All API client functions, MUST use `${API_BASE}/api` prefix
- `apps/web/src/lib/auth-context.tsx` — JWT auth context, localStorage `fitai_token`
- `apps/web/src/components/layout/Header.tsx` — Main navigation
- `apps/web/src/lib/feedback-engine.ts` — Pose feedback logic, exports `calculateAngle`, `JOINT_MAP`, `getJointAngles`, `checkPose`
- `apps/web/src/lib/rep-counter.ts` — Gym rep counting state machine
- `apps/web/src/lib/safety-checker.ts` — Real-time safety alerts
- `apps/web/src/lib/smart-voice.ts` — ElevenLabs + Web Speech fallback

## Demo Accounts
- **Admin:** admin@fitai.com / demo1234 (isAdmin: true)
- **Demo user:** demo@fitai.com / demo1234

## Environment Variables
```
DATABASE_URL=postgresql://fitai:fitai@RDS:5432/fitai_db   # Secrets Manager in prod
JWT_SECRET=...                                              # Secrets Manager
ANTHROPIC_API_KEY=                                          # Empty = mock fallback
OPENAI_API_KEY=                                             # Empty = mock fallback
ELEVENLABS_API_KEY=                                         # Empty = Web Speech fallback
VAPID_PUBLIC_KEY=BM_Uf2t3hZuC...
VAPID_PRIVATE_KEY=sLWzDnRNgd8d...
NEXT_PUBLIC_API_URL=http://fitai-production-alb-...amazonaws.com
```

## Working Style — User Preferences
- **Język:** Czech responses (cs-CZ everywhere — UI, AI prompts, voice)
- **Pace:** Step by step, ask before huge changes, deploy frequently
- **Quality:** Never break existing functionality. Add, don't replace.
- **Clean code:** No unnecessary abstractions, no speculative features
- **Direct deploy:** User wants to see things live ASAP, prefers working production over local testing
- **No emojis** in code/files unless explicitly asked
- **No "approved by Claude" badges** in commits unless asked

## Cost Optimization
- Claude Haiku for real-time coaching (~$0.001/call) — NOT Opus
- Cache common phrases in ElevenLabs LRU
- Mock fallbacks when API keys missing (so dev/demo works without real costs)
- AWS infra: ~$60-80/month baseline + AI usage

## Regression Prevention Rules

**PŘED každou změnou:**
1. PŘEČTI `CONTRACTS.md` — zkontroluj jestli změna nezasahuje do zámčených věcí (API shapes, DB pole, core soubory, routes)
2. Pokud ano → ZASTAV a zeptej se uživatele s vysvětlením proč a co by se rozbilo

**PO každé větší změně / před deployem:**
1. SPUSŤ `bash test-production.sh` — všechny testy musí projít
2. AKTUALIZUJ `CHANGELOG.md` — přidej sekci s datem a popisem
3. AKTUALIZUJ `ROADMAP.md` — označ co je hotové
4. AKTUALIZUJ `ARCHITECTURE.md` — pokud přibyl modul/endpoint/model
5. AKTUALIZUJ `memory/project_state.md`

**NIKDY bez explicitního souhlasu:**
- Měnit shape existujícího API endpointu (jen přidávat nová pole)
- Mazat / přejmenovávat DB sloupce
- Přejmenovávat frontend route (rozbije bookmarks)
- Modifikovat auth flow nebo `apps/api/src/auth/*`
- Přepisovat `feedback-engine.ts`, `rep-counter.ts`, `safety-checker.ts`, `smart-voice.ts` (jádro pose detection)
- Měnit ALB routing pravidla nebo `setGlobalPrefix('api', ...)`

**Auto-update workflow při dokončení feature:**
1. Implementuj feature
2. Spusť `test-production.sh`
3. Pokud projde → commit + push + CodeBuild deploy
4. Aktualizuj CHANGELOG.md, ROADMAP.md, memory/project_state.md
5. Pokud nový modul → aktualizuj ARCHITECTURE.md

## Common Pitfalls (Lessons Learned)
1. **Don't use `prisma migrate dev`** in production — use `prisma db push`
2. **Don't run Docker locally** — Docker Desktop is broken on user's Mac, use CodeBuild
3. **Don't path-collision** API and frontend routes — always use `/api` prefix
4. **Don't forget Suspense** for `useSearchParams` in static-rendered pages
5. **Don't bare-import @anthropic-ai/sdk** in routes — use require() pattern (vendor lock warning)
6. **Don't use `repo` for paths in CodeBuild buildspec** — `ECR_URL` already includes repo name
7. **Always commit + push before CodeBuild** — CodeBuild pulls from GitHub, not local
8. **Schema changes** require both `db push` (apply) AND `seed` (re-populate)
9. **Upsert in seed** must include ALL fields in `update:` clause that you want updated
10. **Always test ALB routing** after schema/API changes — `/exercises` (page) vs `/api/exercises` (endpoint)
