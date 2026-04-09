# FitAI — Roadmap & Progress

> Aktualizováno: 2026-04-08

## 🎯 Production
- **Web (HTTPS):** https://fitai.bfevents.cz
- **API:** https://fitai.bfevents.cz/api
- **GitHub:** https://github.com/renelernety2025/fitai
- **AWS:** eu-west-1, account 326334468637, profile `fitai`

## 🔑 Demo
- demo@fitai.com / demo1234
- admin@fitai.com / demo1234

---

## ✅ Hotovo (kompletní stav)

### Foundation (Phases 1-10)
| Phase | Status | Co |
|-------|--------|-----|
| 1. Smart Coach | ✅ | Claude Haiku coaching, ElevenLabs Czech voice, safety checker, audio ducking |
| 2. Adaptive Intelligence | ✅ | AI plans, break recovery, periodization, asymmetry detection |
| 3. Monetization | ❌ SKIPPED | Stripe vynechán uživatelem |
| 4. PWA + Push | ✅ | Service worker, manifest, VAPID model + Expo push (Section J part) |
| 5. Social | ✅ | Follow, feed, challenges, leaderboard |
| 6. Mobile RN | ✅ | 18+ obrazovek v v2 designu, camera workout lite + **Native pose detection (Phase 6 part 2)** — ML Kit Pose + VisionCamera + EAS dev build |
| 7. Vision (CV 2.0) | 🟡 | Rule-based pose detection. YOLO ne |
| 8. 3D Pose | 🟡 | Library ready, ne v live workoutu |
| 9. Wearables | 🟡 | Backend ready, no HealthKit/Fit bridge |
| 10. Content Pipeline | 🟡 | Backend ready, mock import |

### Sections A-J (deeper systematics)
| Section | Status | Co |
|---------|--------|-----|
| A. Fitness Intelligence | ✅ | Warmup, RPE, weekly volume, exercise ordering, compound/isolation/accessory |
| B. Adaptive Learning | ✅ | Plateau detection, recovery score, weak points, asymmetries |
| C. Onboarding + 1RM | ✅ | 3-step wizard, Epley formula, suggested working weights |
| D. Education | ✅ | 8 lekcí, 16 glossary terms, lesson of week, briefings, debriefs |
| E. Training Outside Gym | ✅ | Doma/travel/quick workouts, 6 bodyweight cviků, /doma stránka |
| F. Nutrition Tracking | ✅ | TDEE výpočet, food log, makro kruhy, 16 quick foods, /vyziva |
| G. Habits & Daily Check-in | ✅ | DailyCheckIn model, recovery score, streak, /habity, mobile tab |
| H. AI Brain | ✅ | Claude recovery tips + weekly review + nutrition tips, 1h cache |
| I. *(přeskočeno, použito jako obecná infra)* | — | — |
| J. Gamification | ✅ | 17 achievements, auto-unlock + XP rewards, /uspechy, mobile screen |
| K. Body Progress Photos | ✅ | BodyPhoto + BodyAnalysis modely, S3 upload, Claude Vision analýza, before/after slider, /progres-fotky web + mobile |
| L. Generative Meal Planning | ✅ | MealPlan model, Claude Haiku 7-day jídelníček + shopping list, /jidelnicek web + mobile, day picker, regenerate s preferences |

### Infrastructure & DevOps
| Co | Status |
|----|--------|
| AWS ECS Fargate (api + web) | ✅ |
| AWS RDS PostgreSQL | ✅ |
| AWS ElastiCache Redis | ✅ |
| AWS S3 + CloudFront | ✅ |
| AWS CodeBuild (API + Web) | ✅ |
| AWS Public ECR base images | ✅ (no Docker Hub rate limits) |
| **GitHub Actions auto-deploy** (OIDC, paths-filter, smoke test) | ✅ |
| **HTTPS** přes ACM + ALB 443 listener | ✅ `fitai.bfevents.cz` |
| HTTP → HTTPS 301 redirect | ✅ |
| Real AI keys (Claude, ElevenLabs, OpenAI) v Secrets Manager | ✅ |
| ECS task def s injektovanými secrets | ✅ revision 3 |
| Push notifications (Expo) | ✅ Mobile auto-register, sendStreakReminders sends both |
| VAPID web push keys | ✅ (2026-04-08, fitai-api:4) |
| Mobile API URL → HTTPS default | ✅ |
| Regression test suite (58/58) | ✅ `test-production.sh` |

