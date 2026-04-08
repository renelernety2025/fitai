# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

---

## [Section L — Generative Meal Planning] 2026-04-08
### Added
- **Schema:** `MealPlan` model s `@@unique([userId, weekStart])` — jeden plán per týden per uživatel,
  payload jako Json (days × meals + shopping list + agregované makra)
- **Backend** (`nutrition` modul, rozšíření):
  - `GET /api/nutrition/meal-plan/current` — plán pro tento týden (Pondělí-Neděle)
  - `GET /api/nutrition/meal-plan/history?limit=N` — historie posledních N plánů
  - `POST /api/nutrition/meal-plan/generate` — vygeneruj/regeneruj (upsert) s body
    `{weekStart?, preferences?, allergies?[], cuisine?}`
  - `DELETE /api/nutrition/meal-plan/:id`
- **Claude Haiku integration:**
  - Prompt obsahuje user profile (cíl, makro targets, alergie, kuchyně)
  - Generuje 7 dní × 4 jídla (snídaně/svačina/oběd/večeře)
  - Každé jídlo: název, kcal, makra, ingredients[], prepMinutes, optional notes
  - Agreguje shopping list po 5 kategoriích (Maso/Mléčné/Ovoce-Zelenina/Pečivo/Ostatní)
  - Max 8000 tokens, model `claude-haiku-4-5`
- **Rules-based fallback** (~28 jídel z 12 šablon, rotace přes týden) když Claude nedostupný
- **Web UI** `apps/web/src/app/(app)/jidelnicek/page.tsx`:
  - Hero "Tvůj jídelníček."
  - 4-stat strip (kcal/den, protein/den, týdně, jídel celkem)
  - Action bar: Nákupní seznam toggle / Preference toggle / Regenerate
  - **Preference panel** — input pole pro preferences, alergie, cuisine
  - **Shopping list grid** — 5 kategorií s qty + unit, aggregated přes celý týden
  - **Day picker** — horizontální scroll s Po..Ne, kcal per den, active state
  - **Meal cards** — barevné chip per type, kcal/protein/sacharidy/tuky, ingredients list, notes
  - Source watermark (Claude vs rules) + datum generování
- **Web nav:** přidán "Jídelníček" do `V2Layout`
- **Mobile screen** `JidelnicekScreen.tsx` — parita (stats, day picker, meal cards, shopping list, generate)
- **Mobile nav:** `AppNavigator` Stack screen + ProfileScreen menu link "Jídelníček (AI)"
- **Regression:** `test-production.sh` přidává:
  - `/api/nutrition/meal-plan/current`
  - `/api/nutrition/meal-plan/history`
  - `/jidelnicek` web page
  → 58 → 61 testů

### Why
**Uzavírá Section F (Nutrition) plně + propojuje s Daily Brief (Section H).**
Uživatel teď má **kompletní AI coach loop**:
- **Daily Brief:** AI workout pro dnešek (recovery + volume → cviky)
- **Meal Plan:** AI jídelníček na týden (makro cíle → 28 jídel + shopping list)
= Full personalized fitness + nutrition coach.

### Cost
Claude Haiku ~5000 input + 5000 output tokens / generation, called typically
1× per týden per user → cca $0.005/user/týden = $20/měsíc pro 1000 active users.

### Files
**Backend:**
- `apps/api/prisma/schema.prisma` (+MealPlan model + User.mealPlans relation)
- `apps/api/src/nutrition/nutrition.service.ts` (+5 metod, +rules fallback ~150 řádků)
- `apps/api/src/nutrition/nutrition.controller.ts` (+4 endpointy)

**Web:**
- `apps/web/src/lib/api.ts` (+typy MealPlan*, +4 endpoint funkce)
- `apps/web/src/app/(app)/jidelnicek/page.tsx` (NEW, ~332 řádků)
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)

**Mobile:**
- `apps/mobile/src/lib/api.ts` (+4 endpoint funkce)
- `apps/mobile/src/screens/JidelnicekScreen.tsx` (NEW, ~323 řádků)
- `apps/mobile/src/navigation/AppNavigator.tsx` (+Stack screen)
- `apps/mobile/src/screens/ProfileScreen.tsx` (+menu link)

**Tests:** `test-production.sh` (+3 položky)

---

## [fix: Section K — S3 upload CORS + SDK v3 auto-checksum] 2026-04-08
### Fixed
Browser upload na `/progres-fotky` selhával s `Failed to fetch`. Dvě root causes:

**1. Bucket `fitai-assets-production` neměl CORS policy.**
- Browser dělal CORS preflight `OPTIONS` před PUT, S3 vrátil chybu (žádný `Access-Control-Allow-Origin`), prohlížeč zablokoval request.
- **Fix:** Aplikována CORS policy s `https://fitai.bfevents.cz`, `http://localhost:3000`, `http://localhost:8081` v allowed origins. Allowed methods: GET/HEAD/PUT/DELETE. ExposeHeaders: ETag.

