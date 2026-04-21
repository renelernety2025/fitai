# Tier 1 Features Design — AI Chat Coach, Streak Heatmap, Smart Widget

> Date: 2026-04-21
> Status: Approved
> Scope: 3 new features for FitAI web frontend + backend

---

## 1. AI Chat Coach (`/ai-chat`)

### Purpose
Full conversational AI coach "Alex" accessible outside of workouts. Users can ask about nutrition, technique, injuries, planning — anything fitness-related. Chat has conversation memory (message history as Claude context).

### Layout: Hero + Chat
- **Hero section** (top): Alex avatar (gradient circle with "A"), name "Alex", subtitle "Tvuj AI fitness trener", 3-4 suggested prompt pills
- **Chat zone** (below hero): scrollable container with message bubbles
  - User messages: gradient background (`#A8FF00` → `#00E5FF`), aligned right, dark text
  - Alex messages: dark background (`#1a1a1a`, border `#333`), aligned left, avatar circle prefix
  - Streaming indicator: "Pisu..." with pulse animation in Alex bubble
- **Input bar** (sticky bottom): rounded input field + circular send button (gradient). Enter = send.
- Hero scrolls away as conversation grows (sticky input stays)

### Suggested Prompts (examples, expand during implementation)
- "Boli me po treninku"
- "Co dnes trenovat?"
- "Kolik bilkovin potrebuju?"
- "Jak zlepsit drepy?"
- "Mam zranene koleno, co s tim?"
- "Jak na recovery po treninku?"
- "Jaky je muj pokrok?"
- "Vysvetli mi RPE"

### Backend

#### New endpoint: `POST /api/coaching/chat`
- Auth: `@UseGuards(JwtAuthGuard)`
- Rate limit: `@Throttle({ limit: 30, ttl: 3600 })` (30/hour per user)
- DTO: `ChatMessageDto`
  - `message: string` (required, max 1000 chars)
  - `conversationId?: string` (optional UUID — omit to start new conversation)
- Response: SSE stream (same protocol as `/coaching/ask-stream`)
  - `{ type: 'conversation_id', id: string }` (first event, for new conversations)
  - `{ type: 'text_delta', delta: string }`
  - `{ type: 'text_done' }`
  - `{ type: 'error', message: string }`
- Logic:
  1. If no `conversationId`, create new `CoachingSession` with `sessionType: 'chat'`
  2. Load last 20 messages from `CoachingMessage` for this session (conversation memory)
  3. Build system prompt via `buildChatSystemPrompt()` (see below)
  4. Call Claude Haiku streaming with system prompt + message history + new user message
  5. Save user message + assistant response to `CoachingMessage`
  6. After first response, generate auto-title (3-5 word summary) and update `CoachingSession.title`

#### New endpoint: `GET /api/coaching/conversations`
- Auth: `@UseGuards(JwtAuthGuard)`
- Response: `{ conversations: Array<{ id, title, lastMessage, messageCount, createdAt }> }`
- Query: `CoachingSession` where `userId` and `sessionType: 'chat'`, ordered by `createdAt DESC`, limit 20

#### New endpoint: `GET /api/coaching/conversations/:id/messages`
- Auth: `@UseGuards(JwtAuthGuard)` + ownership check (`session.userId === req.user.id`)
- Response: `{ messages: Array<{ id, role, content, createdAt }> }`
- Query: `CoachingMessage` where `coachingSessionId`, ordered by `createdAt ASC`

#### Schema changes
- Add `title String?` field to `CoachingSession` model

#### Chat system prompt (`buildChatSystemPrompt()`)
- Uses shared `buildUserPromptContext()` for personalization (age, injuries, goal, skillTier, streak, equipment)
- Different from workout coaching prompt:
  - No 12-word limit — allow thorough responses (max 200 words)
  - Markdown formatting OK (bold, lists, headers)
  - Conversational tone, not real-time coaching cues
  - Safety rules: prompt injection protection (user message in messages[], not system prompt)
  - Rule: "Odpovidas cesky. Jsi osobni fitness trener Alex. Bud odborny, motivacni, strueny ale dustojny."
  - Context: include recent workout stats, recovery score, streak for relevant answers

### Frontend

