# Launch Readiness & Security Audit — 2026-07-07

Pre-launch go/no-go audit před veřejným spuštěním (web + mobile). Zaměření:
prolomení loginu, přístup mimo registrované uživatele (IDOR), žrané kredity,
platební brána, injection/útoky, vhodnost technologií, škálování.

Navazuje na `AUDIT-2026-07-PLATFORM.md` (hardening 0-5 už aplikovaný).

## Stav oprav (aktualizováno 2026-07-07 po auditu)

- ✅ **XP double-spend (drops + paid-challenges)** — opraveno atomickým `gte`
  debitem + 8 testů (commit `10a024a`).
- ✅ **npm audit CRITICAL** — Next 14.2.21→14.2.35 (patch, kritická pryč),
  drei bump, smazán middleware.js artefakt (commit `0e9cf05`). Zbývá: Next 16
  a NestJS 11 (majory) → ROADMAP.
- ✅ **AI spend alarm** — CloudWatch tripwire na total Claude tokeny/hod,
  nasazeno (commit `3e83b43`).
- ⏳ **Platby** — řeší uživatel (rozhodnutí free vs IAP/Stripe).
- ⏳ **Sentry web** — build-coupled, čeká na DSN + ověření v CodeBuildu.
- ⏳ **RDS Multi-AZ + staging** — kód ready / maintenance okno + samostatný úkol.
- ℹ️ **Auth vylepšení** (bcrypt cost, JWT alg pin, refresh token) — soubory
  `apps/api/src/auth/*` jsou zamčené, čekají na explicitní souhlas.

---

## VERDIKT: Podmíněné GO

Bezpečnostní jádro — to, čeho ses bál nejvíc — je **skutečně solidní**: login
nejde prolomit, uživatel se nedostane k datům jiného uživatele, kredity nejde
vydrancovat, injection povrch je čistý. To je dobrá zpráva a nebývá to
samozřejmost.

**Jako CTO bych se pod projekt postavil — ale ne dnes bez 5 věcí níže.** Žádná
z nich není „přepiš to celé"; jsou to konkrétní, ohraničené úkoly. Nejsou to
díry, kterými by tekla data nebo peníze — je to „ještě to není hotové na
produkci pro platící publikum".

### Co MUSÍ být hotové před prvními veřejnými uživateli

| # | Blocker | Proč | Effort |
|---|---|---|---|
| 1 | **Rozhodnout platby** — billing je mock stub | Pricing 199/399 Kč je inzerovaný, ale „Upgrade" vede na placeholder. Tiery se nevynucují. | rozhodnutí + S/L |
| 2 | **Opravit 2 XP double-spend cesty** (drops, paid-challenges) | Souběžnými requesty lze jít do záporného XP | S (30 min) |
| 3 | **Triage npm audit** — web 1 critical + 2 high | Neznámý exploit v závislosti = riziko | S-M |
| 4 | **Zapojit Sentry** (DSN pending) | Bez toho jsi na produkci slepý — pád neuvidíš | S (+ DSN od tebe) |
| 5 | **RDS Multi-AZ + staging** (kód ready) | Jedna zóna DB = jeden výpadek = celá appka dole | M (okno) |

---

## 1. Login, hesla, session — SILNÉ ✅

**Můžeš se přihlásit jako někdo jiný nebo prolomit heslo? Ne.**

- `JWT_SECRET` **nemá slabý fallback** — appka se odmítne spustit bez něj
  (`auth.module.ts:17`, `jwt.strategy.ts:13`). Žádné `|| 'secret'`.
- Hesla: **bcrypt** (`auth.service.ts:33,56`), min. 8 znaků (`register.dto.ts`),
  `bcrypt.compare` (timing-safe).
- Reset hesla: token přes `crypto.randomUUID` (ne `Math.random`), 1h expirace,
  jednorázový, invaliduje staré tokeny, **neprozrazuje existenci e-mailu**
  (`auth.service.ts:80-124`) — bez user-enumeration přes reset.
- Brute-force: login **10/min per IP**, registrace 5/hod, reset 3/hod
  (`auth.controller.ts`).
