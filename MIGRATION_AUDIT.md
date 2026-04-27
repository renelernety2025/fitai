# FitAI v3 Design Migration Audit

> Vytvořeno: 2026-04-27
> Zdroj: `~/Downloads/design_handoff_fitai/`
> Scope: 31 designovaných povrchů → 8 fází rolloutu

---

## V2 Komponenty → v3 Status

| Komponenta | Soubor | Účel | v3 Status | Akce |
|---|---|---|---|---|
| V2Layout | V2Layout.tsx (348L) | App frame, nav (20+27 items) | **REPLACE** | Nový sidebar layout dle screen-dashboard.jsx |
| V2AuthLayout | V2AuthLayout.tsx (91L) | Auth stránky wrapper | **REPLACE** | Split-screen layout dle screen-auth-onboarding.jsx |
| V2DailyBrief | V2DailyBrief.tsx (191L) | Dashboard hero card | **REPLACE** | Nový TodayHero dle screen-dashboard.jsx |
| GlassCard | GlassCard.tsx (27L) | Glassmorphism container | **EXTEND** | Přidat v3 tokeny, zachovat API |
| motion.tsx | motion.tsx (111L) | FadeIn, StaggerContainer, atd. | **KEEP** | Beze změny, core animace |
| Skeleton | Skeleton.tsx (56L) | Loading shimmer | **KEEP** | Přidat avatar/card varianty |
| CommandPalette | CommandPalette.tsx (264L) | Cmd+K navigace | **EXTEND** | Update route list pro v3 |
| BottomSheet | BottomSheet.tsx (91L) | Modal sheet | **EXTEND** | Přidat v3 styling |
| MoodPicker | MoodPicker.tsx (64L) | 5-point emoji mood | **KEEP** | Bez změny |
| BreathingExercise | BreathingExercise.tsx (107L) | Box breathing | **KEEP** | Bez změny |
| OnboardingSpotlight | OnboardingSpotlight.tsx (153L) | Tour guide | **EXTEND** | Update selektory pro v3 |
| ParticleCelebration | ParticleCelebration.tsx (99L) | Burst particles | **KEEP** | Bez změny |
| Confetti | Confetti.tsx (47L) | Konfety efekt | **KEEP** | Bez změny |
| LazySection | LazySection.tsx (42L) | IntersectionObserver | **KEEP** | Bez změny |
| ParallaxHeader | ParallaxHeader.tsx (47L) | Scroll parallax | **KEEP** | Použít v hero sekcích |
| TrendArrow | TrendArrow.tsx (27L) | ↑↓ trend indikátor | **KEEP** | Bez změny |
| V2Tooltip | V2Tooltip.tsx (58L) | Hover tooltip | **KEEP** | Bez změny |

**Nové v3 primitiva (v primitives.jsx, neexistují v kódu):**

| Primitiva | v3 Zdroj | Popis | Priorita |
|---|---|---|---|
| Button | primitives.jsx | primary/accent/ghost/glass, sm/md/lg | Phase 0 |
| Card | primitives.jsx | Hover variant, padding prop | Phase 0 |
| Tag | primitives.jsx | Uppercase mono label | Phase 0 |
| Chip | primitives.jsx | Filter pill s active state | Phase 0 |
| Avatar | primitives.jsx | Circular portrait, online dot, ring | Phase 0 |
| AvatarStack | primitives.jsx | Overlapped avatars | Phase 0 |
| SectionHeader | primitives.jsx | Eyebrow + display-3 + action | Phase 0 |
| Metric | primitives.jsx | Big number + delta + sub | Phase 0 |
| Sparkline | primitives.jsx | Mini SVG line chart | Phase 0 |
| BarChart | primitives.jsx | Vertical bars | Phase 0 |
| Ring | primitives.jsx | Progress ring (keep Activity Rings logic) | Phase 0 |
| Logo | primitives.jsx | FIT_AI wordmark | Phase 0 |

---

## CSS Token Mapping (v2 → v3)

