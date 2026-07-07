# Session 2026-07 — Co jsme vytvořili (kompletní přehled)

Souhrn celé session: platform hardening (vlny 0-5), launch-readiness audit,
a code+security review všech změn s opravami. ~40 commitů, 3 audit kola,
5 produkčních deployů (všechny zelené).

Detaily jednotlivých témat: `AUDIT-2026-07-PLATFORM.md`,
`AUDIT-2026-07-LAUNCH-READINESS.md`, `SECURITY-AUDIT-2026-06.md`, `CHANGELOG.md`.

---

## 1. Nové soubory (vytvořené v session)

### Backend — testy & business logika
- `apps/api/jest.config.js` — jest + @swc/jest (první test infra v repu)
- `apps/api/tsconfig.build.json` — vyloučí `*.spec.ts` z nest buildu
- `apps/api/src/claude/claude.service.ts` + `claude.models.ts` + `claude.module.ts`
  — **centrální ClaudeService** (jeden Anthropic klient, model registry, retry,
  metriky, opt-in cache s userId izolací)
- `apps/api/src/nutrition/nutrition.calculations.ts` — extrahovaný TDEE/makra výpočet
- `apps/api/src/onboarding/one-rm.helpers.ts` — extrahovaný Epley 1RM
- **Testy (10 spec souborů, 95+ testů):** `claude.service.spec.ts`,
  `progress/xp-levels.spec.ts`, `progress/progress.service.spec.ts`,
  `ai-insights/ai-insights.helpers.spec.ts`, `nutrition/nutrition.calculations.spec.ts`,
  `onboarding/one-rm.helpers.spec.ts`, `creator-economy/creator-economy.service.spec.ts`,
  `drops/drops.service.spec.ts`, `paid-challenges/paid-challenges.service.spec.ts`

### Backend — DB migrace (přechod na prisma migrate)
- `apps/api/prisma/migrations/0_init/migration.sql` — baseline (127 tabulek)
- `apps/api/prisma/migrations/20260702121120_add_session_time_series_indexes/`

### Sdílené typy (contract layer)
- `packages/shared/src/api/{index,cross-industry,marketplace,gamification}.ts`
  — **128 API contract typů** odvozených ze skutečných service returns

### Mobile
- `apps/mobile/src/components/ErrorBoundary.tsx` — root error boundary

### Skripty & CI
- `scripts/check-destructive-migration.sh` — CI guard na destruktivní DDL
- `scripts/check-schema-drift.sh` — drift check live DB vs schema
- `.github/dependabot.yml` — npm + actions + terraform weekly

### Dokumentace
- `docs/AUDIT-2026-07-PLATFORM.md` — platformní audit + fázovaný plán
- `docs/AUDIT-2026-07-LAUNCH-READINESS.md` — bezpečnostní launch audit
- `docs/SECURITY-AUDIT-2026-06.md` — infra security audit
- `docs/RUNBOOK-rollback.md` — rollback procedury (3 úrovně)
- `docs/MOBILE-BUILD-CHECKLIST.md` — checklist pro EAS build
- `docs/SESSION-2026-07-SUMMARY.md` — tento dokument
- `.envrc` — pin `AWS_PROFILE=fitai`

---

## 2. Nové features & schopnosti

| Feature | Popis |
|---|---|
| **Funkční CI** | ci.yml přepsán z pnpm→npm (nikdy neběžel); build+test+lint+typecheck+conventions+docs+gitleaks+terraform+migration guardy |
| **Automatizované testy** | Jest + 95+ unit testů na kritickou logiku (XP/streak/level, recovery score, Epley, TDEE, atomic XP debit, ClaudeService) |
| **Prisma migrate pipeline** | Přechod z `db push --accept-data-loss` na `migrate deploy` (ADR-22): baseline, destructive-DDL approval gate (GitHub environment), pre-migrate RDS snapshot |
| **Deploy safety** | ECS circuit breaker + auto-rollback, rolloutState gate, git tagy per deploy, ordered deploy (migrace před kódem) |
| **Centrální ClaudeService** | ADR-23: model registry, retry, cost tracking, response cache s userId izolací; 13 služeb migrováno |
| **Shared API typy** | ADR-24: contract layer web↔shared, −100+ `Promise<any>` |
| **Observabilita** | 8 CloudWatch alarmů (web CPU/mem, api p99, per-TG 5XX, RunningTaskCount, AI spend tripwire), VPC endpoints |
| **Mobile odolnost** | ErrorBoundary, api timeout + globální 401 logout + GET retry |