**2. AWS SDK v3 auto-checksum middleware.**
- SDK v3.730+ automaticky podepisoval `x-amz-checksum-crc32=AAAAAA==` (empty body checksum) do presigned URL.
- Když browser PUT poslal reálné tělo (blob), S3 počítal jiný checksum a vracel 400 BadDigest.
- **Fix:** `S3Client` v `progress-photos.service.ts` inicializován s `requestChecksumCalculation: 'WHEN_REQUIRED'` + `responseChecksumValidation: 'WHEN_REQUIRED'`. Cast `as any` pro safety pokud SDK verze nemá tyto typy (runtime ignoruje).

### Verified
- `OPTIONS` preflight returns `200 + Access-Control-Allow-Origin: https://fitai.bfevents.cz`
- `aws s3api get-bucket-cors --bucket fitai-assets-production` shows the new policy

### Files
- `apps/api/src/progress-photos/progress-photos.service.ts` (S3Client init)
- AWS bucket `fitai-assets-production` CORS configuration

---

## [Section K — Body Progress Photos] 2026-04-08
### Added
- **Schema:** `BodyPhoto` model + `BodyAnalysis` model + `PhotoSide` enum
  (FRONT/SIDE/BACK), 1:1 relace, indexy na `userId+takenAt` a `userId+side+takenAt`
- **Backend modul `progress-photos`** (NestJS):
  - `POST /api/progress-photos/upload-url` — presigned S3 PUT URL + pre-create DB row
  - `GET /api/progress-photos?side=` — list všech fotek s presigned GET urly + analýzou
  - `GET /api/progress-photos/stats` — celkem, by angle, daysTracked
  - `GET /api/progress-photos/:id` — jedna fotka s analýzou
  - `POST /api/progress-photos/:id/analyze` — Claude Vision body composition
  - `DELETE /api/progress-photos/:id` — smaže S3 objekt + DB row
- **Claude Vision integration:**
  - Pošle aktuální + předchozí foto stejného úhlu jako base64
  - Vrací `estimatedBodyFatPct`, `estimatedMuscleMass`, `postureNotes`,
    `visibleStrengths[]`, `areasToWork[]`, `comparisonNotes`
  - Model `claude-haiku-4-5`, max 800 tokens
  - Static fallback když není API key
- **S3Service fix** (`apps/api/src/videos/s3.service.ts`): odstraněn AWS_ACCESS_KEY_ID
  check, klient se vytváří unconditionally — ECS Fargate task role auto-discover funguje
- **AWS IAM:** task role `fitai-production-ecs-task` rozšířena o:
  - S3 přístup k `fitai-assets-production` bucket (Get/Put/Delete/ListBucket)
  - `s3:DeleteObject` action pro mazání fotek
- **Web UI** `apps/web/src/app/(app)/progres-fotky/page.tsx`:
  - Hero "Tvoje cesta." + popis privacy
  - Stats grid (4 ringy: total, days tracked, front, bok+zezadu)
  - 3 upload zóny (FRONT/SIDE/BACK) — drag & file input
  - Filter chips (Vše/Zepředu/Z boku/Zezadu)
  - **Before/After slider** — interactive scrubber pro porovnání 2 fotek
  - Photo grid s hover overlay (Smazat / Porovnat / AI analýza)
  - Analysis ribbon na spodu karty (% tělesný tuk, svalová hmota)
- **Web nav:** `V2Layout.tsx` přidán link "Fotky" → `/progres-fotky`
- **Mobile screen** `ProgressPhotosScreen.tsx`:
  - Hero + stats + 3 upload buttony (přes `expo-image-picker`)
  - Filter chips + foto grid + AI analýza + delete
- **Mobile nav:** `AppNavigator.tsx` přidán Stack screen, Profile menu link "Progress fotky"
- **Mobile dependency:** `expo-image-picker@~17.0.10` přidán do `package.json`
  (uživatel musí spustit `pnpm install` v `apps/mobile`)
- **Regression:** `test-production.sh` přidává:
  - `/api/progress-photos`
  - `/api/progress-photos/stats`
  - `/progres-fotky` web page
  → 55 → 58 testů

### Privacy & Security
- Fotky **jen pro vlastníka** — controller čte `req.user.id` a service ověřuje
  ownership na každém get/delete/analyze (`ForbiddenException` jinak)
- S3 klíče pod `progress-photos/{userId}/{photoId}.{ext}` — žádný admin endpoint
- Žádné sociální sdílení by default
- Presigned GET urly mají TTL 1h

### Why
**Největší retention boost** podle ROADMAP. Před/po fotky jsou emocionálně
nejsilnější metric — uživatel vidí svůj progres vizuálně, ne jen jako čísla.
Claude Vision přidává profesionální feedback bez nutnosti najmout trenéra.

### Migrace
Schema změna spustí auto-migrate task v GH Actions deploy workflow.
Nový enum `PhotoSide` + 2 modely + 1 nová relace na User.