- **Banned user je odmítnut na KAŽDÉM requestu** server-side
  (`jwt.strategy.ts:20-29`) — i s platným JWT. Ban je funkční kill-switch.

**Slabší místa (ne blockery, doporučení):**
- MEDIUM: access token **7 dní, žádný refresh, žádná revokace při logoutu**.
  Unesený token platí 7 dní; logout je jen client-side. (Ban ho zneplatní, běžný
  logout ne.) → zvážit refresh-token flow + kratší access token.
- LOW: bcrypt cost 10 (doporučeno 12), heslo bez požadavku na složitost.
- LOW: JWT algoritmy nezafixované na HS256 (nezneužitelné se symetrickým
  klíčem, ale best-practice je pinnout).
- LOW: login dělá `bcrypt.compare` jen když uživatel existuje → drobný timing
  side-channel pro zjištění, zda e-mail existuje.

## 2. Přístup mimo vlastní data (IDOR) — SILNÉ ✅

**Dostane se uživatel k datům/funkcím jiného uživatele? Ne (na vzorku 15+ míst).**

- Guard NENÍ globální, ale **jen `/health` je bez guardu** — vše ostatní má
  `@UseGuards(JwtAuthGuard)` (66 controllerů má guard na úrovni třídy).
- **Progres fotky** (nejcitlivější): S3 klíč je `progress-photos/{userId}/...`
  s `userId` z JWT (ne z klienta), a **každé** čtení/mazání/analýza ověřuje
  `p.userId !== userId → Forbidden` (`progress-photos.service.ts:116-170`).
  Presigned URL se generuje server-side až po ověření vlastnictví →
  **uživatel A se nedostane k fotce uživatele B.**
- **Zprávy (DM):** čtení ověřuje účastníka konverzace
  (`messages.service.ts:53-77`) → nelze číst cizí konverzaci.
- 64 služeb filtruje `where: { userId }`. Acting identity je vždy `req.user.id`
  z JWT, nikdy z těla requestu.
- LOW: `admin/admin.controller.ts` používá **inline** `if (!user.isAdmin)`
  (funguje, ale náchylné na opomenutí u nového endpointu); `moderation` už
  správně používá `@UseGuards(AdminGuard)`. → sjednotit na AdminGuard.

## 3. Žrané kredity / drancování AI — SILNÉ ✅

**Může útočník nebo náhlá zátěž vysát AI/AWS rozpočet? Prakticky ne.**

- Drahé Vision/AI endpointy mají **denní** stropy per uživatel:
  meal-plan 3/den, food-photo 20/den, recipes-from-photo 10/den, form-check
  10/hod, progress-photo analyze 20/den, plan generation 3/den.
- Throttling je **per-user** (`UserIdThrottlerGuard`) a **Redis-backed**
  (`REDIS_URL` je v Secrets Manageru, sdílený mezi ECS tasky — teď když je
  Redis obnovený).
- Baseline 100/min per uživatel na všech endpointech.
- LOW-MEDIUM: masová registrace (5/hod/IP) přes mnoho IP by vytvořila účty,
  každý s vlastním denním rozpočtem → distribuovaný útok, ohlídat alarmem na
  AI spend (metriky se sbírají, alarm na útratu ještě chybí).

## 4. Platby a XP ekonomika — SMÍŠENÉ ⚠️

**Reálné peníze: ŽÁDNÉ.** `billing.service.ts` je **mock** — `createCheckout`
vrací placeholder, webhook není implementovaný (ale správně odmítá bez
`STRIPE_WEBHOOK_SECRET`). **Dnes neexistuje finanční útočný povrch, protože se
nezpracovávají žádné platby.**

- **Blocker (produktový, ne bezpečnostní):** tiery Free/Pro/Premium (199/399 Kč)
  jsou inzerované, ale „Upgrade" jde na mock a **tiery se nikde nevynucují** —
  všichni mají stejné limity. Rozhodnutí: buď **spustit zdarma**, nebo nejdřív
  napojit reálné platby. Na iOS prodej digitálního obsahu = **Apple IAP**
  (30 %), ne Stripe.