---

## 3. Nová infrastruktura (aplikováno v produkci)

- Deployment circuit breakery na obou ECS services
- Web autoscaling policy (dřív se web nikdy neškáloval)
- **Redis cluster obnoven** (byl smazán v úsporném režimu)
- S3 public-access-block + SSE, RDS deletion protection
- 8 nových CloudWatch alarmů + SNS email
- VPC endpoints (S3 gateway + ECR/Secrets/Logs interface)
- CodeBuild docker layer cache
- Terraform-managed migrate task (NODE_ENV=production, rev 5)
- DATABASE_URL connection_limit=8, api max_capacity=10 (reconciled)
- RDS Multi-AZ připraveno za `var.multi_az` (apply na okno)

---

## 4. Opravené chyby (audity + review)

### Bezpečnost
- 🔴 **Demo admin re-seed** — migrate task bez NODE_ENV vytvářel admin@fitai.com
  se známým heslem; opraveno (NODE_ENV=production). ⚠️ existující účet = user action
- 🔴 **XP double-spend** (drops, paid-challenges) — TOCTOU → atomický gte debit
- 🔴 **npm audit CRITICAL** — Next 14.2.21→14.2.35 (patch)
- 🟠 **Migration approval bypass** — scan celý push range místo HEAD~1
- 🟠 **DB connection exhaustion** — connection_limit × max_capacity reconciled
- 🟡 destructive-guard regex rozšířen, marker neobchází deploy approval
- ClaudeService cache-key userId izolace (prevence cross-user leak)

### Funkčnost
- **CI nikdy neběžel** (pnpm/npm) — 9 skrytých tsc chyb ve webu
- **Smoke test se sám oklamal** při výpadku auth
- **Terraform drift** — reconcile s produkcí (jinak by apply revertoval květen)
- **13 stránek** četlo neexistující API pole (5 crashovalo) → zarovnáno na kontrakt
- gym-sessions N+1 → createMany

---

## 5. Nové procesy & konvence (ADR)

- **ADR-22:** `prisma migrate deploy` místo `db push` (supersedes ADR-2)
- **ADR-23:** centrální ClaudeService místo per-service Anthropic klientů
- **ADR-24:** `@fitai/shared/src/api/*` jako contract layer
- Konvence migrace: `migrate dev --name <change>`, destruktivní DDL vyžaduje
  `.approved-destructive` (CI) + production-migrations reviewer (deploy)

---

## 6. Čeká na uživatele (launch blockery)

| Akce | Proč |
|---|---|
| **Smazat/změnit heslo admin@fitai.com** | Live admin účet s heslem demo1234 v produkci |
| **Rozhodnout platby** | Billing je mock, tiery se nevynucují (free vs IAP/Stripe) |
| **IAM grant rds-predeploy-snapshots** | Aby pre-migrate snapshot fungoval (příkaz v RUNBOOK) |
| **RDS Multi-AZ flip** | Kód ready, potřebuje maintenance okno |
| **Sentry DSN (web+mobile)** | Crash reporting připravený, čeká na klíč |
| **EAS rebuild** | Mobile fixy do binárky (docs/MOBILE-BUILD-CHECKLIST.md) |
| **Auth hardening** | bcrypt 10→12, JWT alg pin, refresh token — zamčené soubory, čeká na souhlas |

Zbytek prioritizovaného backlogu: `ROADMAP.md` §2b.
