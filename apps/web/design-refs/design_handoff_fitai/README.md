# FIT_AI — Design Handoff Package

> **For Claude Code (or any developer)**
> Cinematic, accessible coaching platform redesign — Spring 2026
> 13 screens · React+JSX prototypes · production-grade design tokens

---

## How to use this package

### What's in here
This bundle contains **HTML/JSX design references** — fully working browser prototypes that show the intended look, layout, copy, and interaction of each screen. They are **not** the production code you should ship.

### What you (Claude Code) should do
1. **Open `index.html`** in a browser to see all 13 screens. Use the top nav pill to focus a single screen.
2. **Read this README** end-to-end before writing any code.
3. **Recreate each screen** in the target codebase (`apps/web/` Next.js + React + V2 component system) using:
   - The codebase's existing patterns, libraries, hooks, and API client (`apps/web/src/lib/api/*`)
   - The codebase's existing V2 component primitives (`apps/web/src/components/v2/*`) — extend them where needed, don't rewrite
   - The exact design tokens listed below
   - The exact copy from the prototypes
4. **Use mock data initially** if backend isn't ready. Match the data shape that the existing API client already returns.
5. **Implement screens in waves** (see "Implementation order" below) so you can ship value early.

### Fidelity
**High-fidelity (hifi).** Pixel-perfect mockups with final colors, typography, spacing, copy, and most interactions. Recreate them faithfully — but use the codebase's existing component library where it covers the same need (e.g. don't write a new `<Avatar>` if `V2Avatar` exists).

---

## Design direction

**Brand position:** A premium, calm coaching practice for everyone — not a hardcore gym brand. Audience skews women 30–40, mixed disciplines (running, yoga, strength, mobility, walking).

**Tone:** Aspirational but accessible. *"Become your strongest self."* Not *"TRAIN LIKE THEY DO."*

**Visual DNA:**
| | |
|---|---|
| Canvas | Near-black `#0B0907` warm-bias · subtle ember radial glow on hero surfaces |
| Accent | Ember `#E85D2C` — used as **signal**, not decoration. Single CTA per surface. |
| Typography | Inter Tight (display), Inter (body), Fraunces italic (accents/eyebrows), JetBrains Mono (data) |
| Imagery | Outdoor, daylight, civilian — woman running at golden hour as primary hero. NOT gym-bro lifting. |
| Mood | MasterClass × Tracksmith × Apple Music. Dignity over hype. |

---

## Design tokens

Copy these into `apps/web/src/styles/tokens.css` (or wherever your existing tokens live) and replace the V2 dark theme variables.

