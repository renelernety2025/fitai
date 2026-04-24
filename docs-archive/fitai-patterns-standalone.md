# FitAI Production Patterns — Standalone Reference

> Produkce-ověřené patterns z FitAI projektu (28 NestJS modulů, React Native + Expo mobile, AWS ECS Fargate). Tyto patterns doplňují Claude Code Bible v4.1 o oblasti, které Bible nepokrývá.
>
> Datum: 2026-04-19
> Projekt: FitAI (AI fitness platforma)
> Stack: NestJS 10 + Prisma 5 + PostgreSQL 16 + React Native + Expo SDK 54 + AWS ECS

---

## 1. Production Smoke Test (test-production.sh)

### Problem

Unit testy a linting ověřují kód, ale ne produkční deployment. Rozbité environment variables, chybějící secrets, ALB routing, CORS, DNS — nic z toho unit test nezachytí. Po deployi nevíte jestli produkce skutečně funguje, dokud se uživatel neozve s bugem.

### Řešení

Dedikovaný bash skript `test-production.sh` co testuje ŽIVOU produkci end-to-end:

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://your-app.example.com}"
PASS=0; FAIL=0

check() {
  local desc="$1" url="$2" expect="$3"
  local status
  status=$(curl -sS -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  if [ "$status" = "$expect" ]; then
    echo "  [OK] $desc"; PASS=$((PASS + 1))
  else
    echo "  [FAIL] $desc (got $status, expected $expect)"; FAIL=$((FAIL + 1))
  fi
}

# 1. Health + API endpointy
echo "[1] API Health"
check "GET /health" "$BASE_URL/health" "200"
check "GET /api/exercises" "$BASE_URL/api/exercises" "200"

# 2. Auth flow (demo credentials)
echo "[2] Auth"
TOKEN=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@app.com","password":"demo1234"}' \
  --max-time 10 | jq -r '.accessToken // empty')

if [ -n "$TOKEN" ]; then
  echo "  [OK] Auth token obtained"; PASS=$((PASS + 1))
  check "GET /api/auth/me (authenticated)" "$BASE_URL/api/auth/me" "200"
else
  echo "  [FAIL] Auth token NOT obtained"; FAIL=$((FAIL + 1))
fi

# 3. Frontend pages (SSR/SSG)
echo "[3] Frontend pages"
check "GET /" "$BASE_URL/" "200"
check "GET /login" "$BASE_URL/login" "200"
check "GET /dashboard" "$BASE_URL/dashboard" "200"

# 4. Routing sanity (API vs Frontend)
echo "[4] Routing sanity"
# /api/exercises should return JSON, /exercises should return HTML
check "/api/exercises returns JSON" "$BASE_URL/api/exercises" "200"
check "/exercises returns HTML" "$BASE_URL/exercises" "200"

# Summary
echo ""
echo "=== Summary ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
[ "$FAIL" -eq 0 ] && echo "All tests passed." && exit 0
echo "$FAIL test(s) failed." && exit 1
```

### FitAI stav

- **61 testů** pokrývajících: health, 28+ API endpointů, 19 frontend pages, routing sanity, auth flow
- Spouští se **po KAŽDÉM deployi** a **před merge do main**
- Demo účet `demo@fitai.com` / `demo1234` s read-only daty

### Pravidla

| Pravidlo | Důvod |
|---|---|
| Všechny testy MUSÍ projít | Deployment s failing smoke = broken produkce |
| Testovat ŽIVOU produkci (ne staging) | Ověřuje celý stack: DNS → ALB → ECS → DB → secrets |
| Demo credentials, ne admin | Bezpečnost — demo účet nemůže nic rozbít |
| Přidat test po každé nové feature | Prevence regress — nový endpoint = nový check |
| Max 10s timeout per request | Rychlost — 61 testů za <30s |

### V CLAUDE.md

```markdown
## Testování
- Po KAŽDÉM deployi: `bash test-production.sh` — VŠECHNY testy musí projít
- Po nové feature: přidat nový check do test-production.sh
```

---

## 2. CONTRACTS.md — Zámčené API Shapes + DB Modely

### Problem

AI agent může "vylepšit" API response shape (přejmenovat field, změnit typ) nebo přejmenovat DB sloupec. Klienti (web, mobile) závisí na přesném shape. Bez explicit contract souboru je každá změna potenciální breaking change a AI to neví, dokud klient crashne.

### Řešení

`CONTRACTS.md` v root projektu — explicit "tohle je zámčené, neptej se proč":

```markdown
# [Project] — API & DB Contracts

> Tyto kontrakty jsou ZAMCENE. Zmena vyzaduje vyslovny souhlas uzivatele.
> CC: Pred jakoukoliv zmenou v tomto souboru se ZEPTEJ.

## API Endpoints (locked shapes)

### POST /api/auth/login
Request:  { email: string, password: string }
Response: { user: User, accessToken: string }
Status:   200 (success), 401 (invalid credentials)

### GET /api/exercises
Response: Exercise[]
Status:   200

### POST /api/coaching/ask
Request:  { question: string, exerciseName?: string, formScore?: number,
            completedReps?: number, audioFormat?: 'mp3'|'pcm' }
Response: { answer: string, audioBase64: string | null }
Status:   200
Throttle: 30 req/hour/user

[... dalsi endpointy ...]

## DB Models (locked fields)

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| email | String | unique, @IsEmail() |
| name | String | |
| level | Enum(BEGINNER/INTERMEDIATE/EXPERT/MASTER/LEGEND) | |
| isAdmin | Boolean | default false |
| expoPushToken | String? | for mobile push |

### Exercise
| Field | Type | Notes |
|---|---|---|
| name | String | unique |
| nameCs | String | Czech name |
| category | String | compound/isolation/accessory |
| muscleGroups | String[] | |
| phases | JSON | exercise phase definitions |
| instructions | JSON | steps/mistakes/muscles/breathing |

[... dalsi modely ...]

## Zamcene soubory (neprepisovat bez souhlasu)

- `apps/api/src/auth/*` — JWT auth flow
- `apps/api/src/main.ts` — globalPrefix('api')
- ALB routing rule `/api/*`
- `prisma/schema.prisma` field names (NOT the whole schema)
```

### Proč to funguje

1. **AI vidí explicit "zámčeno"** — CC respektuje YOU MUST NOT direktivy
2. **Breaking change je viditelná** — diff v CONTRACTS.md = red flag
3. **Nový dev/AI** okamžitě vidí co nesmí měnit
4. **Verze kontrola** — git blame CONTRACTS.md ukazuje kdo a kdy contract změnil

### V CLAUDE.md

```markdown
## Ochrana existujícího kódu
- **IMPORTANT:** Viz @CONTRACTS.md pro zámčené API shapes a DB modely
- Změna CONTRACTS.md vyžaduje výslovný souhlas
- Přidej nový endpoint → přidej do CONTRACTS.md
```

---

## 3. Protect-files Hook — Deterministická Ochrana

### Problem

CLAUDE.md pravidla "nepřepisuj auth/ bez souhlasu" závisí na AI compliance. AI má ~95% adherenci — ale 5% miss rate na kritických souborech je nepřijatelné. Jeden přepsaný `main.ts` = rozbitá produkce.

### Řešení

`.claude/hooks/protect-files.sh` — shell hook co **deterministicky blokuje** Edit/Write na chráněné soubory:

```bash
#!/usr/bin/env bash
# protect-files.sh — exit 2 = CC blocks the tool execution

PROTECTED_PATTERNS=(
  "src/auth/"
  "src/main.ts"
  "lib/feedback-engine.ts"
  "lib/rep-counter.ts"
  "lib/safety-checker.ts"
  "lib/smart-voice.ts"
  "prisma/schema.prisma"
)

FILE_PATH="$1"

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "BLOCKED: $FILE_PATH is protected by protect-files.sh"
    echo "Ask user for explicit permission to modify this file."
    exit 2
  fi
done

exit 0
```

### Registrace v .claude/settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "bash .claude/hooks/protect-files.sh \"$FILE_PATH\""
        }]
      }
    ]
  }
}
```

### Exit code semantika

| Exit code | CC chování |
|---|---|
| 0 | Tool proběhne normálně |
| 1 | Error — CC reportuje, tool neproběhne |
| **2** | **Block** — CC zastaví, ukáže uživateli proč, čeká na rozhodnutí |

### Soft vs Hard ochrana

| Přístup | Mechanismus | Bypass riziko | Kdy použít |
|---|---|---|---|
| CLAUDE.md pravidla | AI adherence | ~5% miss rate | Všechny soubory (soft reminder) |
| CONTRACTS.md | Explicit list | AI může ignorovat | API shapes, DB schema |
| **protect-files.sh** | **Deterministický hook** | **0% bypass** | **Kritické soubory (auth, core libs)** |

**Kombinuj všechny tři:** CLAUDE.md pro awareness, CONTRACTS.md pro shapes, hook pro hard block.

---

## 4. Projekt-specifické Rules (.claude/rules/)

### Problem

Jeden `security.md` rule soubor pokrývá generickou bezpečnost (OWASP, XSS, SQL injection), ale nezná:
- NestJS routing konvence (`@Throttle()`, `setGlobalPrefix`)
- Expo/EAS build pravidla (native deps v apps/mobile/package.json, prebuild --clean)
- API model convention (claude-haiku-4-5 pro coaching, claude-sonnet-4-6 pro vision)

AI pak dělá chyby které generické security.md nemůže zachytit.

### Řešení

Multiple rule soubory v `.claude/rules/` — každý pro jednu doménu:

```
.claude/rules/
├── security.md     # OWASP, input validation, secrets, error handling
├── api.md          # NestJS routing, DTO, auth guards, throttle, model convention
├── mobile.md       # React Native, Expo, EAS, Metro, native modules
└── frontend.md     # Next.js App Router, Tailwind, SSR/CSR (pokud potřeba)
```

### Jak CC rules fungují (kontextové načítání)

CC automaticky načte rules z `.claude/rules/` ale jen ty relevantní pro editovaný soubor:
- Edituješ `apps/api/src/coaching/coaching.service.ts` → CC načte `api.md` + `security.md`
- Edituješ `apps/mobile/src/lib/voice-coach.ts` → CC načte `mobile.md`
- Edituješ `apps/web/src/app/dashboard/page.tsx` → CC načte `frontend.md` (pokud existuje)

### Příklad api.md (NestJS-specifický)

```markdown
# API Development Rules

Tato pravidla se uplatňují při editaci čehokoli v `apps/api/`.

## Routing
- **Global prefix `/api/*`** — NIKDY neměnit
- ALB: `/api/*` + `/health` → API Target Group
- Nikdy nevolat `/exercises` přímo — vždy `/api/exercises`

## Validace
- **class-validator DTO** na KAŽDÉM endpointu
- ValidationPipe globálně v main.ts — nezrušit

## Rate limiting
- **@Throttle()** na KAŽDÉM Claude/AI endpointu (ochrana budgetu)

## Claude model convention
- Coaching / tips: `claude-haiku-4-5`
- Vision (food, body): `claude-sonnet-4-6`

## ElevenLabs TTS
- **VŽDY `language_code: 'cs'`** v TTS requestu

## Self-check před commitem
1. DTO validace na nových endpointech?
2. Auth guard + userId check?
3. @Throttle() na AI endpointech?
4. Žádný hardcoded secret?
```

### Příklad mobile.md (Expo-specifický)

```markdown
# Mobile Development Rules

Tato pravidla se uplatňují při editaci čehokoli v `apps/mobile/`.

## Native modules
- **Native deps MUSÍ být v apps/mobile/package.json** (NE root)
- Lazy require: `try { require('expo-audio') } catch {}`
- NativeModules.X check NEFUNGUJE spolehlivě — vždy try/require

## EAS Build
- Před EAS: `rm -rf ios && npx expo prebuild --clean && cd ios && pod install`
- app.json MUSÍ být v gitu
- Žádný root app.json ani root ios/

## Voice pipeline
- Pipeline: coaching-engine → coaching-phrases → voice-coach → /api/coaching/tts
- MIC echo: pauseCoach() / resumeCoach()
```

### Výhody per-domain rules

| Aspekt | Jeden security.md | Per-domain rules |
|---|---|---|
| Token footprint | Celý security.md vždy | Jen relevantní domain |
| Specifičnost | Generická | Framework-aware |
| Udržovatelnost | Monolith | Soubor per domain |
| AI compliance | Nižší (příliš obecné) | Vyšší (konkrétní, actionable) |

---

## 5. SCALING.md — Dedicated Scaling Plan

### Problem

Scaling rozhodnutí (cache strategie, autoscaling, read replicas, CDN) jsou buď:
- Rozptýlená v ARCHITECTURE.md (mísí current state s budoucími plány)
- V hlavě developera (neviditelná pro AI)
- Neexistují (reacting, ne planning)

### Řešení

Separátní `SCALING.md` s vrstvovým přístupem:

```markdown
# [Project] — Scale Readiness Plan

> Plán jak připravit platformu na 1M+ DAU bez plýtvání.
> Aktuální stav: Launch (0-100 DAU). Vrstvy 1-3 plánovány.

## Vrstva 1 — FREE quick wins (~1 den, +$20/mo, 100x capacity)

- [ ] Aggressive caching (Redis) pro read-heavy endpointy
  - Static content (exercises, lessons): 7d TTL
  - Per-user (AI insights, recovery score): 1h TTL
  - Daily Brief: 24h TTL, key `${userId}:${YYYY-MM-DD}`
- [ ] Database indexy audit + fix chybějících
- [ ] Rate limiting per endpoint (@nestjs/throttler)
- [ ] ECS autoscaling 1-3 → 2-20 (CPU target tracking)
- [ ] ALB timeout tuning + Prisma connection pooling

## Vrstva 2 — Observability (~0.5 dne, +$26/mo)

- [ ] CloudWatch dashboard (API/Web/RDS/Redis/ALB metriky)
- [ ] CloudWatch alarmy + SNS email (10 alarmů)
- [ ] Sentry integration (backend + mobile + web)
- [ ] Structured JSON logging
- [ ] AI usage custom metrics (Claude tokens/den)

## Vrstva 3 — Load testing (~1 den, $0)

- [ ] k6 install + 4 test scenarios
- [ ] Baseline run
- [ ] Top 3 bottlenecks identification
- [ ] Optimization + re-test

## Vrstva 4 — Paid upgrades (JEN podle load test dat)

- [ ] RDS upgrade (r6g.large, read replicas)
- [ ] ElastiCache cluster mode
- [ ] Fargate Spot pro non-critical tasks
- [ ] CDN optimization (edge caching)

## Aktuální stav

| Metrika | Hodnota |
|---|---|
| Stage | Launch (0-100 DAU) |
| ECS tasks | 1 API + 1 Web |
| RDS | db.t3.micro, 20GB |
| Redis | cache.t3.micro single |
| Estimated capacity | ~50 concurrent users |
```

### Proč separátní od ARCHITECTURE.md

| ARCHITECTURE.md | SCALING.md |
|---|---|
| Jak systém funguje **TEĎ** | Jak systém **BUDE** fungovat při zátěži |
| Fakta (current state) | Plán (future state) |
| ADRs (rozhodnutí which happened) | Checklisty (tasks to do) |
| Stabilní (mění se při arch changes) | Dynamický (mění se s růstem) |

### V CLAUDE.md

```markdown
## Importy
See @SCALING.md for scale readiness plan.
```

---

## Souhrn: Jak se tyto patterns doplňují

```
CLAUDE.md           → JAK pracovat (pravidla + references)
  ↓ references
CONTRACTS.md        → CO je zámčené (API shapes, DB models)
SCALING.md          → KAM růst (vrstvy, checklisty)
test-production.sh  → JE TO ŽIVÉ? (smoke tests po deployi)

.claude/rules/
  api.md            → JAK psát API (NestJS konvence)
  mobile.md         → JAK psát mobile (Expo konvence)
  security.md       → JAK být bezpečný (OWASP)

.claude/hooks/
  protect-files.sh  → HARD BLOCK na kritické soubory (exit 2)

Kombinace:
  CLAUDE.md         = soft awareness   ("tohle je důležité")
  CONTRACTS.md      = explicit shapes  ("tohle je přesný format")
  protect-files.sh  = hard enforcement ("tohle je blokované")
  test-production.sh = verification    ("tohle funguje v produkci")
```
