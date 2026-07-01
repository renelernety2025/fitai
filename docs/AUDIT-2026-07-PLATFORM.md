# Monumentální audit platformy — 2026-07

Celoplatformní read-only audit (backend, web, mobile, infra/CI-CD, testing/procesy)
provedený 5 paralelními audit agenty. Navazuje na audity 2026-05-14 (monster),
2026-05-23 a `SECURITY-AUDIT-2026-06.md` — jejich už opravené nálezy se zde neopakují.

**Zatím pouze návrh — nic z tohoto dokumentu nebylo aplikováno.**

---

## TL;DR

Platforma je feature-bohatá a per-page/per-endpoint kvalita je po předchozích
auditech dobrá. Systémová rizika jsou ale koncentrovaná do 4 témat:

1. **Bezpečnostní síť neexistuje** — 0 automatizovaných testů v celém monorepu,
   CI gate je nefunkční (pnpm vs npm mismatch), produkce je jediné testovací
   prostředí, deploy nemá rollback.
2. **Netypovaná API hranice** — `@fitai/shared` backend vůbec neimportuje;
   web má 122× `Promise<any>`, mobile 154× `any` v api.ts, backend 545× `any`
   + vypnuté `strictNullChecks`.
3. **Infra single points of failure** — RDS single-AZ, jediný NAT, Redis single
   node, web service se nikdy neškáluje (chybí scaling policy), žádný ECS
   circuit breaker, `prisma db push --accept-data-loss` v prod deployi.
4. **App Store blocker** — bundle ID mismatch (`app.json` vs `eas.json`),
   žádný ErrorBoundary, žádný crash reporting v mobile.

---

## Co je zdravé (nepřepisovat, neopravovat)

- **Backend security baseline**: globální ValidationPipe (whitelist +
  forbidNonWhitelisted), 121 souborů s class-validator, guard coverage téměř
  100 % (jediný neguardovaný controller je /health), 0 raw SQL, acting identity
  vždy z `req.user` — žádný IDOR pattern nenalezen.
- **Nízký coupling**: jen 10 přímých feature→feature importů, 0 `forwardRef`,
  sdílení přes infra služby (Prisma/Cache/Metrics/Notify/Embeddings).
- **App-side observability (API)**: nestjs-pino strukturované logy, Sentry
  wired (gated na DSN), AI metriky na všech 21 Claude call sites, cron tracking.
- **CI/CD základy**: OIDC (žádné long-lived keys), paths-filter, deploy
  concurrency lock, migrate-failure blokuje deploy-api.
- **Terraform**: čisté moduly, remote state S3+DynamoDB s lockem, SG scoping.
- **CONTRACTS.md je přesný** (spot-check 5 endpointů — vše sedí).
- **Mobile compliance základy**: permission strings kompletní a lokalizované,
  ikony/splash OK, EAS remote versioning + autoIncrement.

---

## Nálezy podle domény

### A. Backend (apps/api) — 460 souborů, 88 modulů, 435 endpointů

| Sev | Nález | Ref |
|---|---|---|
| HIGH | **0 testů, žádný test script ani jest config** — 435 endpointů, ~25 money/XP transaction flows bez safety netu | apps/api/package.json |
| HIGH | **`strictNullChecks: false` + `noImplicitAny: false`** override v apps/api/tsconfig.json → 545× `: any`, 208× `as any`; null-crash třída neviditelná pro kompilátor | apps/api/tsconfig.json |
| HIGH | **Žádný centrální Claude wrapper** — 13 služeb dělá `new Anthropic(...)` (23 instancí, ~27 hardcoded model stringů), žádná sdílená response cache → opakované AI náklady | form-check, ai-insights, coaching, … |
| MED | **N+1 writes**: gym-sessions.service.ts:54-81 vytváří sety po jednom v cyklu (má být `createMany`); 13 služeb s loop+await prisma patternem | gym-sessions.service.ts:54 |
| MED | **Pagination opt-in**: ~137 z 222 `findMany` bez `take` — feedy/historie porostou bez limitu | — |
| MED | **Indexy tenké na dominantním query shape**: 127 modelů, jen 48 indexů s userId a 20 s datem; per-user time-series čtení (journal, sessions) budou skenovat | prisma/schema.prisma |
| MED | **100 % hard-delete** — žádné `deletedAt` na UGC (posts/clips/duels); moderace a recovery nevratné | schema.prisma |
| MED | `(this.prisma as any).$transaction` casty na kritických multi-write cestách | drops:49, paid-challenges:81,124, experiences:119, clips:179 |
| LOW | 13 souborů přes 300řádkový budget; ai-insights.service.ts 878 řádků, funkce 60+ řádků | ai-insights.service.ts |