#### New file: `apps/web/src/app/(app)/ai-chat/page.tsx`
- Client component (`'use client'`)
- Uses `V2Layout` wrapper
- State: `messages[]`, `input`, `isStreaming`, `conversationId`
- SSE connection via `fetch()` + `ReadableStream` reader for streaming
- Auto-scroll to bottom on new message
- Suggested prompts disappear after first message sent
- Loading state: Alex bubble with "Pisu..." pulse

#### New file: `apps/web/src/components/chat/ChatBubble.tsx`
- Props: `role: 'user' | 'assistant'`, `content: string`, `isStreaming?: boolean`
- User: gradient bg, right-aligned
- Assistant: dark bg, left-aligned with avatar, renders markdown (bold, lists, code blocks via simple regex — no heavy markdown lib)

#### New file: `apps/web/src/components/chat/ChatInput.tsx`
- Props: `onSend: (msg: string) => void`, `disabled: boolean`
- Rounded input + send button
- Enter = send, Shift+Enter = newline
- Auto-resize textarea (max 4 lines)

#### Navigation
- Add "AI Chat" link to V2Layout nav bar (between existing items)
- Add CTA on dashboard: "Zeptej se Alexe" button/link

---

## 2. Workout Streak Calendar (heatmap on `/habity`)

### Purpose
GitHub-style activity heatmap showing 12 weeks (84 days) of daily check-in history. Visual motivation to maintain streaks.

### Placement
- On `/habity` page between recovery ring (top) and check-in form (bottom)
- New section with `V2SectionLabel` "AKTIVITA"

### Component: `ActivityHeatmap`

#### New file: `apps/web/src/components/habits/ActivityHeatmap.tsx`
- Props: `history: DailyCheckIn[]`, `streakDays: number`, `longestStreak: number`, `totalCheckIns: number`
- Grid: 7 rows (Mon-Sun) x 12 columns (12 weeks)
- Cell size: ~14x14px, gap 3px, rounded corners (2px)
- Color scale based on recovery score per day:
  - No check-in: `#1a1a1a` (near invisible)
  - Score 0-40: `#FF375F` at 60% opacity (red tint — fatigued)
  - Score 41-60: `#FF9500` at 60% opacity (orange — normal)
  - Score 61-80: `#A8FF00` at 60% opacity (lime — fresh)
  - Score 81-100: `#A8FF00` full opacity (lime — excellent)
- Today: white border ring (2px solid white)
- Hover: tooltip with date + recovery score (e.g., "19.4. — Recovery: 78/100")
- Labels: months above (e.g., Unor, Brezen, Duben), days left (Po, St, Pa — abbreviated, every other row)

#### Recovery score calculation (client-side, same formula as backend)
```
sleepScore = max(0, 100 - abs(sleepHours - 8) * 20)
energyScore = (energy / 5) * 100
sorenessScore = ((5 - soreness) / 4) * 100
stressScore = ((5 - stress) / 4) * 100
recoveryScore = (sleepScore + energyScore + sorenessScore + stressScore) / 4
```

#### Stats row below heatmap
- "X check-inu · Nejdelsi streak: Y dni · Aktualni: Z dni"
- Uses existing `HabitsStats` data (streakDays, totalCheckIns) + compute longest streak from history

### Data changes
- Frontend: change `getHabitsHistory(14)` call to `getHabitsHistory(84)` on habits page
- Backend: no changes needed — `GET /api/habits/history?days=84` already supported

---

## 3. "Co dnes?" Smart Widget (dashboard)

### Purpose
Single-action recommendation card at top of dashboard. Instant, contextual, rules-based (no Claude API call). First thing user sees — one clear action for today.

### Placement
- Top of dashboard, above Daily Brief card
- Compact card with gradient background

### Visual design
- Gradient background (subtle, varies by action type):
  - streak: red/orange gradient
  - recovery: cyan/purple gradient
  - comeback: lime/cyan gradient
  - nutrition: orange/yellow gradient
  - default: lime/cyan gradient
- Left: icon (emoji or simple symbol)
- Center: headline (bold, 1 line, max 60 chars) + rationale (smaller, 1 line)
- Right: CTA button (rounded pill) + dismiss (x) button
- After dismiss: hidden for rest of day (localStorage key `fitai_today_action_dismissed_YYYY-MM-DD`)