### Files (nové i editované)
**Backend:**
- `apps/api/prisma/schema.prisma` (+BodyPhoto, +BodyAnalysis, +PhotoSide enum, +User.bodyPhotos)
- `apps/api/src/progress-photos/{service,controller,module}.ts` (NEW, ~410 řádků)
- `apps/api/src/app.module.ts` (+ProgressPhotosModule)
- `apps/api/src/videos/s3.service.ts` (fix init)

**AWS:**
- IAM role `fitai-production-ecs-task` policy `task-permissions` (rozšíření)

**Web:**
- `apps/web/src/lib/api.ts` (+typy + 6 endpoint funkcí)
- `apps/web/src/app/(app)/progres-fotky/page.tsx` (NEW, ~357 řádků)
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)

**Mobile:**
- `apps/mobile/src/lib/api.ts` (+endpoint funkce)
- `apps/mobile/src/screens/ProgressPhotosScreen.tsx` (NEW, ~274 řádků)
- `apps/mobile/src/screens/ProfileScreen.tsx` (+menu link)
- `apps/mobile/src/navigation/AppNavigator.tsx` (+Stack screen)
- `apps/mobile/package.json` (+expo-image-picker)

**Tests:** `test-production.sh` (+3 položky)

---

## [CI hardening — smoke test waits for ECS stability] 2026-04-08
### Fixed
- `.github/workflows/deploy.yml` smoke-test job nyní volá `aws ecs wait services-stable`
  pro `fitai-api-service` + `fitai-web-service` místo blind `sleep 60`
- Důvod: ECS rolling deploy může trvat 90-180s (start tasku + health checks +
  ALB target group registrace). Předchozí 60s sleep selhával u pomalejších deployů,
  smoke test trefil starý kontejner a vrátil 404 na nové endpointy
- 15s grace sleep po `services-stable` pro ALB target group registraci
- Run #8 (commit `76feb20`) — první deploy s opraveným pipelinem prošel zelený

### Files
- `.github/workflows/deploy.yml`

---

## [fix: AI Coach Daily Brief — OneRepMax schema mismatch] 2026-04-08
### Fixed
- `getDailyBrief()` v `ai-insights.service.ts` selhával s `TS2353` v CodeBuildu
  protože dotazoval `OneRepMax` přes `userId` a `testedAt`
- Reálné schema: `OneRepMax` je keyovaný `profileId` (přes `FitnessProfile`),
  ne `userId`, a má `createdAt`/`updatedAt`, ne `testedAt`
- **Restrukturováno na 2-stage parallel load:**
  - Stage 1: `Promise.all([User, FitnessProfile])`
  - Stage 2: `Promise.all([checkIns, recentSessions, oneRepMaxes(profile.id), weeklyVolumes])`
- Fallback `Promise.resolve([])` když uživatel nemá profil

### Files
- `apps/api/src/ai-insights/ai-insights.service.ts`

---

## [AI Coach Daily Brief — flagship hero] 2026-04-08
### Added
- **Backend:** Nový endpoint `GET /api/ai-insights/daily-brief`
  - Čte 6 zdrojů paralelně: User, FitnessProfile, posledních 7 dní DailyCheckIn, posledních 14 dní WorkoutSession, OneRepMax × 5, WeeklyVolume
  - Spočítá `recoveryScore` (0-100) z spánku, energie, soreness, stresu
  - Klasifikuje `recoveryStatus` (`fresh|normal|fatigued|overreached`)
  - Claude Haiku 4.5 generuje strukturovaný workout (4-6 cviků se sety/reps/RPE/rationale)
  - **Mood-driven generation:** push (RPE 8-9) / maintain (RPE 7) / recover (RPE 5-6)
  - Cache 24h per user, klíč `${userId}:${YYYY-MM-DD}` (Europe/Prague)
  - Static rules-based fallback s 3 rotujícími splity (push/pull/legs) podle dne v roce
  - Output má 11 polí: `greeting`, `headline`, `mood`, `recoveryStatus`, `recoveryScore`,
    `workout {title, estimatedMinutes, warmup, exercises[], finisher}`, `rationale`,
    `motivationalHook`, `nutritionTip`, `alternativeIfTired`, `source`
- **Web flagship UI:** `apps/web/src/components/v2/V2DailyBrief.tsx`
  - Mood-driven gradient hero card (push=red, maintain=green, recover=cyan)
  - Recovery score meter top-right
  - Hero headline (2-3rem clamp), workout meta, rationale, dual CTA
  - Třísloupcová sekce: Rozcvička / Nutriční tip / Alternativa když nemáš energii
  - Strukturovaný plán cviků s set×reps × RPE × rationale per cvik
  - Motivační quote s mood-colored border
  - Source watermark (Claude vs rules)
- **Web napojení:** `dashboard/page.tsx` načte `getDailyBrief()` a renderuje `<V2DailyBrief>` jako první sekci hned pod hero ringy
- **Mobile parita:** `DashboardScreen.tsx`
  - Mood-colored card s recovery score, headline, rationale, CTA
  - Plán cviků pod kartou (čísla 01..n, název, rationale, sets×reps × RPE)