### B. Web (apps/web) — 88 stránek, 306 souborů

| Sev | Nález | Ref |
|---|---|---|
| HIGH | **Netypovaná API vrstva**: 122× `Promise<any>` napříč lib/api/*; `@fitai/shared` použit jen pro pose typy — API DTO se ručně duplikují a driftují | lib/api/cross-industry.ts aj. |
| HIGH | **0 testů** (unit, component, e2e — nic; žádný Playwright/Cypress) | — |
| MED | **100 % client-side SPA na App Routeru**: 84/88 stránek "use client", 79 stránek useEffect+fetch, 0 server actions, 0 Suspense, 0 Next cache, 0 `loading.tsx` | — |
| MED | **Žádná data-fetching knihovna** — load/error/empty boilerplate kopírován na 58+ stránkách (214 spinner výskytů) | — |
| MED | **`base.ts` bez timeoutu/retry/typed errors** — visící request visí navždy; chyby jen string-match | lib/api/base.ts |
| MED | **SEO ~nulové**: metadata jen na 3 legal stránkách; landing a public stránky bez per-page metadata | — |
| MED | **43 stale `.d.ts` build artefaktů commitnutých ve src** (maskují typy, způsobily 2 z 9 tsc chyb) + v1/v2/v3 komponenty koexistují | src/components/* |
| MED | **@mediapipe/pose staticky importován** — ML/WASM payload v bundle gym/workout routes | lib/pose-detection.ts:1 |
| LOW | 0× next/image; V2Layout.tsx 527 řádků; drawer bez focus trapu | V2Layout.tsx |

### C. Mobile (apps/mobile) — 51 obrazovek, ~14,7k LOC

| Sev | Nález | Ref |
|---|---|---|
| **CRIT** | **Bundle ID mismatch**: app.json `cz.bfevents.fitai` vs eas.json submit `com.fitai.app` → submit selže/míří na špatný App Store record | app.json:18, eas.json:48 |
| HIGH | **Žádný globální ErrorBoundary** — jeden render throw = white screen celé appky | App.tsx |
| HIGH | **Žádný crash reporting** — Sentry zcela nenainstalovaný (nejen chybějící DSN) | package.json |
| MED | **Privacy manifest jen v efemérním ios/** (prebuild-generated, necommitované) — required-reason API deklarace bez config pluginu se ztratí | ios/FitAI/PrivacyInfo.xcprivacy |
| MED | **Push notifikace vypnuté** — expo-notifications odstraněno, stub vrací null, mrtvé call sites zůstaly | auth-context.tsx:22 |
| MED | **Žádná offline vrstva** — bez AsyncStorage/React-Query/NetInfo; appka bez signálu zcela mrtvá | — |
| MED | **api.ts: 154× any, žádný timeout/retry, 401 bez globálního logoutu** | lib/api.ts:17-35 |
| MED | **ClipsScreen (video feed) je ScrollView+map**, jen 3 FlatListy, 0 onEndReached (žádný infinite scroll navzdory cursor API), 0 expo-image | ClipsScreen |
| MED | Duplicitní native stacky: vision-camera + expo-camera; worklets + worklets-core | package.json |
| LOW | ~27 web routes bez mobile protějšku (Marketplace, Creators, Messages, Settings, Notifications inbox, …) | ROADMAP.md:97 |

### D. Infrastruktura + CI/CD

| Sev | Nález | Ref |
|---|---|---|
| **CRIT** | **RDS single-AZ** (`multi_az=false`), jediná DB instance, bez repliky | modules/database/main.tf:21 |
| HIGH | **Jediný NAT gateway v 1 AZ** — smrt té AZ = ztráta egress pro obě private subnets (Secrets/ECR/Anthropic) = totální outage | modules/networking/main.tf:47 |
| HIGH | **Web autoscaling target existuje, ale policy CHYBÍ** — web se nikdy neškáluje nad 1 task | modules/compute/main.tf:399 |
| HIGH | **Žádný ECS deployment circuit breaker / rollback** — crash-looping image se nasadí bez automatické záchrany | modules/compute/main.tf:333 |
| HIGH | **Prisma bez `connection_limit`** — 3 api tasky × default pool vs. t3.micro ~112 connections = riziko vyčerpání | database/outputs.tf:3, prisma.service.ts |
| HIGH | **`prisma db push --accept-data-loss` v prod deployi** — tichý drop sloupců, žádná migration history, žádný pre-migrate snapshot, ne-expand/contract | deploy.yml:109-146 |
| MED | Redis single node bez failoveru/snapshotů (zároveň cache + throttle store) | modules/cache/main.tf:6 |
| MED | Migrate task def (`fitai-migrate:3`) + subnety/SG hardcoded v deploy.yml, mimo Terraform | deploy.yml:127 |
| MED | Chybí alarmy: web service CPU/mem, p99 latence, per-TG 5XX, RunningTaskCount; **Sentry ve web appce zcela chybí** | modules/monitoring/main.tf |
| MED | Dvojitý deploy (buildspec post_build i deploy.yml force-new-deployment); žádná build cache v CodeBuild; žádný terraform plan v CI | buildspec.yml:19 |
| MED | ALB idle timeout default 60 s vs. SSE streaming endpointy | modules/compute/main.tf:260 |
| LOW | Web TG health check matcher "200-404" — 404 se počítá jako healthy | modules/compute/main.tf:294 |

### E. Testing & procesy

| Sev | Nález | Ref |
|---|---|---|
| **CRIT** | **CI je nefunkční**: ci.yml používá pnpm (`pnpm install --frozen-lockfile`), ale repo je npm (package-lock.json, žádný pnpm-lock.yaml) → install spadne; odstranění `\|\| echo` z security auditu je do vyřešení tohoto kosmetické | .github/workflows/ci.yml |
| **CRIT** | **0 automatizovaných testů v celém monorepu** — jediná síť je status-200 smoke proti živé produkci | — |
| HIGH | **test-production.sh self-passes při výpadku auth**: když demo login selže, všechny auth checky se počítají jako PASS → totální auth outage = zelených 115/115 | test-production.sh:71,84-99 |
| HIGH | **Smoke test není gate** — běží až po přepnutí trafficu, failure jen zčervená job, žádný rollback | deploy.yml |
| HIGH | **9 reálných tsc chyb v apps/web** (skryté nefunkčním CI): stale .next typy na smazanou showcase page, RefObject/unknown chyby, duplicate @types/react | apps/web |
| HIGH | **npm audit**: web 1 critical + 2 high; api 3 high + 18 moderate (qs DoS chain) | — |
| MED | Žádný build check na PR (první kompilace až v post-merge CodeBuildu); check-api-conventions.sh a verify-docs-integrity.sh nejsou v CI | ci.yml |
| MED | Žádný staging, žádné feature flags, žádné git tagy/verze — každý merge do main = okamžitý prod release pro všechny | — |
| MED | Žádný Dependabot/Renovate, žádný secret scanner (gitleaks) | .github/ |
| LOW | MODULES.md drift: 84→87 modulů, 388→435 endpointů, 121→127 modelů, 47→52 screens | MODULES.md |

---

## Monumentální plán zlepšení

Fázovaný podle principu: nejdřív zastavit krvácení (gate + rollback), pak
postavit síť (testy + staging), pak typová páteř, pak resilience, pak launch
a výkon. Effort: S = hodiny, M = ~1 den, L = vícedenní.

### Fáze 0 — Okamžité opravy (1 den, vše S, žádné riziko)

| # | Akce | Effort |
|---|---|---|
| 0.1 | **Opravit ci.yml pnpm→npm** (`npm ci`, `npm run --workspace`) — bez toho žádná další CI práce nemá smysl | S |
| 0.2 | **Opravit bundle ID mismatch** app.json vs eas.json (ověřit proti App Store Connect recordu) | S |
| 0.3 | **Opravit 9 tsc chyb ve web** (smazat stale .next typy + 43 commitnutých .d.ts artefaktů, sjednotit @types/react) | S |
| 0.4 | **Web autoscaling policy** (`aws_appautoscaling_policy.web_cpu` — target už existuje) | S |
| 0.5 | **ECS deployment circuit breaker + rollback** na obou services | S |
| 0.6 | **Prisma `connection_limit`** v DATABASE_URL | S |
| 0.7 | **test-production.sh: auth outage = FAIL**, ne PASS | S |
| 0.8 | Commitnout rozpracované security-audit infra fixy (working tree) + terraform apply s `AWS_PROFILE=fitai` | S |

### Fáze 1 — Bezpečnostní síť (1–2 týdny)

| # | Akce | Effort | Impact |
|---|---|---|---|
| 1.1 | **Test infrastruktura**: jest config + `test` scripty; první vlna unit testů na čistou business logiku (TDEE, 1RM/Epley, XP/level/streak, recovery score, plateau detection) + auth/ownership guard testy + ~25 $transaction money/XP flows | L | Critical |
| 1.2 | **Build gate na PR**: `nest build` + `next build` + testy + check-api-conventions.sh + verify-docs-integrity.sh v ci.yml | S | High |
| 1.3 | **Bezpečné migrace**: přechod na `prisma migrate deploy` s baseline migrací (`migrate diff`), zrušit `--accept-data-loss`, pre-migrate RDS snapshot v deploy jobu, expand/contract disciplína | M | Critical |
| 1.4 | **Playwright e2e** na kritické flows (login/register, gym session, food log, plan edit) | M | High |
| 1.5 | **Supply chain**: Dependabot + gitleaks v CI; vyřešit 1 critical (web) + 3 high (api) npm audit | M | High |
| 1.6 | **Smoke test s shape assertions** (jq) na top 20 endpointů | S | Med |
| 1.7 | **Git tagy per deploy** + dokumentovaný rollback runbook (`aws ecs update-service --task-definition <prev>`) | S | Med |

### Fáze 2 — Typová páteř (1–2 týdny, největší dlouhodobá páka)

| # | Akce | Effort | Impact |
|---|---|---|---|
| 2.1 | **`@fitai/shared` jako skutečná contract layer**: API response DTO typy sdílené api ↔ web ↔ mobile (nahrazuje ruční CONTRACTS.md policing); postupně po doménách | L | High |
| 2.2 | **Web: nahradit 122× `Promise<any>`** typy ze shared | L | High |
| 2.3 | **Mobile: nahradit 154× `any` v api.ts** + otypovat auth-context | M | High |
| 2.4 | **Backend: zapnout `strictNullChecks` + `noImplicitAny`** incrementálně (per-modul burn-down 545 any) | L | High |
| 2.5 | **Centrální `ClaudeService`**: jeden klient, model config na jednom místě, retry, cost tracking, **response cache** (prompt hash + user context) — migrace 13 služeb | L | High (přímá úspora AI nákladů) |
| 2.6 | Otypovat `$transaction` klienty (odstranit `as any` casty na drops/paid-challenges/experiences/clips) | S | Med |

### Fáze 3 — Resilience & scale (1–2 týdny, částečně vyžaduje maintenance okna)

| # | Akce | Effort | Destruktivní? |
|---|---|---|---|
| 3.1 | **RDS Multi-AZ** (+ zvážit RDS Proxy pro pooling) | M | Failover okno |
| 3.2 | **VPC endpoints** (S3/ECR/Secrets/Logs) — řeší NAT SPOF částečně + šetří NAT data cost | M | Ne |
| 3.3 | **Redis → replication group** s failoverem (odemkne i encryption/auth z security backlogu H3) | M | Ano — recreate, cache cold start |
| 3.4 | **Chybějící alarmy**: web CPU/mem, p99 latence, per-TG 5XX, RunningTaskCount < desired; **Sentry do apps/web** | S–M | Ne |
| 3.5 | **Staging prostředí** (env var už existuje ve variables.tf) — smoke + k6 míří na staging místo produkce | L | Ne |
| 3.6 | **Migrate task def do Terraformu** (subnety/SG z outputs, ne hardcoded) | M | Ne |
| 3.7 | CodeBuild layer cache + odstranit dvojitý deploy; terraform plan v CI na PR | M | Ne |
| 3.8 | ALB idle_timeout zvýšit pro SSE; web TG health check matcher opravit (bez 404) | S | Ne |
| 3.9 | RDS storage_encrypted (snapshot-restore) + rotace secrets z tfvars — pending z security auditu 2026-06 | M–L | Ano |

### Fáze 4 — Mobile launch + výkon (souběžně s 1–3)

| # | Akce | Effort | Kdy |
|---|---|---|---|
| 4.1 | Globální ErrorBoundary v App.tsx | S | Před submitem |
| 4.2 | Sentry react-native (i s pending DSN) | S–M | Před submitem |
| 4.3 | Privacy manifest přes config plugin (ne efemérní ios/) | M | Před submitem |
| 4.4 | Push story: obnovit expo-notifications (APNs .p8) nebo odstranit mrtvý kód | M | Před submitem |
| 4.5 | api.ts: timeout + retry + globální 401 logout event | M | Po submitu |
| 4.6 | Offline vrstva (React-Query + persist / write queue pro logy a sety) | L | Po submitu |
| 4.7 | Feed/video/photo listy → FlatList + expo-image + onEndReached pagination + memoized items | M–L | Po submitu |
| 4.8 | Parity: Settings, Notifications inbox, Messages, Creators (API bindings už existují) | L | Po submitu |

### Fáze 5 — Web modernizace + DX (průběžně, nižší priorita)

| # | Akce | Effort |
|---|---|---|
| 5.1 | React Query/SWR na webu — nahradí 79 ručních useEffect fetch flows | L |
| 5.2 | `<DataState>`/`useFetch` abstrakce → kolaps loading/error/empty boilerplate z 58 stránek | M |
| 5.3 | base.ts: AbortController timeout, retry pro GET, typed errors | S |
| 5.4 | Per-page metadata (SEO) na public/marketing stránky | M |
| 5.5 | Dynamic import @mediapipe/pose (odlehčí gym/workout bundle) | S |
| 5.6 | Backend výkon: gym-sessions createMany, composite indexy userId+createdAt, default pagination helper, soft-delete na UGC | M–L |
| 5.7 | Rozpad 5 souborů > 500 řádků (ai-insights, coaching, social, nutrition, workout-journal) + V2Layout | M |
| 5.8 | Auto-generovat MODULES.md county skriptem (drift 84→87 / 388→435 / 121→127) | S |
| 5.9 | Reachability pass na v1 komponenty + úklid mrtvého kódu | M |

---

## Doporučené pořadí startu

1. **Fáze 0 celá** — 8 položek, každá v hodinách, nulové riziko, okamžitě
   odstraní 2 critical (CI, bundle ID) a 3 high (autoscaling, circuit breaker,
   pool limit).
2. **1.1 + 1.2 + 1.3** — testy + PR gate + bezpečné migrace: než se sáhne na
   cokoliv dalšího, musí existovat síť.
3. **2.5 ClaudeService** — jediná položka s přímou měsíční úsporou (AI náklady).
4. Zbytek podle kapacity; Fáze 4.1–4.4 kdykoliv před App Store submitem.
