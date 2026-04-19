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

## ✅ Hotovo

Phases 1-10 ✅ · Sections A-L ✅ · Infrastructure ✅ · Web 19 pages ✅ · Mobile 18 screens ✅ · Backend 28 modulů ✅

> Detail: @ROADMAP-archive/2026-04-completed-phases.md

---

_Sekce níže (Scale Readiness, Mobile Launch, Co dál) zůstávají aktivní._


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