- **Regression test:** `test-production.sh` přidává `/api/ai-insights/daily-brief` (54 → 55 testů)

### Files
- `apps/api/src/ai-insights/ai-insights.service.ts` (+450 řádků: types, getDailyBrief, helpers, rulesDailyBrief)
- `apps/api/src/ai-insights/ai-insights.controller.ts` (+`@Get('daily-brief')`)
- `apps/web/src/lib/api.ts` (+typy DailyBrief* + getDailyBrief)
- `apps/web/src/components/v2/V2DailyBrief.tsx` (NEW)
- `apps/web/src/app/(app)/dashboard/page.tsx` (+ V2DailyBrief integration)
- `apps/mobile/src/lib/api.ts` (+ getDailyBrief)
- `apps/mobile/src/screens/DashboardScreen.tsx` (+ Daily Brief card + exercises list)
- `test-production.sh` (+ endpoint)

### Why
**Flagship hero feature.** Místo pasivního dashboardu (statistiky + lekce + insights) má uživatel
jasné, konkrétní AI doporučení **přesně pro dnešek** — jaký workout, proč, kolik kg, RPE,
rationale per cvik. Tohle propojuje vše hotové (Section A volume, B intelligence, C 1RM,
G habits, H AI brain) do jednoho akčního brífinku.

### Cost
Claude Haiku ~2000 tokens / call, cache 24h → ~1 call/user/den → cca $0.0005/user/den.
Pro 1000 DAU = $0.50/den = $15/měsíc.

---

## [VAPID web push keys live] 2026-04-08
### Added
- VAPID keypair vygenerován přes `npx web-push generate-vapid-keys`
- AWS Secrets Manager: `fitai/vapid-public-key`, `fitai/vapid-private-key`
- ECS task definition `fitai-api:4` injektuje `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` jako env vars
- ECS service `fitai-api-service` přepnut na revizi 4

### Result
- `GET https://fitai.bfevents.cz/api/notifications/vapid-public-key` vrací reálný klíč (předtím `""`)
- Backend boot log: `VAPID keys configured` (předtím `WARN: No VAPID keys`)
- Web push subscribe na `https://fitai.bfevents.cz` teď funguje end-to-end
- `sendStreakReminders()` posílá web push paralelně s Expo push (mobile)

### Code
- **Žádná změna v kódu** — `notification.service.ts` byl už hotový, čekal jen na env vars
- `notification.service.ts:14` volá `webpush.setVapidDetails('mailto:admin@fitai.com', ...)` automaticky když existují

### Why
Uzavírá poslední ❌ v ROADMAP Infrastructure tabulce. Web push reminders pro desktop uživatele, kteří nemají mobile app.

---

## [CI/CD GitHub Actions auto-deploy] 2026-04-08
### Added
- `.github/workflows/deploy.yml` — auto-deploy při push na `main`:
  - `dorny/paths-filter@v3` detekuje co se změnilo (api/web/schema)
  - Paralelní `aws codebuild start-build` pro `fitai-api-build` + `fitai-web-build`
  - Auto-spuštění `fitai-migrate:2` ECS task při změně `schema.prisma`
  - Smoke test `test-production.sh` po deployi
  - Concurrency lock `deploy-production` (žádné souběžné deploye)
  - `workflow_dispatch` pro manuální spuštění
- `.github/workflows/ci.yml` — PR lint + typecheck (nedeployuje)
- `docs/GITHUB_ACTIONS_SETUP.md` — referenční návod (OIDC, IAM)

### AWS Infrastructure
- **OIDC provider** `token.actions.githubusercontent.com` v account 326334468637
- **IAM role** `fitai-github-actions` s trust policy omezenou na repo `renelernety2025/fitai`
- **Permissions policy** `fitai-deploy-policy`:
  - `codebuild:StartBuild` jen na 2 projekty
  - `ecs:RunTask` pro migrační task
  - `iam:PassRole` jen na ECS task role
- **Žádné long-lived AWS klíče** v GitHub secrets — short-lived OIDC tokeny

### Verified end-to-end
- Run #1 (commit `acc1f2c`): jen workflow soubory → všechny build joby skipnuté ✅
- Run #2 (commit `64bc938`): change v `health.controller.ts` → `build-api` projel CodeBuildem, smoke test 54/54 ✅
- `GET https://fitai.bfevents.cz/health` vrací nový `{ status, timestamp }` shape

### Why
Před: každý deploy = ruční `aws codebuild start-build` × 2 + ruční migrace + ruční test.
Po: `git push origin main` = automatický build + deploy + migrace + test.

### Files
- `.github/workflows/deploy.yml`
- `.github/workflows/ci.yml`
- `docs/GITHUB_ACTIONS_SETUP.md`
- `apps/api/src/health/health.controller.ts` (+timestamp pro end-to-end test)

---