### Recommendation logic (priority order)
1. **Streak at risk** (streak > 3 && no workout today) → "Neztrcej X-denni streak! Zkus micro-workout." CTA: "/micro-workout"
2. **High soreness** (today's soreness >= 4) → "Dej si recovery den — foam rolling nebo prochazku." CTA: "/habity"
3. **Long absence** (3+ days since last workout) → "Cas se vratit! Zacni lehkym treninkem." CTA: "/gym"
4. **Low nutrition** (yesterday kcal < 70% daily goal) → "Vcera jen Xkcal — doplh bilkoviny." CTA: "/vyziva"
5. **Default** → motivational action from context: "Push day — X cviku, Ymin" CTA: "/gym"

### Backend

#### New endpoint: `GET /api/ai-insights/today-action`
- Auth: `@UseGuards(JwtAuthGuard)`
- Rate limit: `@Throttle({ limit: 20, ttl: 3600 })`
- Response: `{ type: string, headline: string, rationale: string, ctaLabel: string, ctaLink: string }`
- Data reads (parallel):
  - `UserProgress` (currentStreak, lastWorkoutDate)
  - `DailyCheckIn` (today + yesterday)
  - `FoodLog` aggregate (yesterday's total kcal)
  - `FitnessProfile` (dailyKcal goal)
- Cache: in-memory Map, 1h TTL per user, invalidated on check-in or workout completion
- No Claude API call — pure rules-based, instant response

### Frontend

#### New file: `apps/web/src/components/dashboard/TodayActionCard.tsx`
- Props: `action: TodayAction` (type, headline, rationale, ctaLabel, ctaLink)
- Dismiss: stores `fitai_today_action_dismissed_YYYY-MM-DD` in localStorage
- If dismissed for today or no action available: renders nothing
- Gradient background based on `action.type`
- CTA navigates to `action.ctaLink`

#### Dashboard integration
- In `dashboard/page.tsx`: fetch `getTodayAction()` in parallel with existing calls
- Render `TodayActionCard` above Daily Brief section
- Add `getTodayAction()` to `lib/api.ts`

---

## Files to create/modify — Summary

### New files (8)
1. `apps/web/src/app/(app)/ai-chat/page.tsx` — Chat page
2. `apps/web/src/components/chat/ChatBubble.tsx` — Message bubble
3. `apps/web/src/components/chat/ChatInput.tsx` — Input bar
4. `apps/web/src/components/habits/ActivityHeatmap.tsx` — Heatmap grid
5. `apps/web/src/components/dashboard/TodayActionCard.tsx` — Smart widget
6. `apps/api/src/coaching/dto/chat-message.dto.ts` — Chat DTO
7. `apps/api/src/coaching/coaching-chat-prompt.ts` — Chat system prompt builder
8. `apps/api/src/ai-insights/today-action.ts` — Today action logic (extracted)

### Modified files (7)
1. `apps/api/src/coaching/coaching.controller.ts` — Add 3 chat endpoints
2. `apps/api/src/coaching/coaching.service.ts` — Add chat methods
3. `apps/api/src/ai-insights/ai-insights.controller.ts` — Add today-action endpoint
4. `apps/api/src/ai-insights/ai-insights.service.ts` — Add today-action logic
5. `apps/api/prisma/schema.prisma` — Add `title` to CoachingSession
6. `apps/web/src/lib/api.ts` — Add chat + today-action API functions
7. `apps/web/src/app/(app)/dashboard/page.tsx` — Add TodayActionCard
8. `apps/web/src/app/(app)/habity/page.tsx` — Add ActivityHeatmap + increase history to 84 days
9. `apps/web/src/components/v2/V2Layout.tsx` — Add "AI Chat" nav link

### No changes needed
- Backend habits endpoints (already support arbitrary `days` param)
- Existing coaching prompt builders (chat gets its own)
- Prisma seed data
- Mobile (web-only for now)

---

## Out of scope (follow-up)
- Conversation sidebar (history browser) — add later as evolution of chat
- Voice input/output in chat — separate feature
- Mobile parity for chat/heatmap/widget — after web ships
- Chat message search
- Export chat history
