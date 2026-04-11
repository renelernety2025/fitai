---
paths:
  - "apps/api/**"
---

# API Development Rules — FitAI

Tato pravidla se uplatňují při editaci čehokoli v `apps/api/`.

## Routing
- **Global prefix `/api/*`** — všechny endpointy. `main.ts` nastavuje `setGlobalPrefix('api', { exclude: ['/health'] })`. NIKDY to neměnit — ALB routing rule na tom závisí.
- ALB: `/api/*` + `/health` → API Target Group, ostatní → Web Target Group.
- Nikdy ne volat `/exercises` přímo — vždy `/api/exercises`.

## Validace vstupů (VŽDY)
- **class-validator DTO** na každém endpointu: `@IsString()`, `@IsEmail()`, `@MinLength()`, `@IsInt()`, `@IsOptional()`...
- `ValidationPipe` globálně registrovaný v `main.ts` — nezrušit.
- Nikdy nedůvěřuj klientským datům, i když je validace v UI.

## Authorization
- Každý auth endpoint má `@UseGuards(JwtAuthGuard)`.
- V service layer: `if (resource.userId !== req.user.id) throw new ForbiddenException()`.
- **NIKDY** nevěř `userId` z body — vždy `req.user.id` z JWT.
- Admin: `if (!user.isAdmin) throw new ForbiddenException()`.

## Rate limiting
- **`@Throttle()` dekorátor na KAŽDÉM Claude/AI endpointu** (ochrana budgetu).
- Globální `ThrottlerGuard` v `app.module.ts`.
- Drahé endpointy (coaching, vision, plan generation): per-user hourly/daily limity.

## Claude model convention
- **Coaching / recovery tips / nutrition tips:** `claude-haiku-4-5` (rychlé, levné, Czech).
- **Food recognition / Vision analýza:** `claude-sonnet-4-6` (lepší vision accuracy).
- **Weekly review / Daily Brief:** `claude-haiku-4-5` (long context, structured JSON output).

## ElevenLabs TTS
- **VŽDY `language_code: 'cs'`** v TTS requestu. Bez toho → anglický accent na českém textu.
- Voice ID z `ELEVENLABS_VOICE_ID` env (Secrets Manager).
- Cache běžné fráze v Redis (7d TTL pro static content).

## Secrets
- **Vše přes `process.env.*` nebo AWS Secrets Manager** — NIKDY hardcoded.
- Task role IAM → AWS SDK auto-discovers credentials. Nikdy klíče v kódu.
- NELOGUJ: `req.headers.authorization`, `req.body.password`, API klíče.

## Database (Prisma)
- **Používej Prisma ORM** — nikdy raw SQL s concat (SQL injection).
- Pokud nutné: `$queryRaw\`... ${param}\`` (parametrizované), NIKDY `$queryRawUnsafe`.
- **Row-level security pattern:** každý dotaz `where: { userId: req.user.id }`.
- **Schema změny:** `npx prisma db push --accept-data-loss` (NE `migrate dev` — produkce nemá migration history).

## Cache
- **`CacheService` (Redis) pro read-heavy endpointy:**
  - Static content (exercises, lessons): 7d TTL
  - Per-user (AI insights, recovery score): 1h TTL
  - Daily Brief: 24h TTL, key `${userId}:${YYYY-MM-DD}`

## Error responses
- **NIKDY nevracej stack trace** uživateli v produkci.
- `new InternalServerErrorException()` bez detailu. Full stack do logs, klient dostane generickou message.

## Self-check před commitem
1. DTO validace na všech nových endpointech?
2. Auth guard + userId check?
3. `@Throttle()` na AI endpointech?
4. Žádný hardcoded secret?
5. Raw SQL žádný?
6. Error response nepouští interní detaily?