## [Section J — Gamification + AI Nutrition Tips] 2026-04-08
### Added
- **Achievements system**: `Achievement` + `AchievementUnlock` modely, 17 seed achievements ve 6 kategoriích
  - Training: first_workout, workouts_5/25/100
  - Streak: streak_3/7/30
  - Milestone: time_10h/50h, xp_1000/5000/10000
  - Habits: first_checkin, checkin_7
  - Exploration: tried_home_workout, tried_ai_coach, read_5_lessons
- Auto-unlock při check (`POST /api/achievements/check`) — počítá z UserProgress + sessions + check-ins
- Auto XP reward při unlock (50-1000 XP per achievement)
- Manual unlock přes code (`POST /api/achievements/unlock` s `{code}`) pro exploration achievements
- Web `/uspechy` page — 17 badges grid s category filtrem, locked/unlocked stavy
- Mobile `UspechyScreen` — 2-col grid, accessible přes Profile menu
- Achievement seed na app boot (idempotent — `OnApplicationBootstrap`)

### AI Nutrition Tips
- Nový endpoint `GET /api/ai-insights/nutrition-tips`
- Claude Haiku analyzuje 7-day food logs + nutrition goals + fitness goal → 3 personalizované tipy
- Kategorie: protein, hydration, timing, macros, quality
- 1h cache, static fallback
- Web `/vyziva` integrace — sekce "AI doporučení" před meals
- Mobile `VyzivaScreen` totéž

### Files
- `apps/api/prisma/schema.prisma` (+Achievement, +AchievementUnlock)
- `apps/api/src/achievements/{module,controller,service}.ts`
- `apps/api/src/ai-insights/ai-insights.{service,controller}.ts` (+nutrition tips)
- `apps/web/src/app/(app)/uspechy/page.tsx`
- `apps/web/src/app/(app)/vyziva/page.tsx` (+AI tips)
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)
- `apps/mobile/src/screens/{UspechyScreen,VyzivaScreen,ProfileScreen}.tsx`
- `apps/mobile/src/navigation/AppNavigator.tsx` (+route)

---

## [Section H — AI Brain] 2026-04-08
### Added
- Modul `ai-insights` s endpointy `/recovery-tips`, `/weekly-review`
- Claude Haiku generuje **personalizované recovery tipy** podle 7-day habits průměru (sleep, energy, soreness, stress)
- Claude Haiku generuje **weekly review** podle 7-day workouts + check-ins (summary, highlights, improvements, next week focus)
- 1h in-memory cache aby Claude nebyl volán pro každý request
- Static fallback pokud Claude API nedostupné nebo žádná data
- Web `/habity` page — sekce "AI doporučení" před daily check-in formem
- Web `/dashboard` — "AI Týdenní review" widget před lekcí týdne
- Mobile `HabityScreen` + `DashboardScreen` — totéž

### Why
Uzavírá smyčku habits → AI insights → akce. Uživatel vidí konkrétní personalizované rady místo obecných statistik.

### Files
- `apps/api/src/ai-insights/{module,controller,service}.ts`
- `apps/web/src/app/(app)/{habity,dashboard}/page.tsx`
- `apps/mobile/src/screens/{HabityScreen,DashboardScreen}.tsx`
- `apps/web/src/lib/api.ts`, `apps/mobile/src/lib/api.ts`

---

## [Push notifications + HTTPS hardening] 2026-04-08
### Added
- `User.expoPushToken` field
- `POST /api/notifications/expo-subscribe` — registrace Expo push tokenu
- `notification.service.sendExpoToUser()` — push přes Expo Push API (https://exp.host/--/api/v2/push/send)
- `sendStreakReminders` posílá teď i přes Expo push
- Mobile auto-registrace tokenu v `auth-context` (login + existing session)
- Mobile Profile: tlačítko "Otestovat push notifikace"
- ALB HTTP listener: default action = HTTP 301 → HTTPS (path + query preserved)
- Mobile API client default URL → `https://fitai.bfevents.cz`

### Why
- Mobile uživatel dostane reminder když ztratí streak nebo nezacvičil
- HTTPS redirect — žádný plain HTTP traffic, security best practice
- Mobile teď konzistentně volá HTTPS API (žádná mixed content varování v budoucnu)

### Files
- `apps/api/prisma/schema.prisma` (+expoPushToken)
- `apps/api/src/notifications/notification.{service,controller}.ts`
- `apps/mobile/src/lib/{api,auth-context}.ts`
- `apps/mobile/src/screens/ProfileScreen.tsx`

### Skipping
- VAPID web push — keys nejsou v Secrets, web push zatím nefunguje. Příští krok pokud bude potřeba.

---

## [Section G — Habits & daily check-in] 2026-04-08
### Added
- `DailyCheckIn` model (sleep, hydration, steps, mood, energy, soreness, stress, notes)
- Modul `habits` s endpointy: `GET /today`, `PUT /today`, `/history`, `/stats`
- Recovery score (0-100) — spočítaný ze 7-day průměru spánku, energie, soreness, stres
- Streak counter (consecutive check-in days)
- Web stránka `/habity` — recovery ring + 1-5 scale form + history
- Mobile `HabityScreen` jako 6. tab v bottom nav
- Web nav rozšířený o "Habity"

### Why
Holistic fitness coach — propojuje mimotreningové metriky s recovery score, AI Insights tak ví kdy snížit intenzitu.

### Files
- `apps/api/prisma/schema.prisma` (+ DailyCheckIn)
- `apps/api/src/habits/{module,controller,service}.ts`
- `apps/web/src/app/(app)/habity/page.tsx`
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)
- `apps/mobile/src/screens/HabityScreen.tsx`
- `apps/mobile/src/navigation/AppNavigator.tsx` (+tab)