| v2 Var | v2 Value | → v3 Var | v3 Value | Akce |
|---|---|---|---|---|
| `--bg-primary` | #000000 | `--bg-0` | #0B0907 | **ALIAS** (zachovat v2 jako fallback) |
| `--bg-secondary` | #0a0a0a | `--bg-1` | #100E0B | ALIAS |
| `--bg-surface` | rgba(255,255,255,0.03) | `--bg-glass` | rgba(245,237,224,0.035) | ALIAS |
| `--text-primary` | #ffffff | `--text-1` | #F5EDE0 | ALIAS |
| `--text-secondary` | rgba(255,255,255,0.55) | `--text-2` | #BFB4A2 | ALIAS |
| `--text-muted` | rgba(255,255,255,0.40) | `--text-3` | #847B6B | ALIAS |
| `--border` | rgba(255,255,255,0.08) | `--stroke-1` | rgba(245,237,224,0.06) | ALIAS |
| — | — | `--bg-2` | #181511 | **NEW** |
| — | — | `--bg-3` | #221E18 | NEW |
| — | — | `--bg-4` | #2D2920 | NEW |
| — | — | `--bg-card` | #14110D | NEW |
| — | — | `--text-4` | #4A4338 | NEW |
| — | — | `--accent` | #E85D2C | NEW (replaces #FF375F) |
| — | — | `--accent-hot` | #F47A4D | NEW |
| — | — | `--clay` | #D4A88C | NEW |
| — | — | `--sage` | #A8B89A | NEW |
| — | — | `--stroke-2` | rgba(245,237,224,0.10) | NEW |
| — | — | `--stroke-3` | rgba(245,237,224,0.16) | NEW |

**Fonty:**
| Účel | v2 | v3 | Akce |
|---|---|---|---|
| Display | system-ui | Fraunces (italic serif) | **NEW** via next/font |
| Display alt | — | Inter Tight | NEW |
| Body | system-ui | Inter | NEW |
| Mono/data | — | JetBrains Mono | NEW |

---

## Routes → v3 Status

### REPLACE (existují, redesign)

| Route | Popis | v3 Fáze | v3 Reference |
|---|---|---|---|
| `/` | Landing page | Phase 1 | screen-landing.jsx |
| `/login` | Přihlášení | Phase 1 | screen-auth-onboarding.jsx |
| `/onboarding` | Onboarding wizard | Phase 1 | screen-auth-onboarding.jsx |
| `/dashboard` | Hlavní dashboard | Phase 2 | screen-dashboard.jsx |
| `/calendar` | Kalendář tréninků | Phase 2 | screen-calendar.jsx |
| `/gym/[sessionId]` | Aktivní trénink | Phase 3 | screen-workout.jsx |
| `/form-check` | AI form analýza | Phase 3 | screen-form-recipes-meal.jsx |
| `/exercises` | Knihovna cviků | Phase 4 | screen-library-community.jsx |
| `/trainers` | Trenéři | Phase 4 | screen-marketplace-live.jsx |
| `/marketplace` | Marketplace | Phase 4 | screen-marketplace-live.jsx |
| `/community` | Sociální feed | Phase 5 | screen-library-community.jsx |
| `/squads` | Squad systém | Phase 5 | screen-social-gamification.jsx |
| `/duels` | 1v1 duely | Phase 5 | screen-social-gamification.jsx |
| `/uspechy` | Achievementy | Phase 5 | screen-social-gamification.jsx |
| `/leagues` | Ligy | Phase 5 | screen-social-gamification.jsx |
| `/streaks` | Streak heatmap | Phase 5 | screen-habits-streaks.jsx |
| `/habity` | Daily check-in | Phase 5 | screen-habits-streaks.jsx |
| `/boss-fights` | Boss fights | Phase 5 | screen-settings-journal-misc.jsx |
| `/vyziva` | Výživa hub | Phase 6 | screen-coach-progress-nutrition-profile.jsx |
| `/recepty` | Recepty | Phase 6 | screen-form-recipes-meal.jsx |
| `/jidelnicek` | Meal plan | Phase 6 | screen-form-recipes-meal.jsx |
| `/journal` | Deník | Phase 6 | screen-settings-journal-misc.jsx |
| `/progress` | Pokrok | Phase 7 | screen-coach-progress-nutrition-profile.jsx |
| `/records` | Osobní rekordy | Phase 7 | screen-settings-journal-misc.jsx |
| `/profile` | Profil | Phase 7 | screen-coach-progress-nutrition-profile.jsx |
| `/settings` | Nastavení | Phase 7 | screen-settings-journal-misc.jsx |
| `/ai-coach` | AI Coach chat | Phase 8 | screen-coach-progress-nutrition-profile.jsx |
| `/discover-weekly` | Discover Weekly | Phase 8 | screen-settings-journal-misc.jsx |
| `/wrapped` | Wrapped recap | Phase 8 | screen-settings-journal-misc.jsx |

### NEW (neexistují, vytvořit)

