# FitAI — Module Index

> 84 modulů · 388 endpointů · 121 DB modelů · 88 web stránek · 47 mobile screens
> Aktualizováno: 2026-05-04

## Jak používat

Před úpravou modulu přečti jeho soubory:
```bash
# Přehled modulu
ls apps/api/src/<module>/

# Endpointy
grep -n "@Get\|@Post\|@Put\|@Patch\|@Delete" apps/api/src/<module>/*.controller.ts

# Frontend stránka
cat apps/web/src/app/\(app\)/<page>/page.tsx

# API client funkce
grep -A2 "export function" apps/web/src/lib/api/<domain>.ts | grep <module>
```

## Backend moduly (83)

### Auth & Users
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| auth | /auth | 5 | JWT login/register/password-reset | login, register | LoginScreen |
| users | /users | 8 | Profil, settings, titles, brand | profile, settings | ProfileScreen |
| onboarding | /onboarding | 7 | Fitness profil, 1RM, measurements | onboarding | OnboardingScreen |

### Workouts & Training
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| exercises | /exercises | 8 | Knihovna 60+ cviků s fázemi + pgvector semantic search | exercises, exercises/[id] | ExercisesScreen |
| workout-plans | /workout-plans | 6 | Plány (PPL, Upper/Lower, Custom) | plans, plans/[id] | PlansScreen |
| gym-sessions | /gym-sessions | 6 | Tracking setů, formScore, RPE | gym/[sessionId] | CameraWorkoutScreen |
| sessions | /sessions | 5 | Video workout sessions | workout | CameraWorkoutScreen |
| home-training | /home-training | 3 | Bodyweight quick/home/travel | doma | DomaScreen |
| calendar | /calendar | 5 | Scheduled workouts | calendar | CalendarScreen |
| records | /records | 3 | PR board + sector times | records | RecordsScreen |
| form-check | /form-check | 3 | AI video analýza formy (Claude Vision) | form-check | FormCheckScreen |

### AI & Coaching
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| coaching | /coaching | 9 | Real-time feedback, TTS, SSE streaming | ai-coach | AICoachScreen |
| coaching-memory | /coaching-memory | 4 | AI paměť coaching insights | coaching-notes | CoachingNotesScreen |
| ai-planner | /ai-planner | 6 | Claude generované plány | plans/create | — |
| ai-insights | /ai-insights | 7 | Daily brief (HealthKit-aware), recovery, weekly review, RAG history-query | dashboard | DashboardScreen |
| vision | /vision | 3 | Pose estimation, form detection | form-check | FormCheckScreen |

### Nutrition & Health
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| nutrition | /nutrition | 14 | Food log, TDEE, meal plan, photo scan | vyziva, jidelnicek | VyzivaScreen |
| recipes | /recipes | 8 | Recipe CRUD + AI generation | recepty | — |
| habits | /habits | 4 | DailyCheckIn (sleep/energy/stress) | habity | HabityScreen |
| supplements | /supplements | 6 | Stack tracker, daily checklist | supplements | SupplementsScreen |
| bloodwork | /bloodwork | 4 | Lab results tracking | bloodwork | — |
| rehab | /rehab | 5 | Injury recovery plans | rehab | — |
| maintenance | /maintenance | 5 | Body service book, deload alerts | maintenance | MaintenanceScreen |
| wearables | /wearables | 10 | HealthKit/Health Connect sync + Oura OAuth (authorize/callback/sync/disconnect) + connections list | — | HealthSyncScreen |
| embeddings | — | 0 | OpenAI embedding wrapper (text-embedding-3-small) — shared @Global service | — | — |

### Social & Community
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| social | /social | 32 | Feed, follow, challenges, stories, reactions | community | CommunityScreen |
| buddy | /buddy | 5 | Gym partner matching (swipe) | gym-buddy | — |
| messages | /messages | 5 | 1-to-1 DMs | messages | — |
| squads | /squads | 7 | Týmy, invite, leaderboard | squads | SquadsScreen |
| duels | /duels | 6 | 1v1 challenges, XP betting | duels | DuelsScreen |
| clips | /clips | 7 | Short-form video feed (TikTok) | clips | ClipsScreen |
| playlists | /playlists | 3 | Workout music sharing | playlists | PlaylistsScreen |
| streaks | /streak-freeze | 2 | Streak freeze (max 4/měsíc) | streaks | StreaksScreen |
| posts | /posts | 8 | Instagram-style posts, photos, likes, comments | community | CommunityScreen |
| hashtags | /hashtags | 4 | Trending hashtags, search, discovery | trending | — |
| feed | /feed | 3 | Algorithmic For You, Following, Trending feeds | community | CommunityScreen |
| promo | /promo | 5 | Internal promo cards for feed | community | — |
| creator-economy | /creator-economy | 7 | XP subscriptions, tips, earnings | creator-dashboard | — |
| notify | — | 0 | Global notification creation service | — | — |
| creator-dashboard | /creator-dashboard | 13 | Creator stats, analytics, content tools | creator-dashboard | — |