### Web (Next.js 14)
- ✅ Kompletní v2 design system (Apple Music + Activity Rings, Jonny Ive era B+C)
- ✅ 19 stránek + landing v jednotném stylu
- ✅ Sdílené komponenty `V2Layout` + `V2AuthLayout`
- ✅ HTTPS — kamera + pose detection funguje v reálu
- ✅ Real-time pose feedback (MediaPipe + Claude + ElevenLabs)

### Mobile (React Native + Expo SDK 54)
- ✅ Kompletní v2 design system (RN port, react-native-svg pro rings)
- ✅ 18 obrazovek + 5 tabů (Dnes/Trénink/Výživa/Habity/Lekce/Pokrok)
- ✅ Camera workout lite (`expo-camera` mirror + manual rep counter + RPE + rest timer + haptics)
- ✅ Expo push notifications (auto-register + test button)
- ✅ Default API URL na HTTPS
- ✅ Funguje v Expo Go + via tunnel mode

### Backend (NestJS 10)
- **26 NestJS modulů:** auth, users, videos, preprocessing, sessions, progress, exercises, workout-plans, gym-sessions, adaptive, coaching, ai-planner, notifications, social, vision, wearables, content, intelligence, onboarding, education, prisma, health, home-training, nutrition, habits, ai-insights, achievements
- **30+ DB modelů** (User, Exercise, GymSession, ExerciseSet, FitnessProfile, OneRepMax, EducationLesson, GlossaryTerm, FoodLog, DailyCheckIn, Achievement, AchievementUnlock, ...)
- **`/api/*` global prefix** — žádné kolize s Next.js page paths
- Real Claude Haiku coaching + ElevenLabs Czech voice (ne mock fallback)

---

## 📏 Scale Readiness

Plán jak připravit platformu na **1M+ DAU** bez plýtvání. Kompletní systematika v [`SCALING.md`](./SCALING.md).

**4 vrstvy podle ROI:**
1. **Vrstva 1** — FREE quick wins: caching, indexy, rate limiting, autoscaling (~1 den, +$20/mo, 100× capacity)
2. **Vrstva 2** — Observability: CloudWatch, Sentry, structured logging (~půl dne, +$26/mo)
3. **Vrstva 3** — Load testing: k6, 4 scenarios, data-driven bottleneck detection (~1 den, $0)
4. **Vrstva 4** — Paid upgrades: RDS r6g.large, read replicas, Fargate Spot (jen podle load test dat)

**Aktuální stage:** Launch (0-100 DAU). Vrstvy 1-3 plánovány na tento týden.

---

## 📱 Mobile App Store Launch Plan (2026-04-09 +2 týdny)

**Kompletní 8-fázový plán v CHANGELOG.md** — od dnešního dev buildu po veřejné vydání v App Store.

| Fáze | Čas | Co |
|---|---|---|
| 1. Dev build | Dnes | Expo-camera switch, test na iPhonu |
| 2. Bug fixes | Zítra | Oprava QA issues |
| 3. TestFlight preview | Den 3 | 5-10 beta testerů |
| 4. TestFlight iterace | Dny 4-7 | Feedback → fixy → new builds |
| 5. App Store compliance | Dny 8-9 | Privacy policy, TOS, AI disclaimer, account deletion, metadata |
| 6. Production build + submit | Den 10 | `eas submit --profile production` |
| 7. Apple Review | Dny 11-13 | Čekání, možná 1 round rejection fixes |
| 8. 🚀 Release | Den 14 | Veřejně v App Store |

**Timeline: ~2 týdny od teď.**

---

## 🚧 Co dál (priorita)

### Vysoká priorita — Scale Readiness Week (2026-04-08 až 04-12)

**Week plan:** 5 dní práce, připravit platformu na alpha launch.

1. **Den 1 (Dnes)** — Phase 6 part 2 — Native MediaPipe pose detection na mobilu
   - EAS Build (custom dev build, mimo Expo Go)
   - `react-native-vision-camera` + Google ML Kit Pose plugin
   - Port `feedback-engine.ts`, `rep-counter.ts`, `safety-checker.ts` z webu do RN
   - TestFlight ready (Apple Developer účet už je)

2. **Den 2** — SCALING.md Vrstva 1: FREE quick wins
   - Aggressive caching (Redis) pro 10 klíčových endpointů
   - Database indexy audit + fix chybějících
   - Rate limiting per endpoint (`@nestjs/throttler`)
   - ECS autoscaling 1-3 → 2-20 s CPU target tracking
   - ALB timeout tuning + Prisma connection pooling