| Route | Popis | v3 Fáze |
|---|---|---|
| `/live` | Live class katalog | Phase 4 |
| `/live/[id]` | Live class player | Phase 4 |
| `/coach/[slug]` | Trainer detail (nový slug pattern) | Phase 4 |
| `/quests` | Boss Fights + Skill Tree | Phase 5 |
| `/recipes/[slug]` | Recipe detail | Phase 6 |
| `/meal-plan` | Meal plan weekly grid | Phase 6 |
| `/settings/[section]` | Settings sub-routes | Phase 7 |
| `/discover` | Discover Weekly (nový path) | Phase 8 |
| `/wrapped/[year]` | Wrapped per year | Phase 8 |

### KEEP (beze změny, jen v3 tokeny)

Zbylých ~50 routes (supplements, gear, maintenance, coaching-notes, clips, playlists, drops, vip, bundles, wishlist, routine-builder, bloodwork, rehab, body-portfolio, export, micro-workout, sports, atd.) — aplikovat v3 tokeny přes V2Layout upgrade, žádný individuální redesign.

### DELETE (kandidáti na odstranění)

| Route | Důvod |
|---|---|
| `/design-test` | Prototyp — nahradit `/design-system` stránkou |
| `/design-test-2` to `-5` | Prototypy — smazat po Phase 0 |
| `/body-report` | Prototyp — přesunout obsah do `/progress` |
| `/landing-v3` | Nahrazena novou `/` po Phase 1 |
| `/login-v3` | Nahrazena novou `/login` po Phase 1 |
| `/onboarding-v3` | Nahrazena novou `/onboarding` po Phase 1 |

---

## Ikony

| Systém | Počet | Status |
|---|---|---|
| FitIcons (custom SVG) | 36 ikon | **KEEP** — rozšířit o chybějící z icons.jsx |
| icons.jsx (design handoff) | 24 ikon | **MERGE** — přidat calendar, play, pause, compass, sparkles, mic, message, bell, filter, sort, more, eye |

---

## Backend Endpointy — Status

Design plán předpokládal, že squads/duels/achievements/leagues chybí. **Všechny existují:**

| Endpoint | Status | Modul |
|---|---|---|
| `/api/squads/*` | ✅ Existuje (7 EP) | squads |
| `/api/duels/*` | ✅ Existuje (6 EP) | duels |
| `/api/leagues/*` | ✅ Existuje (3 EP) | leagues |
| `/api/achievements/*` | ✅ Existuje (4 EP) | achievements |
| `/api/habits/*` | ✅ Existuje (4 EP) | habits |
| `/api/streak-freeze/*` | ✅ Existuje (2 EP) | streak-freeze |
| `/api/form-check/*` | ✅ Existuje (3 EP) | form-check |
| `/api/coaching-memory/*` | ✅ Existuje (4 EP) | coaching-memory |
| `/api/supplements/*` | ✅ Existuje (6 EP) | supplements |
| `/api/daily-quests/*` | ✅ Existuje (2 EP) | daily-quests |

**Chybí pro v3:**
| Endpoint | Potřeba | Fáze |
|---|---|---|
| `/api/live/*` | Live class streaming | Phase 4 |
| `/api/recipes/[slug]` | Recipe detail | Phase 6 |
| `/api/settings/*` | Settings sub-routes | Phase 7 |

---

## Feature Flagy

```
ff_v3_design     — master kill switch (Phase 0 tokeny/typografie)
ff_v3_auth       — Phase 1 (login, onboarding)
ff_v3_dashboard  — Phase 2 (dashboard, calendar)
ff_v3_workout    — Phase 3 (workout flow, form check)
ff_v3_library    — Phase 4 (library, marketplace)
ff_v3_live       — Phase 4 (live classes)
ff_v3_social     — Phase 5 (community, squads, duels, achievements, leagues)
ff_v3_nutrition  — Phase 6 (nutrition, recipes, meal plan, journal)
ff_v3_settings   — Phase 7 (progress, records, settings, profile)
ff_v3_ai         — Phase 8 (AI coach, discover, wrapped)
```

---

## Rizika

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|---|---|---|---|
| Token swap rozbije 74 stránek | Medium | High | Aliasy v2→v3, phase 0 za ff_v3_design |
| V2Layout rewrite naruší navigaci | High | High | Inkrementální update, ne rewrite |
| Font loading CLS | Medium | Medium | next/font (self-hosted, no CLS) |
| Dashboard "vzdušný" vs prototyp "dense" | Medium | Low | Zjednodušit dle user feedbacku |
| Light mode | Medium | Medium | v3 tokeny dark-only zatím, light later |

---

## Doporučený postup

1. ✅ **Schválit tento audit**
2. Phase 0: Foundation (tokeny + primitiva + fonty)
3. Phase 1: Auth & Onboarding
4. Phase 2: Dashboard & Calendar
5. Phase 3–8 dle IMPLEMENTATION_PLAN.md