---

## [Real AI Keys] 2026-04-08
### Added
- AWS Secrets Manager: `fitai/anthropic-api-key`, `fitai/openai-api-key`, `fitai/elevenlabs-api-key`, `fitai/elevenlabs-voice-id`
- ECS task definition (revision 3) injektuje secrets jako env vars
- IAM: `SecretsManagerReadWrite` policy na `fitai-production-ecs-execution` roli

### Result
- Claude Haiku **reálně koučuje** s českým personalizovaným feedbackem (test: "Lokte níž, prsou se dotykej! Tlak pomaleji.")
- ElevenLabs vrací **real Czech audio** (60KB base64 audio na 1 větu)
- Mock fallbacky pro Anthropic/ElevenLabs/OpenAI vypnuté

---

## [HTTPS na produkci] 2026-04-08
### Added
- ACM certifikát pro `fitai.bfevents.cz` (DNS validation, Active24)
- ALB HTTPS listener (443) s rule `/api/* + /health → API`
- DNS CNAME `fitai → ALB hostname`
- `NEXT_PUBLIC_API_URL = https://fitai.bfevents.cz` v CodeBuild env

### Result
- Web teď běží na **https://fitai.bfevents.cz** — kamera v prohlížeči funguje, pose detection live
- Stará HTTP URL `fitai-production-alb-...amazonaws.com` zůstává funkční (HTTP listener nezměněn)

---

## [Mobile camera workout — Phase 6 part 1] 2026-04-08
### Added
- `apps/mobile/src/screens/CameraWorkoutScreen.tsx` — `expo-camera` mirror mode + manuální rep counter
- Haptic feedback (`expo-haptics`) při tap, set complete, end
- RPE modal po každém pracovním setu (1-10)
- Rest timer (90s countdown)
- Overall progress display: "CVIK X/Y · CELKEM SET X/Y"
- "PŘESKOČIT CVIK" + "✓ DOKONČIT TRÉNINK" tlačítka
- Backend save přes existing `completeGymSet` + `endGymSession`
- Camera permission flow přes `useCameraPermissions`
- Linked z `PlanDetailScreen` přes "ZAČÍT" buttony per den

### Skipping (Phase 6 part 2)
- Native MediaPipe pose detection na mobilu (vyžaduje EAS Build, custom dev build, react-native-vision-camera + frame processor plugin)

---

## [Mobile v2 — full sync s webem] 2026-04-07
### Added
Mobile React Native app dohnaná na úroveň webu. Stejný v2 design system, stejné featury (kromě pose detection s kamerou — vlastní fáze).

**Sdílené komponenty:**
- `apps/mobile/src/components/v2/V2.tsx` — V2Screen, V2Display, V2SectionLabel, V2Stat, V2Button, V2Chip, V2Input, V2Ring, V2TripleRing, V2Loading, V2Row + theme tokens

**Rozšířený API klient (`apps/mobile/src/lib/api.ts`):**
- Onboarding (status, measurements, fitness test, suggested weights, complete)
- Intelligence (recovery, plateaus, weak points)
- Education (lessons, lesson detail, glossary, lesson of week)
- Home Training (quick, home, travel)
- Nutrition (goals, today, log CRUD, quick foods, auto-calc)
- AI Planner (profile, generate, break recovery, asymmetry, update)
- Social full (feed, challenges, join, search, follow, counts)

**Obrazovky reskinnuté v v2 stylu:** LoginScreen, RegisterScreen, DashboardScreen (s Triple Activity Ring hero), VideosScreen, ExercisesScreen, PlansScreen (s quick start cards), ProgressScreen, ProfileScreen (rozšířená na "Více" menu)

**Nové obrazovky:** OnboardingScreen (3-step), VyzivaScreen (s makro ringy + modal), LekceScreen, LessonDetailScreen, SlovnikScreen, DomaScreen (3 modes), AICoachScreen, CommunityScreen, ExerciseDetailScreen, PlanDetailScreen, VideoDetailScreen

**Navigace:** 5-tab bottom nav (Dnes / Trénink / Výživa / Lekce / Pokrok). Sekundární obrazovky (Cviky, Videa, Doma, AI Trenér, Komunita, Slovník) přístupné přes Profile menu nebo z Plans/Dashboard quick links. Stack screens pro detail pages.