```css
:root {
  /* Backgrounds */
  --bg-0: #0B0907;       /* canvas */
  --bg-1: #100D0B;       /* section */
  --bg-2: #15110D;       /* card sub */
  --bg-3: #1C1814;       /* elevated */
  --bg-4: #252018;       /* hover */
  --bg-card: #131009;    /* card */
  --bg-glass: rgba(20,17,13,0.65);

  /* Text */
  --text-1: #F5EDE0;     /* primary — warm white */
  --text-2: #B8AC9A;     /* secondary */
  --text-3: #6B6356;     /* tertiary / labels */
  --text-4: #3D3830;     /* disabled */

  /* Strokes */
  --stroke-1: rgba(245,237,224,0.06);
  --stroke-2: rgba(245,237,224,0.10);
  --stroke-3: rgba(245,237,224,0.16);

  /* Accents */
  --accent: #E85D2C;       /* ember — primary action */
  --accent-hot: #FF7A4A;   /* ember light — eyebrows on dark */
  --clay: #D4A88C;         /* warm tan — italic display accents */
  --sage: #8FA68E;         /* muted green — positive deltas */

  /* Data ramp (heatmaps) */
  --d-1: #1A1611;
  --d-2: #3D2818;
  --d-3: #6B3F22;
  --d-4: #B5582C;
  --d-5: #E85D2C;

  /* Radii */
  --r-sm: 6px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 24px;
  --r-pill: 999px;

  /* Shadows */
  --shadow-pop: 0 24px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
  --shadow-ember: 0 0 32px rgba(232,93,44,0.18);

  /* Fonts */
  --font-display: 'Inter Tight', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-serif: 'Fraunces', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

**Type scale** (lifted exactly from `styles.css` — keep these names):
- `.display-1` — 96px / 700 / -0.04em (hero)
- `.display-2` — 56px / 700 / -0.025em (section heroes)
- `.display-3` — 36px / 600 / -0.02em (card titles)
- `.title` — 22px / 600 / -0.012em (sub-card titles)
- `.body` — 15px / 400 / 1.55 (paragraphs)
- `.eyebrow` — 11px / 600 / 0.08em uppercase (mono section labels)
- `.eyebrow-serif` — 13px / 400 / italic Fraunces (posh variant)
- `.numeric-display` — JetBrains Mono / 600 / -0.015em (all numbers/data)
- `.caption` — 11px / 500 (timestamps, sub-labels)

**Italic display pattern:** Display headings use a 2-line trick — main text in Inter Tight 700, then a `<br>` and an italic phrase in `var(--clay)` weight 300 Fraunces or Inter Tight italic. Example: *"Become your **strongest self.**"* This pattern is the brand signature.

---

## Screens

### Implementation order (suggested waves)

| Wave | Screens | Why first |
|---|---|---|
| **1 — Foundation** | Login, Onboarding, Landing | Public surface + first-time UX |
| **2 — Daily core** | Dashboard, Workout detail, Calendar | 80% of logged-in time |
| **3 — Differentiator** | AI Coach chat, Progress | Unique value prop |
| **4 — Daily companions** | Nutrition, Profile, Library, Community | Engagement layer |
| **5 — Mobile parity** | iOS Today + Active Workout | Ship after web stabilizes |

---

### 1. Landing — `/`
**File:** `screen-landing.jsx` · **Url shown:** `fitai.app`

**Purpose:** Public marketing homepage. Convert visitor → free trial.

**Layout:** Full-width sections stacked vertically. Sticky nav. Each section ~1440px max-width.

**Sections:**
1. **Sticky nav** — Logo · `Train · Coaches · Programs · Community · Pricing` · Sign in + Start free CTA
2. **Hero** — full-bleed image (woman running outdoor), gradient overlay; left-aligned headline *"Become your strongest self."* (italic phrase in clay), subtitle, primary CTA `Start free for 14 days`, secondary CTA `▶ Watch the film 1:42`. Floating glassmorphic "Live now" card top-right showing real-time member activity (run pace, easy zone). Bottom social proof row: 2.4M members · 4.9 App Store · 180 coaches.
3. **Marquee strip** — infinite-scroll discipline list: Walking, Running, Yoga, Strength, Mobility, Pilates, HIIT, Cycling, Recovery, Breathwork, Stretching, Endurance.
4. **Faculty (coaches)** — eyebrow "The faculty" + headline *"Coaches who meet you where you are."* · 3-column asymmetric grid, first/fourth tiles 2-row tall, cinematic portraits with hover scale + tag chips ("Featured", "New course", "Live this week" filled with accent).
5. **Feature grid** — Apple-Music-style 6-column modular grid with mixed cell sizes:
   - AI coach card (4 wide × 2 tall, gradient bg with ember radial)
   - Calendar mini (heatmap)
   - Progress mini (sparkline)
   - Live class teaser (3 wide, with bg image)
   - Community card (avatar stack + ring)
6. **Metrics bar** — 4-column: 2.4M / 184M / 92% / 4.9 (huge mono numbers)
7. **Pricing** — 3 cards: Free / Member / Family. Member is "Most popular" with ember border + gradient bg.
8. **Footer** — Logo + tagline + app store buttons + 4 link columns.

**Key copy:**
- Hero: *"Become your strongest self. World-class coaching, an AI that adapts to your body, and a community that shows up — every day, wherever you train."*
- Feature: *"One membership. Everything you need."*
- Pricing: *"Less than a single personal training session."*

---

### 2. Login — `/login`
**File:** `screen-auth-onboarding.jsx` (Login component)

**Layout:** 50/50 split.
- **Left (50%):** Hero image with gradient overlay. Logo top-left. Eyebrow + display headline *"Today's training is waiting for you."* Member photo credit bottom-left.
- **Right (50%):** Centered form (max-width 420px). Heading "Sign in" + signup link. Email/Password inputs (48px tall, dark bg, border on focus). Remember me + Forgot password row. Primary "Sign in →" button. Divider "or". Apple + Google SSO outlined buttons. Terms footnote.

**Inputs:** Use `bg-2` background, 1px stroke-2 border, 10px radius, 14px text, focus ring in accent.

---

### 3. Onboarding — `/onboarding`
**File:** `screen-auth-onboarding.jsx` (Onboarding component)

**Purpose:** 5-step flow to gather goal, experience, schedule, profile data. Mock shows step 2 (Goal) — implement all 5 steps following same pattern.

**Layout:**
- Top progress bar — Logo + 5 numbered circles (current=accent fill, done=sage with checkmark, pending=bg-3). Skip link top-right.
- Centered content (max-width 920px) — eyebrow + display heading + paragraph + selection grid + back/continue buttons.

**Step 2 (Goal):** 2-column grid of 6 cards. Each card: emoji icon (32px), title, subtitle, optional checkmark when selected. Selected card has gradient bg + accent border.

**Goal options (exact copy):**
- 🌅 Move every day — *Walks, stretches, light cardio. Show up.*
- 💪 Build strength — *Get stronger, lift more, feel capable.*
- 🏃 Run further — *5K, 10K, half-marathon, marathon.*
- 🧘 Mind & body — *Yoga, mobility, breathwork, sleep.*
- ⚖️ Lose weight — *Sustainable, no crash diets.*
- 🎯 Specific event — *Race, photoshoot, vacation, recovery.*

**Other steps to build (using same pattern):**
- Step 1 — Welcome (name, age, photo upload)
- Step 3 — Experience (radio: New / Returning / Experienced + current activity level)
- Step 4 — Schedule (days/week slider 2–7, preferred times)
- Step 5 — Profile + permissions (Apple Health / Garmin / Whoop sync, notifications opt-in)

---

### 4. Dashboard — `/today`
**File:** `screen-dashboard.jsx`

**User wanted:** *Týdenní plán hero, vzdušný layout, squad feed + dnešní workout, teplé osobní oslovení ("Good morning, Sara" + počasí).*

**Layout (when implemented per user feedback):**
- **Hero block (top):** *"Good morning, Sara."* Display-2. Sub-greeting with weather/date. Today's planned workout pill with ▶ play button + "Skip / Reschedule" secondary actions.
- **Weekly plan strip:** 7 day-cards in a row. Today highlighted with accent ring. Each card shows discipline icon + duration. Past days show ✓ or ✕ skip.
- **2-column lower:** Squad activity feed (left, ~60%) + sparse stats card (right, ~40%) showing 1–2 key numbers (streak, weekly progress ring).

**Existing prototype** is denser — should be simplified per user spec. Apple Fitness density: 1–2 hero numbers, lots of breathing room, no info overload.

---

### 5. Workout detail — `/workout/[id]`
**File:** `screen-workout.jsx`

**Purpose:** Pre-workout briefing screen — what you'll do, who designed it, how long. Single big "Begin" CTA.

**Layout:**
- Full-bleed hero image with gradient
- Block-by-block plan (warm-up · main · cool-down) with duration + movement count per block
- Right sidebar: history (last 3 times you did this), squad members who completed it today
- Sticky bottom: "Begin workout →" primary CTA with countdown after press

---

### 6. Calendar — `/calendar`
**File:** `screen-calendar.jsx`

**Layout:**
- **Top:** Periodization timeline (12-week view) with phase blocks (Base · Build · Peak · Deload)
- **Middle:** Month grid with workout dots
- **Bottom:** 52-week year heatmap (GitHub style with ember ramp)

---

### 7. AI Coach — `/ai-coach`
**File:** `screen-coach-progress-nutrition-profile.jsx` (AICoach component)

**Layout:** 3-column. 280px sidebar · flexible chat · 320px context panel.

- **Left sidebar:** "Your coaches" list with avatars, role labels, online dots, unread badges. "Quick prompts" list below.
- **Center chat:** Header with active coach + voice call button. Message bubbles (user=accent fill right, coach=card bg left, max-width 70%). Special message types: workout-swap card with strikethrough old plan + new plan with accept button. Input bar at bottom: attachment + send.
- **Right context:** "What Maya sees" — privacy-conscious data panel. Recovery score, sleep sparkline (last 7), this week summary. Privacy link footer.

**Coaching memory note:** Backend module `coaching-memory` should provide previous insights to be referenced in chat.

---

### 8. Progress — `/progress`
**File:** `screen-coach-progress-nutrition-profile.jsx` (Progress component)

**Layout:** Stacked sections.
1. Hero heading: *"12 weeks of becoming."*
2. **4-stat strip:** Total volume / 5K time / Sessions / Sleep avg — each card has eyebrow, big mono number, sage delta, sparkline (sage colored).
3. **Body photos card:** 6-thumbnail grid (Wk 1 → Wk 12), current week ringed in accent. "+ Add photo" button.
4. **Personal records card:** 6-card grid: Back squat / Deadlift / Bench / 5K / Plank / Pull-ups. Each shows lift name, big value, when achieved, delta.

---

### 9. Nutrition — `/vyziva`
**File:** `screen-coach-progress-nutrition-profile.jsx` (Nutrition component)

**Layout:**
1. Header: *"Eat for energy."* + "+ Log a meal" CTA
2. **Top row (2/3 + 1/3):** Big macro ring (140px, kcal eaten/target) + macro breakdown bars (P/C/F). Hydration card with 8-cell glass grid.
3. **Today's meals card:** Time-stamped list. Each row: timestamp · 48px food image · meal name + macros · kcal big number. Unlogged meals show dashed border placeholder.

---

### 10. Library — `/library`
**File:** `screen-library-community.jsx` (Library component)

Coach roster grid in MasterClass style. Same DNA as landing's faculty section but expanded with filter chips (discipline, level, language) and 12+ coaches.

---

### 11. Community — `/community`
**File:** `screen-library-community.jsx` (Community component)

Feed with PR cards, streak cards, workout-completed cards. Weekly challenge banner.

---

### 12. Profile — `/profile`
**File:** `screen-coach-progress-nutrition-profile.jsx` (Profile component)

**Layout:**
1. **Hero banner** (280px tall, full-width image, fade to bg-0)
2. **Profile header** (overlaps banner): 144px avatar with 4px bg-0 ring · Name display-2 · location + bio · Share + Settings buttons
3. **5-stat strip:** Streak · Sessions · Squad rank · XP · Achievements
4. **Achievements card:** 6 emoji-titled cards in a row

---

### 13. Mobile screens
**File:** `screen-mobile.jsx`

Two screens shown in iOS frame (402×874):
- **Today** — daily home, mirrors desktop dashboard but compressed to 2×2 stat grid + hero card.
- **Active workout** — full-bleed no-chrome screen: big rep counter, live form cues, rest timer ring, voice coach indicator.

---

## Components to extract

These reusable primitives are in `primitives.jsx`. Map them to your existing V2 components — **do not duplicate.**

| Prototype name | Use case | V2 equivalent (if exists) |
|---|---|---|
| `<Button>` | Primary actions | `V2Button` |
| `<IconButton>` | Square 40px icon button with optional badge dot | `V2IconButton` |
| `<Chip>` | Filter pill | `V2Chip` |
| `<Tag>` | Mono uppercase label | `V2Tag` |
| `<Avatar>` / `<AvatarStack>` | Member portraits | `V2Avatar` |
| `<Card>` | Notion-style content block | `V2Card` |
| `<SectionHeader>` | Eyebrow + title + see-all link | `V2SectionHeader` |
| `<Metric>` | Big number with delta + sub-label | `V2Stat` |
| `<Sparkline>` | Mini line chart | new — uses raw SVG, no deps |
| `<BarChart>` | Vertical bar | new |
| `<Ring>` | Progress ring | `V2Ring` (Activity Rings) |
| `<Logo>` | FIT_AI wordmark | `V2Logo` |

**New patterns introduced (not in V2 yet — add them):**
- **Cinematic hero block:** Full-bleed image + gradient + glassmorphic floating data card. See `LandingHero` in `screen-landing.jsx`.
- **Italic display heading pattern:** Two-line headline where line 2 is italic Fraunces in `var(--clay)` weight 300. See any `display-2` use.
- **Workout-swap message card:** AI coach chat message with strikethrough old plan + new plan + accept button.
- **Faculty grid:** 3-column asymmetric (first + fourth tiles span 2 rows). Hover triggers scale 1.03 with 1.2s ease.
- **Body photo strip:** 6-thumb grid with one ringed in accent (current).

---

## Imagery & assets

**All images are Unsplash CDN URLs** in `images.js`. Replace with your own production CDN before shipping.

**Brand-critical photo direction:**
- Hero (`heroLift`): woman running outdoor — golden hour, joyful, candid. NOT gym posing.
- Coaches: 50/50 mix M/F, varied ages 25–55, varied disciplines (running, yoga, pilates, mobility, strength, walking).
- Avoid: hardcore gym lighting, dramatic chiaroscuro, single-discipline (only powerlifting), only-young-athletic-men.

---

## Files in this bundle

```
design_handoff_fitai/
├── README.md                                            ← you are here
├── index.html                                           ← entrypoint, open in browser
├── styles.css                                           ← global tokens + classes
├── images.js                                            ← Unsplash image catalog
├── icons.jsx                                            ← inline SVG icon set
├── primitives.jsx                                       ← shared UI components
├── browser-window.jsx                                   ← chrome wrapper for screenshots
├── ios-frame.jsx                                        ← iPhone bezel
├── screen-landing.jsx                                   ← Landing
├── screen-dashboard.jsx                                 ← Dashboard (needs rework per user feedback)
├── screen-calendar.jsx                                  ← Calendar
├── screen-workout.jsx                                   ← Workout detail
├── screen-library-community.jsx                         ← Library + Community
├── screen-mobile.jsx                                    ← Mobile screens
├── screen-auth-onboarding.jsx                           ← Login + Onboarding
└── screen-coach-progress-nutrition-profile.jsx          ← AI Coach + Progress + Nutrition + Profile
```

---

## What's NOT in this package (yet)

These pages exist in the product (`MODULES.md` lists 86 web pages total) but have not been redesigned in this wave. Use the existing V2 patterns + the design tokens above when building them — they should feel like the same family.

**Wave 4–5 candidates** (pull design from prototypes when next session opens):
- Settings (account, notifications, integrations, privacy, billing)
- Form Check (camera-based AI form analysis)
- Recipes + Meal plan
- Habits / Daily check-in
- Squads / Duels (1v1 challenges)
- Achievements full grid · Leagues · Streaks · Boss Fights · Skill Tree
- Marketplace · Trainers · Drops · Bundles · Wishlist
- Journal · Body portfolio · Records deep-dive
- Live class catalog + class player
- Discover Weekly · Wrapped · Seasons (battle pass)

---

## Questions for the original design conversation

If implementing reveals ambiguity, the user (Mirek, gmail) should be re-consulted on:
- Light mode variant — discussed, deferred. Default is dark only for now.
- Czech localization — strings shown in English. Existing app has Czech UI; route copy through your existing i18n.
- Density on Dashboard — user explicitly chose Apple Fitness density (vzdušný), so the existing prototype `screen-dashboard.jsx` should be **rebuilt lighter** per "Dashboard" notes above.
- Hero photo licensing — current Unsplash images are placeholders. Commission or license real talent photography before launch.

---

**Last updated:** Spring 2026 design exploration
**Designer of record:** Cinematic Coach v1
**Implementation target:** `apps/web/` (Next.js + React + V2 component system)