3. **Den 3** — SCALING.md Vrstva 2: Observability
   - CloudWatch dashboard (API/Web/RDS/Redis/ALB metriky)
   - CloudWatch alarmy + SNS email (10 alarmů)
   - Sentry integration (backend + mobile + web)
   - Structured JSON logging (nestjs-pino)
   - AI usage custom metrics (Claude tokens/den)

4. **Den 4** — SCALING.md Vrstva 3: Load testing
   - k6 install + 4 test scenarios
   - Baseline run proti produkci
   - Identifikace top 3 bottlenecks
   - První optimalizace + re-test

5. **Den 5** — Polish + produkce ready
   - Bug fixes ze Sentry
   - Performance regression guards
   - Backup/restore test
   - Alpha launch go/no-go decision

### Střední priorita
4. **Apple HealthKit + Google Fit integrace**
   - Mobile čte sleep/steps/HR/HRV z native zdrojů
   - Auto-sync do `wearables` modulu
   - Recovery score se zlepší
   - Vyžaduje EAS Build

5. ~~**Section K — Body progress photos**~~ ✅ HOTOVO 2026-04-08
   (BodyPhoto + BodyAnalysis modely, Claude Vision, before/after slider,
   web + mobile parita, S3Service fix, IAM task role rozšířena)

6. ~~**AI workout suggestion of the day**~~ ✅ HOTOVO 2026-04-08 (AI Coach Daily Brief, V2DailyBrief hero)

7. ~~**Generative meal planning**~~ ✅ HOTOVO 2026-04-08 (Section L, MealPlan model, Claude Haiku, web + mobile, shopping list)

### Nízká priorita / nice to have
8. **Apple Watch app** — quick rep counter + heart rate stream
9. **Voice activation** — "Hey FitAI" → start workout
10. **Live group classes** — multiple cameras synced via WebRTC
11. **Trainer marketplace** — externí trenéři publikují plány (revenue split)
12. **Export workout history** → CSV/PDF
13. **Supersety + giant sets v plan editoru**
14. **Custom exercise builder** — uživatel si vytvoří vlastní cvik
15. **Photo-based food recognition** — Florence-2 nebo Claude Vision

### Polish / iterace
- Iterace v2 designu podle uživatelského feedbacku
- Empty states a první-krát UX
- Onboarding tooltips
- Animations (Framer Motion / Reanimated)

---

## 📋 Technical Debt

### Vyřešeno ✓
- ~~HTTPS na produkci~~ → ✅ fitai.bfevents.cz
- ~~Local Docker broken~~ → ✅ AWS Public ECR
- ~~Real AI keys~~ → ✅ Secrets Manager
- ~~Mobile bez kamery~~ → 🟡 lite verze, full v Phase 6 part 2
- ~~CodeBuild manual trigger~~ → ✅ GitHub Actions auto-deploy přes OIDC (2026-04-08)
- ~~VAPID web push keys missing~~ → ✅ Secrets Manager + ECS task def rev 4 (2026-04-08)

### Aktivní
- **TypeScript decorators relaxed** — `strictNullChecks: false` (NestJS interop)
- **No real seed videos** — pouze 3 picsum placeholdery
- ~~S3Service AWS credentials warning~~ → ✅ Fixed 2026-04-08 (init unconditional, task role auto-discover)
- **Weekly volume aggregation** — bez ECS scheduled task na reset/agregaci

---

## 🛡️ Regression Prevention

- **`test-production.sh`** — 54 testů (API + frontend pages + routing sanity), spouštět před každým deployem
- **`CONTRACTS.md`** — zámčené API + DB modely + core soubory
- **`CHANGELOG.md`** — lidsky čitelná historie všech sekcí
- **`memory/project_state.md`** — current state pro Claude Code napříč sessions

### Workflow při nové feature
1. Implementuj feature
2. `bash test-production.sh` — všech 54 musí projít
3. Commit + push
4. CodeBuild build (api/web)
5. Force ECS deploy
6. Update CHANGELOG, ROADMAP, memory
7. Pokud nový modul → CONTRACTS.md (přidat endpointy + DB pole)

---

## 📊 Stats (2026-04-08)

- **26 NestJS modules**
- **30+ DB models**
- **19 web pages** (kompletní v2 design)
- **18 mobile screens** (kompletní v2 design)
- **17 achievements**
- **8 cviků s pose detection**
- **8 education lessons**
- **16 glossary terms**
- **15 quick foods**
- **3 home workout modes** (quick/home/travel)
- **61/61 regression tests passing**
- **Section K Body Progress Photos** (Claude Vision, before/after slider)
- **Section L Generative Meal Planning** (Claude Haiku, 7-day plan, shopping list)
- **AI Coach Daily Brief** (flagship hero, mood-driven)