**Nová dependency:** `react-native-svg@15.12.1` (pro Activity Rings). **Uživatel musí spustit:**
```bash
cd apps/mobile
pnpm install
npx expo install --check
```

**API URL:** Mobile teď defaultně cílí na produkční ALB (`http://fitai-production-alb-1685369378.eu-west-1.elb.amazonaws.com`). Override přes `EXPO_PUBLIC_API_URL` env.

### Skipping (do další fáze)
- Workout in-progress s kamerou + pose detection (vyžaduje native MediaPipe plugin pro RN)
- Gym session in-progress s rep counterem (stejný důvod)

---

## [v2 Swap — v2 nyní default] 2026-04-07
### Changed
- Všechny v1 stránky nahrazeny obsahem z v2. Původní URL (`/`, `/login`, `/dashboard`, `/gym`, `/vyziva`, `/lekce`, atd.) zobrazují nový design.
- Smazáno všech 21 v2 directories (`*-v2/`, `v2/`).
- Všechny interní odkazy přepsány — žádný `-v2` v codebase.
- `/plans` → 307 redirect na `/gym` (kde je nový list plánů).
- Nový route `/gym` (gym list — předtím v1 mělo jen `/gym/start` a `/gym/[sessionId]`).
- Sdílené komponenty `V2Layout` + `V2AuthLayout` zůstávají (`apps/web/src/components/v2/`).
- Stará `apps/web/src/components/layout/Header.tsx` je dead code (neimportuje ji už žádná stránka), nesmazána pro jistotu.
- `test-production.sh` upraven: curl `-L` follow redirects, `/plans` nahrazen `/gym`.

### Why
Uživatel nechce pamatovat `-v2` URL ani zachovávat legacy design.

---

## [v2 Design System — celá platforma] 2026-04-07
### Added
Kompletní redesign celé platformy v jednotném "Apple Music + Activity Rings" stylu (Jonny Ive era B+C). Stará v1 zůstává živá vedle.

**Sdílené komponenty:**
- `apps/web/src/components/v2/V2Layout.tsx` — V2Layout, V2SectionLabel, V2Display, V2Stat, V2Ring
- `apps/web/src/components/v2/V2AuthLayout.tsx` — V2AuthLayout, V2Input, V2Button

**19 nových v2 stránek:**
- `/v2` (landing), `/login-v2`, `/register-v2`, `/onboarding-v2`
- `/dashboard-v2`, `/gym-v2`, `/vyziva-v2`, `/lekce-v2`, `/progress-v2`
- `/lekce-v2/[slug]`, `/slovnik-v2`, `/exercises-v2`, `/exercises-v2/[id]`, `/plans-v2/[id]`
- `/doma-v2`, `/ai-coach-v2`, `/videos-v2`, `/videos-v2/[id]`, `/community-v2`
- `/gym-v2/[sessionId]` (gym session in-progress, reskin, logic 1:1)
- `/workout-v2/[videoId]` (video workout s pose detection, reskin, logic 1:1)

**Princip:** reskin only — žádné změny v API, žádné změny v auth flow, žádné změny v pose detection / rep counter / smart voice / safety checker. Pouze JSX + Tailwind.

**Infrastruktura:**
- Dockerfile přepnut na AWS Public ECR (`public.ecr.aws/docker/library/node:20-alpine`) — žádné Docker Hub rate limity

### Files added
17× `apps/web/src/app/(app)/*-v2/...`, 2× `apps/web/src/components/v2/*`, 1× `apps/web/src/app/v2/page.tsx`, 2× `apps/web/src/app/(auth)/*-v2/page.tsx`

---

## [Section F — Nutrition Tracking] 2026-04-07
### Added
- `FoodLog` model + `FitnessProfile.dailyKcal/Protein/Carbs/Fat` fields
- Modul `nutrition` s endpointy: `/goals`, `/goals/auto`, `/today`, `/log` (CRUD), `/quick-foods`
- TDEE výpočet (Mifflin-St Jeor + activity multiplier + goal úprava)
- 16 quick foods databáze (kuřecí, vejce, tvaroh, rýže, ovesné vločky, whey...)
- Stránka `/vyziva` — makro kruhy, jídelníček po jídlech, quick add modal, auto-výpočet z profilu
- Header link "Výživa"

### Files
- `apps/api/prisma/schema.prisma` (+ FoodLog, +daily macro fields)
- `apps/api/src/nutrition/{module,controller,service}.ts`
- `apps/web/src/app/(app)/vyziva/page.tsx`
- `apps/web/src/lib/api.ts` (+ nutrition functions)

---

## [Section E — Training Outside Gym] 2026-04-07
### Added
- `Exercise.equipment String[]` field — bodyweight = `[]`
- 6 nových bodyweight cviků: Push-up, Bodyweight Squat, Glute Bridge, Mountain Climbers, Burpees, Jumping Jacks
- Nový modul `home-training` s endpointy `/api/home-training/quick`, `/home`, `/travel`
- Stránka `/doma` se 3 tabs (Quick 15min, Doma 35min, Travel 20min)
- Header navigace: Doma

