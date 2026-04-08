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
| 6. Mobile RN | ✅ + 🟡 | 18 obrazovek v v2 designu, camera workout lite. Native MediaPipe pose detection = part 2 (TODO) |
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
| Regression test suite (54/54) | ✅ `test-production.sh` |

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

## 🚧 Co dál (priorita)

### Vysoká priorita
1. **Phase 6 part 2 — Native MediaPipe pose detection na mobilu**
   - EAS Build (custom dev build, mimo Expo Go)
   - `react-native-vision-camera` + frame processor plugin
   - Port `feedback-engine.ts`, `rep-counter.ts`, `safety-checker.ts` do RN
   - ~1 den práce, ale otevírá plný experience na telefonu

2. **TestFlight / EAS Build distribuce**
   - Apple Developer účet ($99/rok)
   - `eas build --platform ios`
   - Beta tester invites

### Střední priorita
4. **Apple HealthKit + Google Fit integrace**
   - Mobile čte sleep/steps/HR/HRV z native zdrojů
   - Auto-sync do `wearables` modulu
   - Recovery score se zlepší
   - Vyžaduje EAS Build

5. **Section K — Body progress photos**
   - Před/po fotky
   - S3 upload (vyžaduje fix S3Service)
   - Claude Vision body composition analysis
   - Galerie s před/po sliderem

6. **AI workout suggestion of the day**
   - Claude analyzuje recovery + fatigue + weekly volume
   - Vygeneruje konkrétní doporučený workout pro dnešek
   - Integrace na dashboard hero

7. **Generative meal planning**
   - Claude vygeneruje weekly meal plan podle goal + nutrition goals
   - Shopping list per týden
   - Recept storage

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
- **S3Service AWS credentials warning** — task role asi má perms ale SDK to neví
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
- **54/54 regression tests passing**
