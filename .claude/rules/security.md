---
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
---

# Security Rules — FitAI

Při psaní / editaci kódu VŽDY dodržuj:

## Input validace
- **Validuj VŠECHNY vstupy** od uživatelů (query params, request body, headers, cookies)
- Používej **class-validator DTO** na každém NestJS endpointu (`@IsString()`, `@IsEmail()`, `@MinLength()` atd.)
- Web forms: **Zod schema** pro každý form submit
- Nikdy nedůvěřuj klientským datům — i když jsi přidal validaci v UI, BE musí validovat znovu

## Database
- **Používej Prisma ORM** (nikdy raw SQL přes `$queryRaw` bez parametrů)
- Pokud musíš raw SQL: **`$queryRaw\`...${param}\`** nikdy `$queryRawUnsafe` s concatenaci stringů
- **RLS pattern:** Na každém dotazu filtruj `where: { userId: req.user.id }` — uživatel smí vidět JEN svá data
- Nikdy nevracej data jiného uživatele (kromě explicitně public content)

## Authentication & authorization
- Každý endpoint který vyžaduje auth musí mít `@UseGuards(JwtAuthGuard)`
- V service: `if (resource.userId !== req.user.id) throw new ForbiddenException()`
- Admin endpointy: `@Roles('admin')` nebo explicit `if (!user.isAdmin)` check
- **Nikdy nevěř** frontendem předaný userId — vždy `req.user.id` z JWT

## Secrets
- **Žádné hardcoded secrety** (API klíče, tokeny, hesla) — vše přes `process.env.*` nebo Secrets Manager
- `.env` souboru v .gitignore (kontrola: `git ls-files .env` = prázdné)
- Pro AWS: task role IAM → SDK auto-discovers (nikdy klíče v kódu)
- V logs: **neloguj** `req.headers.authorization`, `req.body.password`, API keys

## Output & responses
- **Nikdy nevracej stack traces** uživateli v produkci
- NestJS: `new InternalServerErrorException()` bez stack trace v message
- Error middleware: v production mode log plný, klient dostane generickou zprávu
- JSX: **nikdy `dangerouslySetInnerHTML`** bez DOMPurify
- URL parametry: escape při použití v HTML (Next.js dělá automaticky)

## CORS & headers
- CORS whitelist: jen produkční domény (`fitai.bfevents.cz`, dev localhost) — ne `origin: '*'`
- Helmet middleware pro všechny public endpointy
- Security headers: CSP, X-Frame-Options, HSTS

## Rate limiting
- **Každý public endpoint** (auth, payments) má `@Throttle()` decorator
- Globální `ThrottlerGuard` aplikován v `app.module.ts`
- AI endpointy (drahé): per-user daily/hourly limity

## File uploads
- Validuj MIME type a file size před uploadem
- Progress photos: max 10 MB, jen `image/jpeg|png|heic`
- Presigned URLs: short expirace (15 min), bucket policy omezená

## External API calls
- **Nikdy nefetchuj URL z uživatelského vstupu** bez validace (SSRF prevence)
- Pro Claude API / ElevenLabs / OpenAI: klíče z Secrets Manager, nikdy ne env.local
- Externí URL whitelist kde je to možné

## Payments (pokud někdy budou)
- Ceny **vždy z DB**, nikdy z frontend body
- Frontend posílá **jen productId**, nikdy amount
- Stripe webhook: **vždy ověřuj signature**
- Logy platebních operací: user ID, IP, timestamp

## Podezřelé patterny co NIKDY nepoužívat
- ❌ `eval()`, `Function()` constructor
- ❌ `child_process.exec()` s user input
- ❌ `dangerouslySetInnerHTML` bez sanitizace
- ❌ Raw SQL string concatenation (`"WHERE id = " + userId`)
- ❌ `JSON.parse()` bez try/catch na user input
- ❌ `localStorage` pro citlivá data (tokeny — OK, hesla — NE)
- ❌ `Math.random()` pro security (token generation) — použij `crypto.randomUUID()`

## Self-check před commitem
Než napíšeš code a commit, projdi si mentálně:
1. **Input validation** — každý `@Body()`, `@Query()`, `@Param()` má DTO s validátory?
2. **Authorization** — může uživatel přistoupit JEN ke svým datům?
3. **Secrets** — žádný hardcoded API key / password / token?
4. **SQL/XSS** — Prisma, ne raw SQL; žádný `dangerouslySetInnerHTML`?
5. **Rate limit** — drahý endpoint má `@Throttle()`?
6. **Error handling** — neunikají v response interní detaily?

Pokud NĚCO ne-sedí → **neuploaduj / nezavírej task**. Oprav nejdřív.