### Files
- `apps/api/prisma/schema.prisma` (+ Exercise.equipment)
- `apps/api/prisma/seed.ts` (+ bodyweight exercises + equipmentMap)
- `apps/api/src/home-training/{module,controller,service}.ts`
- `apps/web/src/app/(app)/doma/page.tsx`
- `apps/web/src/lib/api.ts` (+ home training functions)
- `apps/web/src/components/layout/Header.tsx` (+ Doma link)

---

## [Regression Prevention] 2026-04-07
### Added
- `CONTRACTS.md` — zámčená API, DB modely, frontend routes, core soubory
- `REGRESSION_TESTS.md` — checklist co testovat
- `test-production.sh` — bash script, jeden příkaz otestuje vše
- `CHANGELOG.md` — tento soubor
- `CLAUDE.md` — sekce "Regression Prevention Rules"

**Why:** Uživatel se obával že Claude bude přepisovat fungující funkce při dalším vývoji.

---

## [Section D — Education] 2026-04-07
### Added
- 8 lekcí (technique, nutrition, recovery, mindset)
- 16 termínů ve slovníku
- Lekce týdne widget na dashboardu
- Pre-workout briefing a post-workout debrief endpointy
- Stránky `/lekce`, `/lekce/[slug]`, `/slovnik`
- Header navigace: Lekce, Slovník

### Files
- `apps/api/src/education/` (module, service, controller)
- `apps/api/prisma/schema.prisma` (+ EducationLesson, GlossaryTerm)
- `apps/api/prisma/seed.ts` (+ lessons + glossary)
- `apps/web/src/app/(app)/lekce/page.tsx`
- `apps/web/src/app/(app)/lekce/[slug]/page.tsx`
- `apps/web/src/app/(app)/slovnik/page.tsx`

---

## [Section C — Onboarding + 1RM] 2026-04-07
### Added
- 3-step onboarding wizard (measurements, fitness test, review)
- 1RM test s Epley formulí
- `OneRepMax` model
- `FitnessProfile` rozšíření: age, weightKg, heightCm, onboardingDone
- Stránka `/onboarding`

---

## [Section B — Adaptive Intelligence] 2026-04-07
### Added
- `intelligence` modul: plateau detekce, recovery score, weak points, asymmetry
- Endpointy `/api/intelligence/*`
- `FitnessProfile.priorityMuscles`

---

## [Section A — Fitness Intelligence] 2026-04-07
### Added
- `Exercise.category` (compound/isolation/accessory)
- `Exercise.instructions` (JSON s detailními instrukcemi)
- `ExerciseSet.rpe`, `isWarmup`, `tempoSeconds`
- `WeeklyVolume` model
- Warmup recommendations, RPE tracking, volume tracking, exercise ordering

---

## [Phase 10 — Content Pipeline] 2026
### Added
- `content` modul (URL import, marketplace) — backend ready, mock import

## [Phase 9 — Wearables] 2026
### Added
- `wearables` modul (HR sync, recovery score) — backend ready, no mobile bridge yet

## [Phase 8 — 3D Pose] 2026
### Status
- Library ready, not wired into pipeline

## [Phase 7 — CV 2.0] 2026
### Added
- `vision` modul (rule-based equipment detection)

## [Phase 6 — Mobile RN] 2026
### Added
- React Native + Expo app
- 8 obrazovek
- Bez kamery zatím

## [Phase 5 — Social] 2026
### Added
- `social` modul: follow, feed, challenges, leaderboard
- Stránka `/community`

## [Phase 4 — PWA + Push] 2026
### Added
- Service Worker, Web App Manifest
- VAPID push notifications
- `notifications` modul

## [Phase 3 — Monetization] SKIPPED
Uživatel se rozhodl Stripe vynechat.

## [Phase 2 — Adaptive Intelligence] 2026
### Added
- `ai-planner` modul (Claude Haiku → AI plány)
- Break recovery
- Plan generation

## [Phase 1 — Smart Coach] 2026
### Added
- `coaching` modul: Claude Haiku real-time feedback
- ElevenLabs Czech voice synthesis
- Safety checker (real-time alerts)
- Fallback na Web Speech API

---

## [Initial Setup] 2026
### Added
- Monorepo (apps/api, apps/web, apps/mobile, packages/shared, infrastructure)
- NestJS + Prisma + PostgreSQL backend
- Next.js 14 + Tailwind frontend
- AWS infrastruktura: ECS Fargate, RDS, ElastiCache, S3, ALB (Terraform, 68 resources)
- CodeBuild CI/CD
- JWT auth
- MediaPipe pose detection
- Gym rep counter state machine
- XP / streak / level systém
- 8 cviků v knihovně
- Demo accounts: admin@fitai.com, demo@fitai.com
