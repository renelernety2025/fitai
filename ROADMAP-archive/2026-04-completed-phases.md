# FitAI Roadmap Archive — Completed Phases

> Archived: 2026-04-19
> Covers: Phases 1-10, Sections A-L, Infrastructure & DevOps, Web, Mobile, Backend stats
> Back-pointer: See @ROADMAP.md for active/pending priorities

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