- **MEDIUM (reálný double-spend): `drops` a `paid-challenges` používají
  check-then-decrement bez atomického `gte` guardu** (`drops.service.ts:75-97`,
  `paid-challenges.service.ts:83-92`). Souběžný nákup **různých** dropů/výzev
  může poslat XP do záporu. Stejný item blokuje unique constraint, různé ne.
  Ostatní 4 cesty (marketplace, experiences, creator subscribe/tip) to dělají
  správně atomicky (ADR-21). Fix = zkopírovat ten vzor. Blast radius malý
  (virtuální XP, žádné peníze), ale triviální oprava.
- **XP earning je chráněné:** `gym-sessions/:id/end` má atomický claim
  přechodu na COMPLETED (`gym-sessions.service.ts:239`) → replay neudělí XP 2×.
  Ceny se čtou z DB (`listing.priceXP`), ne z těla requestu → žádný „free
  purchase" nastavením ceny 0.

## 5. Injection / útočný povrch — SILNÉ ✅

- **SQL injection: 0** `queryRawUnsafe`/`executeRawUnsafe`. pgvector používá
  parametrizované `$1::vector`. Prisma jinak všude.
- **XSS: 0** `dangerouslySetInnerHTML` ve webu.
- **Helmet** zapnutý (`main.ts`), **CORS** omezený na `https://fitai.bfevents.cz`
  v produkci (ne `*`).
- Globální `ValidationPipe` s `whitelist + forbidNonWhitelisted + transform`.
- **MEDIUM: npm audit** — web **1 critical + 2 high**, api **3 high** (převážně
  tranzitivní: next/postcss/qs). Triage před spuštěním; critical prověřit ručně.

## 6. CTO pohled — technologie, škálování, provoz

**Změnil bych stack? Většinou NE.** NestJS + Prisma + Postgres + Next + Expo jsou
nudné, správné, škálovatelné volby. Nepřepisoval bych. Co bych řešil:

- **Škálovací strop = single RDS t3.micro + single Redis t3.micro.** Rozbije se
  jako první — řádově nízké tisíce souběžných uživatelů (DB spojení ~112,
  Redis 0.5 GB na cache+throttle). Fix: Multi-AZ (kód ready), pak read replica
  + větší instance. Není to nouze pro launch, je to strop pro růst.
- **Žádný staging** — všechno se testuje rovnou na produkci. Před placeným
  publikem bych chtěl staging (proměnná `env` už existuje).
- **Sentry nezapojený** (DSN pending) — na produkci bys neviděl pády. Pro launch
  nutné.
- **Náklady ve škále:** AI cena na aktivního uživatele (Claude + ElevenLabs) je
  divoká karta — denní stropy ji ohraničují per uživatel, ale u 10k aktivních
  denně (daily brief + coaching) to jsou reálné peníze. Namodelovat + alarm na
  útratu.
- **Testy:** 95 unit testů na kritickou logiku ✅, ale chybí integrační/e2e a
  reálný load test (k6 skripty existují, nespuštěné proti zátěži).

---

## Shrnutí rizik podle závažnosti

| Sev | Nález | Oblast |
|---|---|---|
| — | Login/IDOR/injection/cost-abuse jádro je solidní | ✅ |
| MEDIUM | XP double-spend přes souběžné drops/paid-challenges | ekonomika |
| MEDIUM | npm audit: web critical + high, api high | závislosti |
| MEDIUM | 7d token bez refresh/revokace (jen ban revokuje) | auth |
| MEDIUM | Billing mock — pricing inzerovaný, checkout slepý, tiery nevynucené | produkt |
| MEDIUM | Single-AZ DB/Redis, žádný staging, Sentry nezapojený | provoz |
| LOW | bcrypt cost 10, heslo bez složitosti, JWT alg nepinnuté, admin inline check, mass-signup, AI spend alarm chybí | různé |

**Bottom line:** Nebojíš se marně — ale konkrétně těch věcí, kterých ses bál
(prolomení loginu, přístup mimo uživatele, drancování kreditů, útoky), se bát
nemusíš, ty jsou ošetřené. Zbývá dotáhnout provozní připravenost a jedno
rozhodnutí o monetizaci. To je normální stav projektu těsně před launchem, ne
red flag.