### Gamification
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| achievements | /achievements | 4 | 17+ badges, auto-unlock | uspechy | UspechyScreen |
| leagues | /leagues | 3 | Weekly XP ligy (Bronze→Legend) | leagues | LeaguesScreen |
| seasons | /seasons | 4 | Battle pass, 10 missions | season | — |
| skill-tree | /skill-tree | 2 | 21 skills, 4 branches | skill-tree | — |
| boss-fights | /boss-fights | 3 | Monthly strength challenges | boss-fights | — |
| daily-quests | /daily-quests | 2 | 3 random daily micro-tasks | dashboard | — |
| wrapped | /wrapped | 1 | Spotify-style month/year recap | wrapped | — |

### Marketplace & Commerce
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| marketplace | /marketplace | 7 | Trainer listings (plans, meals) | marketplace | — |
| experiences | /experiences | 9 | Bookable fitness events (Airbnb) | experiences | ExperiencesScreen |
| trainers | /trainers | 5 | Trainer profiles + reviews | trainers, trainers/[id] | TrainersScreen |
| bundles | /bundles | 4 | Curated packages (XP purchase) | bundles | BundlesScreen |
| drops | /drops | 4 | Limited edition items + countdown | drops | DropsScreen |
| wishlist | /wishlist | 4 | Cross-platform bookmarks | wishlist | WishlistScreen |
| routine-builder | /routines | 8 | Daily routine timeline editor | routine-builder | RoutineBuilderScreen |
| vip | /vip | 4 | Invite-only tier (top 1%) | vip | VIPScreen |

### Content & Discovery
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| videos | /videos | 9 | HLS video catalog | videos | VideosScreen |
| education | /education | 6 | Lessons + glossary | lekce, slovnik | LekceScreen |
| content | /content | 7 | Trainer content imports | — | — |
| discover-weekly | /discover-weekly | 1 | AI-curated weekly mix | discover-weekly | — |
| recommendations | /recommendations | 1 | Collaborative filtering | exercises | — |

### Progress & Analytics
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| progress | — | 0 | XP + streak engine (service only) | progress | ProgressScreen |
| intelligence | /intelligence | 5 | Plateau detection, weak points | progress | ProgressScreen |
| progress-photos | /progress-photos | 6 | Body photos + Claude Vision | progres-fotky | ProgressPhotosScreen |
| body-portfolio | /body-portfolio | 1 | Compound lift portfolio score | body-portfolio | — |
| export | /export | 3 | CSV/HTML data export | export | — |
| workout-journal | /journal | 7 | Monthly journal + AI insights | journal | JournalScreen |

### Infrastructure
| Modul | Prefix | EP | Popis | Web | Mobile |
|---|---|---|---|---|---|
| health | /health | 1 | ALB health check | — | — |
| admin | /admin | 2 | Stats + analytics (admin only) | admin | — |
| notifications | — | 0 | Push (Expo + VAPID) | notifications | — |
| smart-notifications | /smart-notifications | 2 | AI timing + preferences | — | — |
| email | — | 0 | Weekly digest, streak warnings | — | — |
| preprocessing | /preprocessing | 2 | Video HLS pipeline | — | — |
| gym-finder | /gym-finder | 3 | Nearby gym reviews | gym-finder | — |
| cache | — | 0 | Redis service (7d static, 1h user) | — | — |
| metrics | — | 0 | CloudWatch + token tracking | — | — |
| prisma | — | 0 | Database ORM | — | — |
| throttler | — | 0 | Rate limiting guards | — | — |

## API Client Files (web)

```
apps/web/src/lib/api/
├── base.ts          — request(), API_BASE, auth redirect
├── auth.ts          — login, register
├── exercises.ts     — exercises, personal best
├── workouts.ts      — plans, gym sessions, calendar
├── nutrition.ts     — food log, meal plans, recipes
├── social.ts        — feed, follow, challenges, buddy, messages
├── progress.ts      — stats, body photos, habits, journal
├── coaching.ts      — AI insights, daily brief, coaching memory
├── gamification.ts  — achievements, leagues, seasons, daily quests
├── content.ts       — videos, lessons, form check
├── cross-industry.ts— duels, squads, supplements, gear, clips
├── marketplace.ts   — experiences, trainers, drops, bundles, wishlist
├── user.ts          — profile, settings, titles, brand, VIP
├── admin.ts         — admin stats
└── index.ts         — barrel re-export
```

## Key Paths

| Co | Kde |
|---|---|
| Backend moduly | `apps/api/src/<module>/` |
| Web stránky | `apps/web/src/app/(app)/<page>/page.tsx` |
| Mobile screeny | `apps/mobile/src/screens/<Screen>.tsx` |
| Prisma schema | `apps/api/prisma/schema.prisma` |
| API client | `apps/web/src/lib/api/<domain>.ts` |
| V2 komponenty | `apps/web/src/components/v2/` |
| Mobile komponenty | `apps/mobile/src/components/v2.tsx` |
| Navigace (web) | `apps/web/src/components/v2/V2Layout.tsx` |
| Navigace (mobile) | `apps/mobile/src/navigation/AppNavigator.tsx` |
