# Claude Code Bible — Kompletní systém pro bezpečný a udržitelný vývoj

# VERZE 4.2 — Production Hardening Edition (19. 4. 2026)

> **Účel:** Univerzální blueprint pro nové i existující projekty. Načti v projektu, CC upraví/vytvoří infrastrukturu podle tohoto dokumentu.
> **Použití v novém projektu:** `"Přečti @~/claude-code-bible.md a vytvoř kompletní infrastrukturu."`
> **Použití v existujícím projektu:** `"Přečti @~/claude-code-bible.md, proveď audit současného nastavení a navrhni co upravit."`
>
> **Změny v4.2 oproti v4.1:**
>
> - **Nová kap. 9a: Production smoke test pattern** — `test-production.sh` pro ověření živé produkce po deployi (real endpoints, auth flow, routing sanity)
> - **Nová kap. 9b: CONTRACTS.md** — zámčené API shapes + DB modely, prevence breaking changes AI agentem
> - **Nová kap. 9c: Protect-files hook** — deterministická ochrana (exit 2) oproti soft CLAUDE.md pravidlům
> - **Nová kap. 9d: Projekt-specifické rules** — `.claude/rules/api.md`, `mobile.md` atd. kontextově per doména
> - **Nová kap. 9e: SCALING.md** — dedicated scaling plan oddělený od ARCHITECTURE.md
> - **Aktualizovaný TOC** s novými podkapitolami 9a-9e
>
> **Zdroj změn:** Real-world patterns z FitAI projektu (28 NestJS modulů, React Native + Expo mobile, AWS ECS infra). Production-validated přes 60+ smoke testů a 30+ sessions.
>
> **Změny v4.1 oproti v4.0:**
>
> - **Nová kap. 5a: Archive rhythm + doc sustainability** — systém pro udržení auto-loaded docs pod kontrolou i po 100+ sessions
> - **Nová kap. 5b: Doc integrity verification** — `pnpm docs:verify` skript + ARCHIVE-INDEX.md single source of truth + 8 machine-verifiable invariantů
> - **Rozšíření kap. 3 ARCHITECTURE**: ADR table pattern + "load-bearing ADRs never split" invariant
> - **Rozšíření kap. 5 CHANGELOG**: phase-based structure + `**Phase X COMPLETE**` marker jako archive trigger
> - **Rozšíření kap. 6 MEMORY**: project-summary.md rotation rule při každém phase-complete
> - **Nová kap. 8a: Reusable architectural patterns** (two-flag gate, non-fatal hooks, P2002 idempotency, serializable transactions)
> - **Nová kap. 14a: Session handoff pattern** — SESSION-NOTES.md + /resume-session skill
> - **Rozšíření kap. 18 Best practices**: auto mode + /clear strategy + size budget awareness
> - **Nová šablona 20H: verify-docs-integrity.sh** + **20I: ARCHIVE-INDEX.md** + **20J: resume-session skill**
> - **Aktualizované šablony**: CLAUDE.md root má sekci "Archive rhythm" (~15 řádků)
>
> **Zdroj změn:** Real-world learning ze SwingAI projektu (Session 36 post-Phase-N refactor, 2026-04-19). Auto-load zredukován ze 307 KB na 74 KB (-76%) při zachování všech 49 ADRs + 67 historických session entries. Produkční validovaný pattern.

---

## Filozofie

**Kód je dokumentace. Docs jsou navigace. CC je nástroj, ne autopilot.**

| Soubor | Účel |
|--------|------|
| CLAUDE.md | JAK pracovat (pravidla, příkazy, styl) |
| ROADMAP.md | CO dělat (checkboxy, pořadí, pending fáze) |
| ARCHITECTURE.md | KDE hledat (přehled + ADR table + odkazy na kód) |
| CHANGELOG.md | CO SE STALO (phase-based session entries s archive rhythm) |
| ARCHIVE-INDEX.md | JAKÝ ARCHIV MÁME (single source of truth pro historické docs) |
| SESSION-NOTES.md | KDE JSME (session handoff pro /resume po /clear) |
| .claude/agents/ | KDO pomáhá (specializovaní subagenti) |
| .claude/skills/ | JAK to dělat (opakovatelné workflow, /resume-session) |
| .claude/settings.json | CO JE POVOLENO (permissions, hooks) |
| scripts/verify-docs-integrity.sh | ZDA JE VŠE OK (8 invariantů, <1s) |

**Klíčové invarianty v4.1:**

1. **Kód je pravda** — závislosti CC zjišťuje přímo z kódu (grep), ne z markdown kopie
2. **Docs nerosťou lineárně** — Archive rhythm + size budget gates udržují auto-load stable
3. **Nikdy nic neztratíme** — archive files + bidirectional reference graph + git history
4. **ADRs jsou load-bearing** — ARCHITECTURE.md ADR table nikdy nesplitu ani nekondenzuj
5. **Move, don't compress** — archive verbatim, rollback přes `git revert`

---

## Obsah

1. [Hierarchie souborů a jak se načítají](#1-hierarchie-souborů)
2. [CLAUDE.md — Ústava projektu](#2-claudemd--ústava-projektu)
3. [ARCHITECTURE.md — Stručná mapa + ADR table](#3-architecturemd--stručná-mapa)
4. [ROADMAP.md — Plán s checkboxy](#4-roadmapmd--plán-s-checkboxy)
5. [CHANGELOG.md — Phase-based log](#5-changelogmd--phase-based-log)
   - 5a. [Archive rhythm + doc sustainability](#5a-archive-rhythm--doc-sustainability) 🆕
   - 5b. [Doc integrity verification](#5b-doc-integrity-verification) 🆕
6. [MEMORY systém — Auto-memory + rotation rule](#6-memory-systém)
7. [Ochrana proti přepisování kódu](#7-ochrana-proti-přepisování-kódu)
8. [Kvalita kódu — Měřitelná pravidla](#8-kvalita-kódu)
   - 8a. [Reusable architectural patterns](#8a-reusable-architectural-patterns) 🆕
9. [Testování, self-review a security audit](#9-testování-self-review-a-security-audit)
   - 9a. [Production smoke test pattern](#9a-production-smoke-test-pattern) 🆕
   - 9b. [CONTRACTS.md — Zámčené API shapes](#9b-contractsmd--zámčené-api-shapes) 🆕
   - 9c. [Protect-files hook](#9c-protect-files-hook--deterministická-ochrana-souborů) 🆕
   - 9d. [Projekt-specifické rules](#9d-projekt-specifické-rules) 🆕
   - 9e. [SCALING.md — Dedicated scaling plan](#9e-scalingmd--dedicated-scaling-plan) 🆕
10. [Komunikace a schvalování](#10-komunikace-a-schvalování)
11. [Bezpečnost](#11-bezpečnost)
12. [Infrastruktura — Audit-first](#12-infrastruktura)
13. [Skills — Opakovatelné workflow](#13-skills--opakovatelné-workflow)
14. [Subagenti — Izolovaní specialisté](#14-subagenti--izolovaní-specialisté)
    - 14a. [Session handoff pattern (/resume-session)](#14a-session-handoff-pattern) 🆕
15. [Hooks — Deterministická automatizace](#15-hooks--deterministická-automatizace)
16. [Permission režimy a sandbox](#16-permission-režimy-a-sandbox)
17. [Extended thinking a effort](#17-adaptive-thinking-a-effort)
18. [Best practices](#18-best-practices)
19. [Kompletní workflow](#19-kompletní-workflow)
20. [Šablony](#20-šablony)
21. [Jak tento manuál použít](#21-jak-tento-manuál-použít)

---

## 1. Hierarchie souborů

```
~/.claude/
├── CLAUDE.md                         # Globální preference (všechny projekty)
├── settings.json                     # Globální nastavení CC
├── rules/                            # Osobní pravidla
├── agents/                           # Osobní subagenti
├── skills/                           # Osobní skills
└── projects/
    └── <projekt>/
        └── memory/
            ├── MEMORY.md             # Auto-memory index (CC píše sám)
            └── *.md                  # Tématické soubory (project-summary, feedback, reference)

/tvuj-projekt/
├── CLAUDE.md                         # ⭐ Projektová ústava (~100–200 řádků + Archive rhythm)
├── CLAUDE.local.md                   # Osobní nastavení (v .gitignore)
├── .claude/
│   ├── settings.json                 # Permissions, hooks, deny list
│   ├── rules/security.md             # Security pravidla pro kód
│   ├── agents/                       # ⭐ Projektové subagenty (code-reviewer, security-reviewer)
│   └── skills/                       # ⭐ Projektové skills (deploy, fix-issue, resume-session)
├── docs/
│   ├── ARCHITECTURE.md               # ⭐ Stručná mapa + ADR table (NEVER archive)
│   ├── ROADMAP.md                    # ⭐ Banner + pending phases (completed → archive)
│   ├── CHANGELOG.md                  # ⭐ Phase-based entries (recent phase only, older → archive)
│   ├── SESSION-NOTES.md              # Session handoff pro /resume (lazy-load)
│   ├── ARCHIVE-INDEX.md              # Single source of truth pro archives
│   ├── CHANGELOG-archive/            # Historical session entries per phase
│   │   ├── 2026-04-foundation.md
│   │   ├── 2026-04-phase5.md
│   │   └── ...
│   └── ROADMAP-archive/              # Completed phase checklists
│       └── 2026-04-phase1-7.md
├── scripts/
│   └── verify-docs-integrity.sh      # 🆕 8 invariantů, runnable kdykoli
└── ...
```

### Jak se soubory načítají

| Typ | Kdy se načte | Pozn. |
|-----|-------------|-------|
| `CLAUDE.md` (root) | Automaticky při KAŽDÉM startu | Proto musí být stručný |
| `docs/ARCHITECTURE.md` | @-import z CLAUDE.md, auto-load | ADR table LOAD-BEARING |
| `docs/ROADMAP.md` | @-import z CLAUDE.md, auto-load | Banner + pending phases |
| `docs/CHANGELOG.md` | @-import z CLAUDE.md, auto-load | **Jen recent phase** — starší v archive |
| `docs/*-archive/*.md` | Lazy-load (Read on demand) | Historical detail |
| `docs/SESSION-NOTES.md` | Lazy-load via /resume-session skill | Session handoff |
| Auto-memory (MEMORY.md) | Prvních ~25KB automaticky | Project summary + feedback |

### Klíčové pravidlo v4.1: Auto-load má tvrdý rozpočet

Cílová velikost auto-loaded docs per session: **≤ 85 KB / ~22k tokenů**.

Distribuce (ověřená v produkci):

- `CLAUDE.md`: ~6 KB
- `docs/ROADMAP.md`: ≤ 10 KB (budget gate)
- `docs/ARCHITECTURE.md`: ~45 KB (49+ ADRs, NEVER archive)
- `docs/CHANGELOG.md`: ≤ 40 KB (budget gate — triggers archive when exceeded)
- Memory folder: ~17 KB

Bez rozpočtu (typické po 30+ sessions) auto-load roste na 300+ KB / 76k+ tokenů → context degrades. **Archive rhythm + size budget gates** (viz kap. 5a+5b) to řeší systematicky.

---

## 2. CLAUDE.md — Ústava projektu

### Co v něm MÁ být (max ~100–200 řádků):

1. **Identita** (3–5 ř.) — název, co to je, pro koho
2. **Tech stack** (5–10 ř.)
3. **Struktura repozitáře** (10–15 ř.)
4. **Příkazy** (5–10 ř.) — build, test, lint, deploy, **docs:verify** 🆕
5. **Pravidla** (40–50 ř.) — workflow, kód, bezpečnost, komunikace
6. **Archive rhythm** (10–15 ř.) 🆕 — phase-complete trigger + size budgets
7. **Importy** (3–5 ř.) — @references na další soubory

### Co v něm NEMÁ být:

- ❌ Generické rady ("piš čistý kód")
- ❌ Celá architektura (→ docs/ARCHITECTURE.md)
- ❌ Roadmap (→ docs/ROADMAP.md)
- ❌ Katalog funkcionalit (→ kód je dokumentace)
- ❌ Dlouhé příklady kódu (→ .claude/skills/)
- ❌ Citlivé údaje (API klíče, hesla)
- ❌ Historické session entries (→ docs/CHANGELOG-archive/)

### Importy (@references)

```markdown
See @docs/ROADMAP.md for current phase.
See @docs/ARCHITECTURE.md for system overview + ADRs.
See @docs/CHANGELOG.md for recent phase entries.
# Archive integrity:
# Run `pnpm docs:verify` před push nebo po archive operaci.
```

### Efektivita instrukcí

- **Velikost:** Cíl pod 200 řádků (~6 KB). Delší = více tokenů, horší adherence
- **Archive rhythm sekce** (v4.1): ~15 řádků dokumentující trigger rule + size budgets + rotation
- **Důraz:** IMPORTANT, YOU MUST — zvyšuje adherenci pro kritická pravidla
- **Git:** Commituj CLAUDE.md

---

## 3. ARCHITECTURE.md — Stručná mapa + ADR table

Žije v `docs/ARCHITECTURE.md`. Účel: rychlá orientace + load-bearing architectural decisions.

### Kritická struktura

```markdown
# Architektura [Název projektu]
> Poslední aktualizace: YYYY-MM-DD

## Přehled
[1 odstavec — co systém dělá, pro koho]

## Diagram komponent
[ASCII/Mermaid — hlavní komponenty a propojení]

## Tech Stack
[Table]

## Struktura repozitáře
[Stromová struktura]

## Kde hledat detaily (čti přímo kód)
- DB schéma: @prisma/schema.prisma
- API endpointy: @backend/src/**/*.controller.ts
- ...

## Klíčová rozhodnutí (ADRs) — LOAD-BEARING

| #   | Datum      | Rozhodnutí                             | Důvod                                   |
| --- | ---------- | -------------------------------------- | --------------------------------------- |
| 1   | 2026-04-13 | Turborepo + pnpm monorepo              | Sdílení kodu, jednotný tooling          |
| 2   | 2026-04-13 | PostgreSQL (bez PostGIS)               | Haversine v JS pro MVP                  |
| 3   | 2026-04-14 | Two-flag gate pro external services    | Zabrání silent no-op v přechodu         |
| 4   | 2026-04-15 | Non-fatal cross-service hooks          | Core persistence never breaks downstream |
| ... | ...        | ...                                    | ...                                     |
```

### ⚠️ INVARIANT v4.1: ADR table NIKDY nesplituj, NIKDY nekondenzuj

ADRs jsou **load-bearing safety net proti "zjednodušení"** které by rozbilo systém. Každý ADR encoduje _proč_ je nějaké rozhodnutí takto — bez něj mohou budoucí AI/dev "vylepšit" systém a rozbít invariant.

**Příklady load-bearing ADRs:**

- Two-flag gate pattern (`SERVICE_WIRED=true AND credentials` — proč ne jen credentials check)
- Non-fatal `.catch(() => undefined)` hooks (proč ne error bubbling)
- UTC midnight normalization pro daily bookkeeping (proč ne per-timezone)
- Serializable transaction pro capacity check (proč ne optimistic locking)

Pokud Claude potřebuje kontext "proč je ten kód takto divný?", ADR table je první místo kam se dívá.

### Kdy aktualizovat ARCHITECTURE.md

**POUZE** při:

- Změna tech stacku
- Změna struktury repozitáře
- Nový ADR (přidej row, nikdy nepřepisuj existing)
- Změna diagramu komponent

**NE** při:

- Každé nové feature (→ CHANGELOG.md)
- Úpravě CSS (→ CHANGELOG.md)
- Novém endpointu (→ CHANGELOG.md + kód je pravda)

### ADR numbering pravidlo

ADRs jsou append-only. Když decision je superseded, **přidej nový ADR** a v původním row přidej "Superseded by ADR #N (date)" do Důvod column. **Nikdy nemaž původní row** — historie rozhodnutí je důležitá.

---

## 4. ROADMAP.md — Plán s checkboxy

Žije v `docs/ROADMAP.md`. Hlavní navigační soubor pro CC.

### Kritická struktura (v4.1)

```markdown
# Roadmap [Název projektu]

> **Aktuální fáze:** Phase X COMPLETE / Phase Y opening
> **Next up:** Phase Y.1 — [krátký popis]

## Completed phases (lazy-load detail)

Všech N dokončených fází:

- Phase 1 ✅ · Phase 2 ✅ · ... · Phase X ✅
- Viz `@docs/ROADMAP-archive/YYYY-MM-phase1-X.md` pro detailní checklisty

## Pending phases

### Phase Y — [Název] ([M sessions S[N]-S[N+M-1]])

- **Y.1** [Krok 1 s 1-větným popisem]
- **Y.2** [Krok 2]
- **Y.3** [Krok 3]

### Phase Z — [Název] ([M sessions])
...

## ⏸ Deferred to end

- **Phase J** Stripe — 3 sessions, blokováno na API keys
- **Phase H** Mobile — 4+ sessions, blokováno na EAS

## Stav po Session N (YYYY-MM-DD)

~M commitů, X automated checks, Y modulů, Z ADRs...
```

### Pravidla v4.1

- **CC zaškrtne checkbox** ihned po dokončení kroku
- **Po Phase COMPLETE** (marker `✅` v banneru) se detailní checklisty přesunou do `docs/ROADMAP-archive/YYYY-MM-phaseA-B.md`
- **Aktivní ROADMAP** drží banner + pending phases + deferred section (~ 50-80 řádků, pod 10 KB budget)
- Archive rhythm trigger viz kap. 5a

---

## 5. CHANGELOG.md — Phase-based log

### Struktura v4.1

Session entries seskupené podle fáze. Každý entry dokumentuje **jednu session**.

```markdown
# Changelog

> Aktivní changelog drží aktuálně otevřenou/poslední dokončenou fázi (Sessions A-B · Phase X [COMPLETE?]). Pro starší záznamy viz archivy (chronologicky nejstarší → nejnovější):
>
> - @docs/CHANGELOG-archive/YYYY-MM-foundation.md — Phase 1-4 foundation (Sessions 1-7)
> - @docs/CHANGELOG-archive/YYYY-MM-phase5.md — Phase 5
> - ...
>
> Archive rhythm: každý `**Phase X COMPLETE**` entry triggeruje archive v opening commitu NÁSLEDUJÍCÍ fáze. Viz CLAUDE.md "Archive rhythm" sekce.

## [YYYY-MM-DD] — Session N: Phase Y.Z · [Headline] · **Phase Y COMPLETE** 🎯

**M commits.** [1-2 sentence summary — co bylo done, proč to matters].

### Commits

| #   | Commit    | Delta                                         |
| --- | --------- | --------------------------------------------- |
| 1   | `abc1234` | feat(api): [co to dělá a proč]                |
| 2   | `def5678` | test(api): [jaký coverage]                    |

### Strategic patterns (Session N)

- **Pattern name** — krátký popis s odkazem na ADR (kde to platí, proč)
- **Pattern 2** — ...

### Metrics delta

| Metric | Before | After | Δ |
| --- | ---: | ---: | ---: |
| API tests | N | N+K | +K |
| Prisma models | N | N+1 | +1 |

### Next (Session N+1 candidate — Phase Y.Z+1)

**Phase Y.Z+1 — [Název].** [1-2 sentence popis co je next step]
```

### Pravidla v4.1

- **1 session = 1 entry** (ne multiple dates v jednom entry)
- **Headline má Phase X.Y reference** + emoji pro vizuální scan
- **`**Phase X COMPLETE**`** v titulku = archive trigger (následující session otevře next phase)
- **Commits table** s SHA + delta — AI dokáže najít přes `git show abc1234`
- **Strategic patterns** — krátké bullets, odkaz na ADRs pokud patří do kategorie reusable
- **Metrics delta** — before/after čísla (tests, modules, migrations)
- **Next candidate** — 1-2 sentence forward-looking

### Size discipline (v4.1)

- **Cíl: ≤ 80 řádků per session entry** (pro zralou fázi)
- **150 řádků = soft warn threshold** (verify script upozorní, nespadne)
- **Pattern proven v produkci:** Sessions 32-36 měly 11-50 řádků průměr

---

## 5a. Archive rhythm + doc sustainability 🆕

**Problem, který řeší:** Docs rostou lineárně s každou session (~30-60 řádků/entry). Za 30 sessions = 1500+ řádků aktivního CHANGELOG = 180 KB = 59% auto-load budget. Context degrades, token savings evaporate.

**Řešení:** Automatický archive trigger na phase-completion markers + size budget gates + bidirectional reference graph.

### Archive rhythm rule

**Trigger:** CHANGELOG entry s title obsahujícím `**Phase X COMPLETE**`.

**Kdy se spustí:** V opening commitu **NÁSLEDUJÍCÍ fáze** (ne hned po dokončení — recent handoff context se drží čitelný o 1 session déle).

**Kroky (atomic commit):**

1. Vytvoř `docs/CHANGELOG-archive/YYYY-MM-phase-<x>.md`:
   - 6-řádkový header: title, archived date, session range, source path, back-pointer `@docs/CHANGELOG.md`
   - Body: copy-paste session entries dané fáze z aktivního CHANGELOG (verbatim, no compression)
2. Smaž tyto entries z aktivního `docs/CHANGELOG.md`
3. Update banner pointer list v CHANGELOG.md
4. Přidej řádek do `docs/ARCHIVE-INDEX.md`
5. Pokud archivuješ Phase který měl detailní checklisty v ROADMAP → archivuj do `docs/ROADMAP-archive/`
6. Spusť `pnpm docs:verify` → očekáváno exit 0
7. Single atomic commit: `docs(archive): Phase X CHANGELOG archive + open Phase Y`

### Size budget gates

| Soubor | Max velikost | Akce při exceed |
| --- | ---: | --- |
| `docs/CHANGELOG.md` | 40 KB | Archive rhythm (fáze musí být COMPLETE) |
| `docs/ROADMAP.md` | 10 KB | Archive completed phase checklists |
| Memory `project-summary.md` | 10 KB | Rotate předchozí fázi na 1-liner |

**Verifikace:** Skript `scripts/verify-docs-integrity.sh` (viz kap. 5b) gateuje exit 1 při breach — blokuje push nebo upozorní user.

**Steady state (s rhythm + budgets):** ≤ 2 nejnovější fáze aktivní (~10 sessions, 35-50 KB), ADR table intact (45 KB), celkem ~85 KB auto-load.

### Bidirectional reference graph

Aby AI věděla o všech archivech i aktivních docs:

1. **Active → Archive** (forward pointers): banner v CHANGELOG + banner v ROADMAP obsahuje `@docs/CHANGELOG-archive/*.md` nebo `@docs/ROADMAP-archive/*.md` pointery
2. **Archive → Active** (back-pointers): header každého archive souboru obsahuje `@docs/CHANGELOG.md` nebo "návrat na aktivní changelog" back-pointer
3. **Memory index** (`reference-docs.md`): lists all archive files pro lazy-load navigation
4. **ARCHIVE-INDEX.md**: single source of truth pro "jaké archives máme"

Ztrata nebo korupce kteréhokoli pointer = detekovatelná `pnpm docs:verify` (viz kap. 5b).

### Memory `project-summary.md` rotation rule

Při každém phase-complete:

1. **Předchozí aktivní fáze** (např. Phase M když zavírá Phase N) → zkrátit do 1-liner historical entry
2. **Nově dokončená fáze** (Phase N) → přesun do "Aktuální stav" s full detail (~20-30 řádků)
3. **Nová pending fáze** (Phase O) → update "Next up" s 3-5 řádky summary
4. Verify `wc -c project-summary.md` < 10 KB

Bez rotation project-summary roste lineárně každou fázi. S rotation drží stable 5-8 KB napříč celým projektem.

### "Move, don't compress" princip

**Nikdy nekondenzuj archivované entries.** Kopíruj verbatim. Důvody:

- `git revert` každý archive commit = content se vrátí do aktivního docs (rollback-safe)
- Budoucí AI při lazy-read archive soubor vidí original verbose context (reasoning preserved)
- Žádné subjektivní rozhodnutí "co je důležité" — všechno se zachová

**Jediná povolená změna** při archivaci: přidání 6-řádkového header banneru s metadata + back-pointer.

### Tabulka: Doc lifecycle

| Stav | Žije kde | Načte se kdy | Přežije /clear? |
| --- | --- | --- | --- |
| Aktivní recent phase | `docs/CHANGELOG.md` | Auto-load každá session | ✅ |
| Archived completed phase | `docs/CHANGELOG-archive/*.md` | Lazy-load přes Read | ✅ (disk) |
| Aktivní pending phases | `docs/ROADMAP.md` | Auto-load každá session | ✅ |
| Archived completed checklists | `docs/ROADMAP-archive/*.md` | Lazy-load přes Read | ✅ |
| ADR table | `docs/ARCHITECTURE.md` | Auto-load (NEVER archive) | ✅ |
| Session handoff | `docs/SESSION-NOTES.md` | Via /resume-session skill | ✅ (disk) |
| Archive registry | `docs/ARCHIVE-INDEX.md` | Lazy-load pro audit | ✅ |

---

## 5b. Doc integrity verification 🆕

### `scripts/verify-docs-integrity.sh` — 8 invariantů, <1 sekunda

Safety net nad archive rhythm + size budgets. Jedna komanda říká "✅ vše OK" nebo "❌ broken reference zde".

**Co kontroluje:**

1. **Session header integrity** — active CHANGELOG + všechny archives = total count (no drift)
2. **Forward pointers resolve** — každý `@docs/CHANGELOG-archive/*` nebo `@docs/ROADMAP-archive/*` v banneru vede na existující soubor
3. **Back-pointers present** — každý archive soubor obsahuje back-pointer na aktivní docs
4. **ARCHIVE-INDEX.md sync** — count rows v index tabulce = count souborů v `docs/CHANGELOG-archive/` + `docs/ROADMAP-archive/`
5. **ADR count regression guard** — ARCHITECTURE.md drží ≥ N ADRs (podle projektu), detekuje smazaný row
6. **CHANGELOG size budget** — aktivní CHANGELOG ≤ 40 KB (konfigurovatelné)
7. **ROADMAP size budget** — ≤ 10 KB
8. **Memory project-summary budget** — ≤ 10 KB
9. **Per-session entry soft warn** — >150 lines = informative warning (no exit fail)

**Invocation:**

```bash
bash scripts/verify-docs-integrity.sh
# nebo via pnpm wrapper:
pnpm docs:verify
```

**Exit 0 = healthy. Exit 1 = broken + diagnostic output.**

### Kdy spouštět

| Scénář | Kdo | Jak |
| --- | --- | --- |
| Před `git push` do origin/main | User | `pnpm docs:verify` |
| Po manuální editaci `docs/*` | User | `pnpm docs:verify` |
| Po archive rhythm operaci | AI (automaticky) | Spouští v archive commit flow |
| Při podezření "něco se rozbilo" | User | `pnpm docs:verify` |
| V CI pipeline (Phase R+) | Husky pre-commit hook | Automaticky před commit |

### `docs/ARCHIVE-INDEX.md` — single source of truth

Human-readable tabulka všech archive souborů. Místo procházení banner pointerů v multiple docs, user/AI vidí všechno v jednom místě.

**Struktura:**

```markdown
# [Project] Archive Index

> Single source of truth pro všechny archive soubory. Udržuje se ručně při každé archive rhythm operaci; `pnpm docs:verify` ověří sync s filesystem.

## CHANGELOG archives

| Soubor | Obsah | Date archived | Bytes | Headers |
| --- | --- | --- | ---: | ---: |
| `docs/CHANGELOG-archive/2026-04-foundation.md` | Sessions 1-7a · Phase 1-4 | 2026-04-18 | 9419 | 2 |
| `docs/CHANGELOG-archive/2026-04-phase5.md` | Phase 5.1-5.3 | 2026-04-18 | 19894 | 12 |
| ... | ... | ... | ... | ... |

**CHANGELOG total:** N archive files · M session headers · ~K KB

## ROADMAP archives

| Soubor | Obsah | Date archived | Bytes |
| --- | --- | --- | ---: |
| `docs/ROADMAP-archive/2026-04-phase1-7.md` | Phase 1-7 checklists | 2026-04-19 | 21618 |

## Active (NEVER archived — current working set)

| Soubor | Obsah | Approx bytes |
| --- | --- | ---: |
| `docs/CHANGELOG.md` | Recent phase entries | ~20000 |
| `docs/ROADMAP.md` | Banner + pending phases | ~5000 |
| `docs/ARCHITECTURE.md` | Přehled + ADRs (NEVER archive) | ~45000 |

## Next scheduled archive operation

Per Archive rhythm (CLAUDE.md): archive se spouští v opening commitu fáze NÁSLEDUJÍCÍ po dokončené.

- **Phase N** (Sessions X-Y) dokončena → archive proběhne v opening commitu Session Y+1
- Nový archive: `docs/CHANGELOG-archive/YYYY-MM-phase-n.md`

## Safety invariants

Viz `scripts/verify-docs-integrity.sh`.
```

### Šablona scriptu v kap. 20H.

---

## 6. MEMORY systém — Auto-memory + rotation rule

### Auto-memory (CC v2.1.59+)

CC si automaticky ukládá poznámky do `~/.claude/projects/<projekt>/memory/`:

- **MEMORY.md** — index (prvních 200 řádků / 25KB se načte na startu)
- **project-summary.md** — high-level stav projektu (LOAD-BEARING, rotate při phase complete — viz níže)
- **Tématické soubory** — CC čte on-demand (feedback-*, reference-docs...)
- Auto-memory defaultně zapnutá; toggle přes `/memory` nebo `autoMemoryEnabled: false`

### project-summary.md rotation rule (v4.1)

**Problem:** Bez rotation project-summary roste s každou fází (akumuluje Phase 1 detail + Phase 2 detail + ...). Za 10 fází = 50+ KB memory overhead.

**Pravidlo:** Při každém `**Phase X COMPLETE**` entry v CHANGELOG:

1. **Dokončená fáze** se zapíše do "Aktuální stav" s full detail (~25 řádků)
2. **Předchozí** aktivní fáze (ta co byla v "Aktuální stav" před tím) → zkrátit na 1-line historical entry v "Historical Phase milestones" sekci
3. **Nová pending fáze** → update "Next up" sekci (~5 řádků)
4. Verify `wc -c project-summary.md` < 10 KB

**Ověřeno v produkci:** project-summary drží ~7-8 KB napříč 30+ sessions.

### Vyloučení CLAUDE.md souborů

Pro monorepa nebo repozitáře s vendored CLAUDE.md:

```json
{
  "claudeMdExcludes": [
    "**/node_modules/**/CLAUDE.md",
    "vendor/**/CLAUDE.md"
  ]
}
```

### Co přežije /clear a /compact:

| Typ informace | Kde žije | Přežije /clear? | Přežije /compact? |
|---------------|----------|-----------------|-------------------|
| Pravidla, stack | CLAUDE.md | ✅ Vždy | ✅ Re-injected |
| Architektura + ADRs | docs/ARCHITECTURE.md | ✅ | ✅ |
| Roadmap + pending | docs/ROADMAP.md | ✅ | ✅ |
| Recent CHANGELOG | docs/CHANGELOG.md | ✅ | ✅ |
| Archive CHANGELOGs | docs/CHANGELOG-archive/*.md | ✅ (lazy) | ✅ (lazy) |
| Session handoff | docs/SESSION-NOTES.md | ✅ (via skill) | ✅ (lazy) |
| Auto-memory index | MEMORY.md | ✅ | ✅ |
| project-summary (rotated) | memory/project-summary.md | ✅ | ✅ |
| Rozpracovaný kontext | kontext window | ❌ | ⚠️ |

### /clear vs /compact:

- **/clear** preferuj pro nové tasky — čistý kontext = lepší výsledky. Pak `/resume-session` pro re-load (viz kap. 14a).
- **/compact** jen když opravdu potřebuješ zachovat kontext v jedné session
- /compact s focusem: `/compact focus on the API changes`

---

## 7. Ochrana proti přepisování kódu

### Hlavní princip: Závislosti se zjišťují Z KÓDU, ne z docs

```
## Ochrana existujícího kódu

### Před úpravou existujícího kódu (POVINNÉ):
1. Najdi VŠECHNY soubory které importují/volají to co chceš změnit:
   → spusť: grep -r "import.*NázevModulu" src/
   → spusť: grep -r "NázevFunkce" src/
   → spusť: grep -r "NázevEndpointu" src/
2. Vypiš mi ČESKY:
   - CO chceš změnit
   - KTERÉ soubory to volají/importují (výsledek grep)
   - JAKÝ bude dopad
3. Čekej na schválení

### Během práce:
- Nová funkcionalita = nové soubory nebo PŘIDÁNÍ kódu, NE přepisování
- Pokud v průběhu zjistíš že potřebuješ změnit další soubor →
  ZASTAV se a řekni mi PROČ

### Zakázané vzory (BEZ VÝJIMKY):
- Mazání importů "protože se zdají nepoužité"
- Přesouvání souborů bez aktualizace VŠECH referencí
- Změna signatury existující funkce (přidej novou, starou deprecatuj)
- Přepsání celého souboru místo cílené edity
- NIKDY nerefaktoruj kód který funguje bez mého výslovného souhlasu

### Git:
- Commituj po KAŽDÉM dokončeném kroku
- Commit message: "feat: popis" / "fix: popis" / "refactor: popis"
- Nikdy force push na main
```

---

## 8. Kvalita kódu

```
Maximální délka funkce: 30 řádků. Pokud je delší → rozděl.
Maximální délka souboru: 300 řádků. Pokud je delší → rozděl.
Maximálně 3 úrovně zanoření (if/for/try). Pokud víc → extrahuj funkci.
Žádné abstrakce "pro budoucnost" — řeš JEN aktuální požadavek.
Žádné generické utility "pro případ že se to bude hodit".
Pojmenování: název funkce/proměnné musí říkat CO dělá, ne JAK.
Každá funkce dělá JEDNU věc.
DRY až od 3. opakování — 2x duplikovaný kód je OK.
```

---

## 8a. Reusable architectural patterns (v4.1) 🆕

Patterns ověřené v produkci. Když je použiješ, dokumentuj jako ADR v ARCHITECTURE.md.

### Pattern 1: Two-flag gate pro external service integration

**Problem:** Rozvoj s externí API (Stripe, SendGrid, LiveKit) vyžaduje stub → real přechod. Bez explicit gate riziko silent no-op v produkci.

**Řešení:**

```typescript
// env schema
SENDGRID_API_KEY: z.string().optional()
SENDGRID_WIRED: z.enum(['true', 'false']).default('false')

// service
async sendEmail(...) {
  const wired = this.config.get('SENDGRID_WIRED') === 'true'
  const apiKey = this.config.get('SENDGRID_API_KEY')

  if (!wired || !apiKey) {
    // Graceful stub — log to DB, no external call
    await this.saveEmailToOutbox(...)
    return { sent: false, reason: 'service-not-wired' }
  }

  // Real SendGrid call here
  ...
}
```

**Dvě flagy nutné:**

1. `SERVICE_WIRED=true` (explicit team-level decision "tohle je připravené")
2. `SERVICE_API_KEY` (credentials present)

Bez obou → stub path. Zabrání silent no-op v přechodovém období.

**Dokumentuj jako ADR:** "ADR #N: Two-flag gate pattern pro [service]"

### Pattern 2: Non-fatal cross-service hooks

**Problem:** Hlavní service akce (např. SwingService.analyze) má více downstream efektů (XP award, streak tick, feed activity). Pokud kterýkoli selže, core persistence nesmí selhat.

**Řešení:**

```typescript
async analyze(input) {
  // Core write — critical path
  const analysis = await this.prisma.swingAnalysis.create({...})

  // Downstream effects — non-fatal
  await this.gamification.awardXp(userId, 'swing_analyzed', analysis.id)
  await this.streak.recordActivity(userId).catch(() => undefined)
  await this.activities.create({
    userId,
    type: 'swing_analyzed',
    ...
  }).catch(() => undefined)

  return analysis
}
```

**Klíčové:** `.catch(() => undefined)` swalluje downstream errors. Core persistence succeed/fail independently.

**Dokumentuj jako ADR:** "ADR #N: Cross-service non-fatal hooks pattern"

### Pattern 3: P2002 idempotency (Prisma)

**Problem:** Opakovaná operace (např. `follow()`, `assignForTomorrow()`) musí být idempotentní. Race condition: 2 concurrent requests mohou oba pass pre-check a oba fail na unique constraint.

**Řešení:**

```typescript
async follow(userId, targetHandle) {
  try {
    await this.prisma.playerFollow.create({
      data: { followerId: userId, followingHandle: targetHandle }
    })
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      // Already following — idempotent success
      return { following: true }
    }
    throw err
  }
  return { following: true }
}
```

Prisma unique constraint se používá jako "semantic lock". První write wins, second get P2002 → treat as success.

### Pattern 4: Serializable transaction pro capacity race

**Problem:** Booking flow (tournament entry, experience booking) musí dodržet capacity limit. Pre-check + write bez transakce = TOCTOU race.

**Řešení:**

```typescript
async enter(userId, slug) {
  return this.prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({ where: { slug } })

    if (typeof tournament.capacity === 'number') {
      // Re-check INSIDE transaction
      const liveCount = await tx.tournamentEntry.count({
        where: { tournamentId: tournament.id, status: { in: ['pending', 'confirmed'] } }
      })
      if (liveCount >= tournament.capacity) {
        throw new BadRequestException('Tournament is full')
      }
    }

    return tx.tournamentEntry.create({
      data: { tournamentId: tournament.id, userId, status: 'pending' }
    })
  }, { isolationLevel: 'Serializable' })
}
```

Postgres serializable isolation forcuje retry na losing concurrent writer → "Tournament is full" surfaces consistently.

### Pattern 5: UTC midnight normalization pro daily bookkeeping

**Problem:** Daily streak / daily challenge musí být idempotentní per kalendářní den v UTC. User může spustit `recordActivity()` několikrát za den; všechny akce patří k stejnému řádku.

**Řešení:**

```typescript
function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ))
}

async recordActivity(userId: string, now = new Date()) {
  const today = startOfUtcDay(now)
  // Upsert keyed on (userId, today) — same-day repeats collapse
  await this.prisma.userStreak.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, activityCount: 1 },
    update: { activityCount: { increment: 1 } }
  })
}
```

UTC midnight = jediný stable "day" across timezones. Pro user-facing display lze pak převést na local time.

### Pattern 6: Pure helper functions pro date math

**Problem:** Date manipulace v service classes = hard to unit test (requires NestJS mocking).

**Řešení:** Extract do pure module-level functions:

```typescript
// Pure functions — no NestJS, no state
export function weekKeyFor(date: Date): string { ... }
export function weekBoundsFor(key: string): { start: Date, end: Date } { ... }
export function yearBoundsFor(year: number): { start: Date, end: Date } { ... }
export function isWithinVisibilityWindow(year: number, now?: Date): boolean { ... }

// Service uses them
async getWeeklyRecap(userId, weekKey) {
  const { start, end } = weekBoundsFor(weekKey)
  ...
}
```

Pure functions = jest-friendly without mocking. Unit test coverage 100% trivial.

---

## 9. Testování, self-review a security audit

```
## Testování — po KAŽDÉ implementaci

1. Spusť unit testy: npm run test -- --filter=<modul>
2. Spusť lint: npm run lint
3. Spusť type check: npm run typecheck
4. Pro API změny: otestuj endpoint (curl/httpie)
5. Pro UI změny: ověř renderování
6. Pro doc změny (v4.1): pnpm docs:verify 🆕
Pokud test selže → OPRAV HNED. Nepokračuj.

## Self-review — po KAŽDÉM dokončeném kroku

Spusť: git diff --stat
Projdi KAŽDÝ změněný soubor a ověř:
- Změnil jsem POUZE to co souvisí s taskem?
- Nezměnil jsem signaturu existující funkce?
- Nesmazal jsem import/kód který používá jiná část systému?
- Přidal jsem test pro novou logiku?
- Neobsahuje kód hardcoded secrets?
- Je každý user input validovaný?
Pokud COKOLIV nesedí → VRAŤ změnu před pokračováním.

## Security audit — po dokončení KAŽDÉ feature

1. Input validace
2. Autorizace
3. Secrets
4. SQL/XSS
5. Rate limiting
6. Error handling
Pokud najdeš problém → OPRAV HNED.

## Po úpravě existujícího kódu — navíc:

Spusť testy pro VŠECHNY soubory které importují/volají to co jsi změnil.
```

---

## 10. Komunikace a schvalování

```
## Komunikace při schvalování

Když žádáš o schválení JAKÉKOLIV akce, VŽDY vysvětli ČESKY:
1. CO přesně chceš udělat
2. PROČ to potřebuješ pro aktuální task
3. CO se změní / jaký bude dopad
4. KTERÉ existující části to může ovlivnit

Příklad SPRÁVNĚ:
"Potřebuji nainstalovat 2 balíčky:
- stripe (oficiální SDK pro platby)
- @nestjs/config (environment proměnné)
Důvod: Implementace Stripe checkout podle ROADMAP Phase J.1.5.
Dopad: Přidá závislosti do package.json."

## Zakázané režimy
- NIKDY nepoužívej --dangerously-skip-permissions
- Automatický režim POUZE pro: čtení, testy, git status/diff
```

---

## 9a. Production smoke test pattern 🆕

**Problem:** Unit testy a linting ověřují kód, ale ne produkční deployment. Rozbité environment variables, chybějící secrets, ALB routing, CORS — nic z toho unit test nezachytí.

**Řešení:** Dedikovaný `test-production.sh` bash skript co testuje ŽIVOU produkci:

```bash
#!/usr/bin/env bash
# test-production.sh — smoke test against live production
set -euo pipefail

BASE_URL="${1:-https://your-app.example.com}"
PASS=0; FAIL=0

check() {
  local desc="$1" url="$2" expect="$3"
  local status=$(curl -sS -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "$expect" ]; then
    echo "  ✓ $desc"; PASS=$((PASS + 1))
  else
    echo "  ✗ $desc (got $status, expected $expect)"; FAIL=$((FAIL + 1))
  fi
}

echo "[1] Health & API"
check "GET /health" "$BASE_URL/health" "200"
check "GET /api/exercises" "$BASE_URL/api/exercises" "200"
# ... (přidej všechny endpointy + frontend pages)

echo "[2] Auth flow"
TOKEN=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@app.com","password":"demo1234"}' | jq -r '.accessToken')
check "Auth token obtained" "$BASE_URL/api/auth/me" "200"

echo "[3] Frontend pages"
check "GET /" "$BASE_URL/" "200"
check "GET /dashboard" "$BASE_URL/dashboard" "200"
# ...

echo "[4] Routing sanity"
check "/api/exercises returns JSON" "$BASE_URL/api/exercises" "200"
check "/exercises returns HTML" "$BASE_URL/exercises" "200"

echo "=== Summary ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
[ "$FAIL" -eq 0 ] && echo "✓ All tests passed." && exit 0
echo "✗ $FAIL test(s) failed." && exit 1
```

### Kdy spouštět

| Scénář | Kdo |
|---|---|
| Po KAŽDÉM deployi (CI/CD post-deploy step) | Automaticky |
| Před release / merge do main | Manuálně |
| Po infrastrukturní změně (ALB, DNS, secrets) | Manuálně |
| Podezření na produkční bug | Manuálně |

### Pravidla

- **Všechny testy MUSÍ projít** před pokračováním v práci po deployi
- Smoke test testuje ŽIVOU produkci, ne lokální dev — ověřuje celý stack (DNS → ALB → ECS → DB → external APIs)
- Demo účet s read-only oprávněním pro auth testy
- Nikdy neukládej citlivá hesla do skriptu — použij env variables nebo demo credentials
- Přidávej nové testy po každé nové feature/endpointu

### V CLAUDE.md přidej:

```markdown
## Testování a review
- Po KAŽDÉM deployi: `bash test-production.sh` — VŠECHNY testy musí projít
```

---

## 9b. CONTRACTS.md — Zámčené API shapes + DB modely 🆕

**Problem:** AI agent může "vylepšit" API response shape nebo přejmenovat DB sloupec, čímž rozbije všechny klienty. Bez explicit contract souboru je každá změna potenciální breaking change.

**Řešení:** Dedikovaný `CONTRACTS.md` v root projektu:

```markdown
# [Project] — API & DB Contracts

> Tyto kontrakty jsou ZÁMČENÉ. Změna vyžaduje výslovný souhlas.
> CC: Před jakoukoliv změnou v tomto souboru se ZEPTEJ.

## API Endpoints (locked shapes)

### POST /api/auth/login
Request: { email: string, password: string }
Response: { user: User, accessToken: string }
Status: 200 (success), 401 (invalid credentials)

### GET /api/exercises
Response: Exercise[] (viz DB model níže)
Status: 200

[... všechny endpointy ...]

## DB Models (locked fields)

### User
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK, auto-generated |
| email | String | unique |
| name | String | |
| level | Enum | BEGINNER/INTERMEDIATE/EXPERT |
[...]

## Zámčené soubory (nepřepisovat bez souhlasu)

- `apps/api/src/auth/*` — JWT auth flow
- `apps/api/src/main.ts` — globalPrefix('api')
- `prisma/schema.prisma` — DB schema (changes via prisma db push only)
[...]
```

### Proč je to důležité

1. **AI-safe:** CC vidí explicit "zámčeno" a nepřepisuje
2. **Breaking change prevence:** Klienti (web, mobile) závisí na přesném response shape
3. **Onboarding:** Nový developer/AI okamžitě vidí co nesmí měnit
4. **Review trigger:** Změna v CONTRACTS.md = red flag pro code review

### V CLAUDE.md přidej:

```markdown
## Ochrana existujícího kódu
- **IMPORTANT:** Viz @CONTRACTS.md pro zámčené API shapes a DB modely
- Změna CONTRACTS.md vyžaduje výslovný souhlas
```

---

## 9c. Protect-files hook — Deterministická ochrana souborů 🆕

**Problem:** CLAUDE.md pravidla "nepřepisuj bez souhlasu" závisí na AI compliance — pokud AI pravidlo přehlédne, soubor se přepíše. Hook je deterministický — VŽDY blokuje, bez výjimky.

**Řešení:** `.claude/hooks/protect-files.sh` + registrace v settings.json:

```bash
#!/usr/bin/env bash
# protect-files.sh — blocks Edit/Write on locked files
# Exit 2 = block tool execution (CC specific)

PROTECTED_PATTERNS=(
  "apps/api/src/auth/"
  "apps/api/src/main.ts"
  "lib/feedback-engine.ts"
  "lib/rep-counter.ts"
  "lib/safety-checker.ts"
)

FILE_PATH="$1"  # CC passes file path as argument

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "🚫 BLOCKED: $FILE_PATH is protected. Ask user for permission first."
    exit 2
  fi
done

exit 0
```

### Registrace v .claude/settings.json:

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

### Výhody oproti pravidlům v CLAUDE.md:

| Přístup | Enforcement | Bypass riziko |
|---|---|---|
| CLAUDE.md pravidla | AI adherence (soft) | AI může přehlédnout při komplexním tasku |
| protect-files.sh hook | Deterministický (hard) | Exit 2 = CC NEMŮŽE pokračovat bez user approval |

**Kombinuj obojí:** CLAUDE.md pro awareness ("tohle je chráněné"), hook pro enforcement ("tohle je blokované").

---

## 9d. Projekt-specifické rules (.claude/rules/) 🆕

**Problem:** Generický `security.md` rule file pokrývá OWASP top 10, ale nezná specifika tech stacku — NestJS routing konvence, Expo build pravidla, API prefix requirementy.

**Řešení:** Dedikované rule soubory per doména v `.claude/rules/`:

```
.claude/rules/
├── security.md     # Generická bezpečnost (OWASP, input validation, secrets)
├── api.md          # NestJS-specifická pravidla (routing, DTO, auth guards, throttle)
├── mobile.md       # React Native + Expo pravidla (native modules, EAS, Metro)
└── frontend.md     # Next.js/React pravidla (pokud potřeba)
```

### Jak CC rules fungují:

Rules se načítají **kontextově** — `.claude/rules/api.md` se aktivuje JEN když CC edituje soubory v `apps/api/`. Neblokují context window když pracuješ na mobile.

### Příklad api.md:

```markdown
# API Development Rules

Při editaci čehokoli v `apps/api/`:

## Routing
- Global prefix `/api/*` — NIKDY neměnit
- ALB: `/api/*` + `/health` → API, ostatní → Web

## Validace
- class-validator DTO na KAŽDÉM endpointu
- ValidationPipe globálně v main.ts

## Rate limiting
- @Throttle() na KAŽDÉM AI endpointu (ochrana budgetu)
- @UseGuards(JwtAuthGuard) na auth endpointech

## Model convention
- claude-haiku-4-5 pro coaching/tips
- claude-sonnet-4-6 pro vision (food, body photos)
```

### Příklad mobile.md:

```markdown
# Mobile Development Rules

Při editaci čehokoli v `apps/mobile/`:

## Native modules
- MUSÍ být v apps/mobile/package.json (NE root)
- Lazy require: try { require(...) } catch {}
- Před EAS buildem: expo prebuild --clean + pod install lokálně

## Voice pipeline
- Pipeline: coaching-engine → coaching-phrases → voice-coach → /api/coaching/tts
- MIC echo workaround: pauseCoach() / resumeCoach()

## API URL
- Default HTTPS produkce
- Lokální dev: EXPO_PUBLIC_API_URL env
```

### Proč je to lepší než jeden security.md:

1. **Kontextové načítání** — menší token footprint per task
2. **Domain expertise** — pravidla psaná pro konkrétní framework
3. **Udržovatelnost** — nový framework = nový soubor, ne editace monolitu
4. **Adherence** — kratší, specifičtější pravidla mají vyšší AI compliance

### V CLAUDE.md přidej:

```markdown
## Pravidla
- Security: auto-načítá se z .claude/rules/security.md
- API: auto-načítá se z .claude/rules/api.md při editaci apps/api/
- Mobile: auto-načítá se z .claude/rules/mobile.md při editaci apps/mobile/
```

---

## 9e. SCALING.md — Dedicated scaling plan 🆕

**Problem:** Scaling rozhodnutí (cache strategie, autoscaling, read replicas) jsou rozptýlená v ARCHITECTURE.md nebo v hlavě developera. Při růstu (100 → 10k → 1M DAU) chybí strukturovaný plán.

**Řešení:** Dedikovaný `SCALING.md` v root:

```markdown
# [Project] — Scale Readiness Plan

## Vrstvy (seřazeno podle ROI)

### Vrstva 1 — FREE quick wins (~1 den, +$20/mo, 100× capacity)
- Aggressive caching (Redis) pro read-heavy endpointy
- Database index audit
- Rate limiting per endpoint
- Autoscaling rules (CPU target tracking)
- Connection pooling

### Vrstva 2 — Observability (~půl dne, +$26/mo)
- CloudWatch/Datadog dashboard
- Alerting (CPU >80%, 5xx >10/5min)
- Structured logging
- AI usage custom metrics

### Vrstva 3 — Load testing (~1 den, $0)
- k6/Artillery test scenarios
- Baseline run
- Bottleneck identification
- Optimization + re-test

### Vrstva 4 — Paid upgrades (podle load test dat)
- DB upgrade (RDS larger instance)
- Read replicas
- Fargate Spot
- CDN optimization
```

### Proč separátní soubor (ne v ARCHITECTURE.md):

1. ARCHITECTURE.md = **jak systém funguje TEPRVE**
2. SCALING.md = **jak systém BUDE fungovat při zátěži** (plán, ne realita)
3. Oddělení = CC neplete current state s budoucí optimalizací

### V CLAUDE.md přidej:

```markdown
## Importy
See @SCALING.md for scale readiness plan (pokud potřebuješ optimalizovat).
```

---

## 11. Bezpečnost

[Beze změny od v4.0 — viz 11A Prompt Injection ochrana, 11B CC vestavěné ochrany, 11C Platby]

---

## 12. Infrastruktura — Audit-first

[Beze změny od v4.0]

---

## 13. Skills — Opakovatelné workflow

[Základ beze změny. Nová standardní skill: `resume-session` (viz kap. 14a a šablona 20J).]

---

## 14. Subagenti — Izolovaní specialisté

[Základ beze změny. Viz v4.0 pro full content.]

---

## 14a. Session handoff pattern 🆕

### Problem

Po `/clear` (doporučeno mezi nesouvisejícími tasky) AI ztrácí kontext. User musí:

1. Znovu vysvětlit co se dělá
2. Opakovat kam jsme se dostali
3. Čekat než AI načte všechny docs

### Řešení: `docs/SESSION-NOTES.md` + `/resume-session` skill

**SESSION-NOTES.md struktura:**

```markdown
# [Project] — Session N handoff (YYYY-MM-DD) · **Phase X COMPLETE** 🎯

## Where we are

**Sessions A-B shipla Phase X** — [2-3 sentence summary].

**Git state:** main clean, N commits ahead of origin/main.

**Next up:** Session N+1 · Phase Y.1 — [1-line description].

---

## Session-by-session recap Phase X (SA → SB)

### Session A — Phase X.1 [Headline]
[~5-line summary s commits, patterns, metrics]

### Session B — Phase X.2 ...
...

---

## Workflow patterns validated

- Pattern 1 — [krátký popis]
- Pattern 2 — ...

---

## Phase X — closing table

[Summary tabulka všech sub-phases]

---

## Session N+1 · Phase Y.1 scope

**Goal:** [co je cíl]

### Opening commit (archive rhythm)

1. Vytvoř docs/CHANGELOG-archive/YYYY-MM-phase-x.md
2. Smaž Phase X entries z aktivního CHANGELOG
3. Update banner + ARCHIVE-INDEX.md
4. Spusť `pnpm docs:verify` → expect exit 0
5. Single atomic commit

### Phase Y.1 deliverables

1. [Deliverable 1]
2. [Deliverable 2]
...

### Decision defaults (apply if user says nothing)

- [Decision 1]
- [Decision 2]

---

## Repository state snapshot

- N commits, M tests, K modules, L ADRs
- Auto-load disk: ~X KB (post-refactor)
- Archive files: N (M headers total)

---

## Known not-done (deferred)

- [Task 1] — deferred to Phase Z
- [Task 2] — ...
```

### `/resume-session` skill

**Umístění:** `.claude/skills/resume-session/SKILL.md`

**Co dělá:**

1. Přečte `docs/SESSION-NOTES.md` — current handoff
2. Přečte `docs/ROADMAP.md` — aktuální fáze + pending
3. Přečte `docs/CHANGELOG.md` (recent entries) — context co bylo právě done
4. Optional: spustí `git status` + `git log -5`
5. Optional: spustí test suite pro verifikaci
6. Shrne user česky v 5-8 větách: kde jsme, co je next, jaký plán

**Invocation:** `/resume-session` (user v nové konverzaci po /clear)

**Šablona v kap. 20J.**

### Workflow: /clear → /resume-session

```
Situace: User chce přepnout na novou úlohu nebo session context je degraded.

1. User: "uložíme state pro resume"
2. AI: aktualizuje docs/SESSION-NOTES.md s current state
3. AI: commit + push (volitelně)
4. User: /clear (new session)
5. User: /resume-session + "pokračuj [konkrétní instrukce]"
6. AI: skill loadne SESSION-NOTES + ROADMAP + CHANGELOG
7. AI: odpovídá "Podle handoff jsme na Phase X.1, plán: ..."
8. Work continues in fresh context
```

### Cadence

- SESSION-NOTES.md se aktualizuje **v opening commitu každé nové session** (součást archive rhythm flow)
- Alternatively: při user žádosti "ulož state" mid-session

---

## 15. Hooks — Deterministická automatizace

[Beze změny od v4.0. Doporučený hook pro v4.1:]

**PostToolUse hook pro docs:verify (volitelné):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "jq -r '.tool_input.file_path' | grep -qE 'docs/(CHANGELOG|ROADMAP|ARCHITECTURE)\\.md' && pnpm docs:verify || true"
        }]
      }
    ]
  }
}
```

Spustí verify po editaci active docs. Catch drift early.

---

## 16. Permission režimy a sandbox

[Beze změny od v4.0]

---

## 17. Adaptive thinking a effort

[Beze změny od v4.0]

---

## 18. Best practices

### Nejdůležitější pravidlo: Dej CC způsob jak ověřit svou práci

Testy, screenshoty, linting, expected outputs. Pro docs: `pnpm docs:verify`.

### Explore → Plan → Code → Commit

1. **Explore** (Plan Mode): CC čte soubory, odpovídá na otázky
2. **Plan**: CC navrhne detailní implementační plán
3. **Implement** (Normal Mode): CC kóduje a verifikuje
4. **Commit**: CC commitne s popisnou zprávou

### Kontext window management (v4.1)

- **Cíl:** auto-load ≤ 85 KB per session (díky archive rhythm)
- **Size budget gates** (`pnpm docs:verify`) alertují před překročením
- Používej **/clear** mezi nesouvisejícími tasky
- Po /clear použij **/resume-session** skill (ne manuální vysvětlování)
- Skills načítají tělo on-demand → neblokují kontext
- Subagenti pracují v izolovaném kontextu

### Auto mode pattern (v4.1)

Když user chce continuous execution bez interrupts:

```
Auto mode aktivní.
```

v prompt header = AI:

1. Nepřerušuje na routine decisions (používá reasonable defaults)
2. Nečeká na schválení pro low-risk akce
3. Ptá se jen na high-risk (destruktivní operace, externí services)
4. Řekne "Done" místo "Should I proceed?"

**Kdy použít:** víceletý multi-commit workflow, well-defined roadmap scope, trusting established patterns.

**Kdy NE použít:** new architecture decisions, security-sensitive changes, first-time patterns.

### Interview pattern pro větší features

```
Chci vybudovat [krátký popis]. Interview mě detailně pomocí AskUserQuestion.
Ptej se na technickou implementaci, UI/UX, edge cases, obavy a tradeoffs.
Neptej se samozřejmé otázky, kopej do těžkých částí.
Pokračuj dokud nepokryjeme vše, pak napiš spec do SPEC.md.
```

### Efektivní prompty

- Referencuj konkrétní soubory přes @path/to/file
- Zmiň constrainty a existující patterns
- Paste screenshoty pro UI práci
- Pipe data: `cat error.log | claude`

### Session management

- **Esc** — zastav CC mid-action
- **Esc + Esc** / **/rewind** — vrať konverzaci a kód
- **/clear** — reset kontextu mezi tasky
- **--continue** / **--resume** — pokračuj

---

## 18a. Git worktrees

[Beze změny od v4.0]

---

## 19. Kompletní workflow (v4.1)

```
1. CC START (nová session / po /clear)
   ↓ Automaticky načte:
   ├── ~/.claude/CLAUDE.md (globální)
   ├── /projekt/CLAUDE.md (projektový + Archive rhythm sekce)
   ├── .claude/rules/*.md
   ├── auto-memory (MEMORY.md + project-summary.md)
   ├── docs/ROADMAP.md (via @-import)
   ├── docs/ARCHITECTURE.md (via @-import, ADRs load-bearing)
   ├── docs/CHANGELOG.md (via @-import, recent phase only)
   └── skill popisy

   Target: auto-load ≤ 85 KB (verify: pnpm docs:verify)

2. ORIENTACE
   Option A: User napíše co chce dělat
   Option B: /resume-session skill → loadne SESSION-NOTES.md
   ↓ CC čte (jen pokud task vyžaduje):
   ├── docs/SESSION-NOTES.md (handoff detail)
   ├── docs/ARCHIVE-INDEX.md (co je v archivech)
   └── docs/CHANGELOG-archive/*.md (historické detaily on-demand)

3. OPENING COMMIT (pokud Phase X COMPLETE z minulé session)
   ↓ Archive rhythm:
   ├── Vytvoř docs/CHANGELOG-archive/YYYY-MM-phase-x.md
   ├── Smaž Phase X entries z aktivního CHANGELOG
   ├── Update banner + ARCHIVE-INDEX.md
   ├── Update memory/project-summary.md (rotate)
   ├── pnpm docs:verify → exit 0
   └── Single atomic commit

4. PLÁNOVÁNÍ (pro nový feature)
   ↓ CC:
   ├── Navrhne kroky
   ├── Pokud upravuje existující kód:
   │   → grep závislostí → vypíše dopad
   ├── Vypíše SEZNAM souborů
   └── Čeká na schválení

5. IMPLEMENTACE
   ↓ CC:
   ├── Napíše/upraví kód (max 30 ř./funkce)
   ├── Spustí testy + lint + typecheck
   ├── Self-review: git diff
   └── Commit: "feat: popis"

6. AKTUALIZACE DOCS
   ↓ VŽDY:
   ├── docs/ROADMAP.md → zaškrtni checkbox
   └── docs/CHANGELOG.md → nový session entry (≤ 80 lines)
   ↓ JEN při změně architektury/stacku:
   └── docs/ARCHITECTURE.md → nový ADR row (APPEND, never rewrite)
   ↓ Na konci session (pre-next-session):
   └── docs/SESSION-NOTES.md → update handoff

7. PO DOKONČENÍ FEATURE
   ↓ Security audit
   ↓ Code review subagent (volitelné)
   ↓ pnpm docs:verify (before push)

8. PUSH nebo /clear
```

---

## 20. Šablony

### 20A. Šablona CLAUDE.md (projektový root) — v4.1

```markdown
# [Název projektu]

## Přehled
[Jedna věta]

## Tech Stack
- Frontend: [...]
- Backend: [...]
- DB: [...]

## Struktura
[Stromová struktura]

## Příkazy
- Build: [příkaz]
- Test: [příkaz]
- Lint: [příkaz]
- Dev: [příkaz]
- **Docs verify:** `pnpm docs:verify` 🆕

## Importy
See @docs/ROADMAP.md for current phase.
See @docs/ARCHITECTURE.md for system overview + ADRs.
See @docs/CHANGELOG.md for recent phase entries.

## Před začátkem práce
1. Přečti @docs/ROADMAP.md — aktuální fáze
2. Přečti @docs/ARCHITECTURE.md — zorientuj se + ADRs
3. Pokud upravuješ existující kód:
   → grep závislostí → vypiš dopad → čekej na schválení

## Kvalita kódu
- Max 30 řádků/funkce, max 300/soubor, max 3 úrovně zanoření
- Žádné abstrakce "pro budoucnost"
- DRY až od 3. opakování

## Ochrana existujícího kódu
- **IMPORTANT:** Před úpravou: grep závislostí, vypiš dopad
- Nová funkcionalita = nové soubory
- **YOU MUST NEVER** refaktorovat fungující kód bez souhlasu

## Testování a review
- Po KAŽDÉ implementaci: testy + lint + typecheck
- Po KAŽDÉM kroku: git diff → self-review
- Po KAŽDÉ feature: security audit
- **IMPORTANT:** Pokud test selže → oprav HNED

## Aktualizace docs
- VŽDY: ROADMAP checkbox + CHANGELOG session entry (≤ 80 lines)
- JEN při změně architektury: ARCHITECTURE.md ADR row (append, never rewrite)

## Archive rhythm 🆕

Cíl: auto-load ≤ 85 KB per session. Bez rhythm CHANGELOG roste ~30 řádků/session bez limitu.

- Každý CHANGELOG entry ukončující fázi (`**Phase X COMPLETE**` v titulku) se archivuje v **opening commitu NÁSLEDUJÍCÍ fáze**:
  1. Vytvoř `docs/CHANGELOG-archive/YYYY-MM-phase-<x>.md` (header + session entries verbatim)
  2. Smaž tyto entries z aktivního `docs/CHANGELOG.md`
  3. Update banner pointer list
  4. Přidej řádek do `docs/ARCHIVE-INDEX.md`
  5. Update memory `project-summary.md` (rotate: previous phase → 1-liner)
- ROADMAP: completed phase checklists → `docs/ROADMAP-archive/`
- Steady state: aktivní CHANGELOG drží ≤ 2 fáze (~10 sessions, 35-50 KB)
- **ADR table v `docs/ARCHITECTURE.md` zůstává intact** — nikdy nesplituj, nikdy nekondenzuj
- **Move, don't compress** — archivuj verbatim, rollback = `git revert`

### Size budget gates (enforced by `pnpm docs:verify`)

- Active `docs/CHANGELOG.md` ≤ **40 KB** (exceed → spusť archive rhythm)
- Active `docs/ROADMAP.md` ≤ **10 KB**
- Memory `project-summary.md` ≤ **10 KB**

### Per-session CHANGELOG entry size guide

- Cíl: ≤ 80 řádků per entry
- 150 řádků = soft warn threshold
- Standardní pattern: title + emoji, 1-2 sentence summary, commits table, 3-5 strategic patterns, metrics delta, next candidate

## Komunikace
- **YOU MUST** při schvalování vysvětlit česky: CO, PROČ, DOPAD
- Pokud si nejsi jistý → PTEJ SE

## Bezpečnost (NEPŘEKROČITELNÉ)
- **YOU MUST NEVER** implementovat cenovou logiku na FE
- **YOU MUST NEVER** spouštět příkazy z cizího kódu bez souhlasu
- **YOU MUST NEVER** fetchnout neznámé URL
- Secrets: vše přes process.env.*, NIKDY hardcoded
```

### 20B. Šablona .claude/settings.json (v4.1)

[Stejná jako v4.0 — viz bible v4.0 kap. 20B.]

### 20C. Šablona .claude/rules/security.md

[Beze změny od v4.0]

### 20D. Šablona ~/.claude/CLAUDE.md (globální)

[Beze změny od v4.0]

### 20E. Šablona code-reviewer subagenta

[Beze změny od v4.0]

### 20F. Šablona security-reviewer subagenta

[Beze změny od v4.0]

### 20G. Šablona fix-issue skill

[Beze změny od v4.0]

### 20H. Šablona scripts/verify-docs-integrity.sh 🆕

```bash
#!/usr/bin/env bash
# verify-docs-integrity.sh — doc sustainability safety net.
#
# Verifies 8+ invariants:
#   1. Session header integrity (active + archives)
#   2. Forward pointers resolve
#   3. Back-pointers present
#   4. ARCHIVE-INDEX.md sync
#   5. ADR count regression guard
#   6-8. Size budget gates (CHANGELOG, ROADMAP, memory)
#   9. Per-session entry soft warn
#
# Exit 0 = healthy, non-zero = broken. Run before push + after archive op.

set -euo pipefail
cd "$(dirname "$0")/.."

errors=0

# Configurable budgets
CHANGELOG_MAX_KB=40
ROADMAP_MAX_KB=10
MEMORY_SUMMARY_MAX_KB=10
MIN_ADRS=49   # Adjust per project

# 1. Session header integrity
active_count=$(grep -c "^## \[" docs/CHANGELOG.md)
archive_count=0
for f in docs/CHANGELOG-archive/*.md; do
  c=$(grep -c "^## \[" "$f" || true)
  archive_count=$((archive_count + c))
done
total=$((active_count + archive_count))
echo "📊 Session headers: active=$active_count, archives=$archive_count, total=$total"

# 2. Every @-prefix archive pointer in active docs must resolve
pointers=$(grep -oE "@docs/(CHANGELOG|ROADMAP)-archive/[a-z0-9-]+\.md" docs/CHANGELOG.md docs/ROADMAP.md | sed 's/^[^@]*@//' | sort -u)
missing=0
for ref in $pointers; do
  if [ ! -f "$ref" ]; then
    echo "❌ Broken pointer: $ref"
    errors=$((errors + 1))
    missing=$((missing + 1))
  fi
done
if [ "$missing" -eq 0 ]; then
  pointer_count=$(echo "$pointers" | wc -l | tr -d ' ')
  echo "🔗 Active→archive pointers: $pointer_count (all resolve)"
fi

# 3. Every archive must have back-pointer to active
back_missing=0
for f in docs/CHANGELOG-archive/*.md docs/ROADMAP-archive/*.md 2>/dev/null; do
  [ -f "$f" ] || continue
  if ! grep -qE "@docs/(CHANGELOG|ROADMAP)\.md|aktivní (changelog|roadmap)|aktuální (changelog|roadmap)" "$f"; then
    echo "❌ Archive missing back-pointer: $f"
    errors=$((errors + 1))
    back_missing=$((back_missing + 1))
  fi
done
total_archives=$(find docs/CHANGELOG-archive docs/ROADMAP-archive -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$back_missing" -eq 0 ]; then
  echo "↩️  Archive→active back-pointers: $total_archives/$total_archives"
fi

# 4. ARCHIVE-INDEX.md in sync
if [ -f docs/ARCHIVE-INDEX.md ]; then
  indexed=$(grep -cE "^\| \`docs/(CHANGELOG|ROADMAP)-archive/" docs/ARCHIVE-INDEX.md || true)
  if [ "$total_archives" != "$indexed" ]; then
    echo "❌ ARCHIVE-INDEX.md out of sync: expected $total_archives, found $indexed"
    errors=$((errors + 1))
  else
    echo "📇 ARCHIVE-INDEX.md: $indexed entries (synced)"
  fi
fi

# 5. ADR count regression guard
adr_count=$(grep -cE "^\| [0-9]+\s+\|" docs/ARCHITECTURE.md || true)
if [ "$adr_count" -lt "$MIN_ADRS" ]; then
  echo "❌ ADR count dropped: $adr_count < $MIN_ADRS"
  errors=$((errors + 1))
else
  echo "🏛️  ADR count: $adr_count (>= $MIN_ADRS)"
fi

# 6-7. Size budget gates
changelog_kb=$(( $(wc -c < docs/CHANGELOG.md) / 1024 ))
roadmap_kb=$(( $(wc -c < docs/ROADMAP.md) / 1024 ))

if [ "$changelog_kb" -gt "$CHANGELOG_MAX_KB" ]; then
  echo "⚠️  CHANGELOG.md: ${changelog_kb} KB > ${CHANGELOG_MAX_KB} KB budget"
  echo "    → Pokud Phase X COMPLETE, spusť archive rhythm"
  errors=$((errors + 1))
else
  echo "📏 CHANGELOG.md: ${changelog_kb} KB / ${CHANGELOG_MAX_KB} KB budget"
fi

if [ "$roadmap_kb" -gt "$ROADMAP_MAX_KB" ]; then
  echo "⚠️  ROADMAP.md: ${roadmap_kb} KB > ${ROADMAP_MAX_KB} KB budget"
  errors=$((errors + 1))
else
  echo "📏 ROADMAP.md:   ${roadmap_kb} KB / ${ROADMAP_MAX_KB} KB budget"
fi

# 8. Memory project-summary check (optional — adjust path per project)
memory_summary="$HOME/.claude/projects/<YOUR_PROJECT>/memory/project-summary.md"
if [ -f "$memory_summary" ]; then
  summary_kb=$(( $(wc -c < "$memory_summary") / 1024 ))
  if [ "$summary_kb" -gt "$MEMORY_SUMMARY_MAX_KB" ]; then
    echo "⚠️  project-summary.md: ${summary_kb} KB > ${MEMORY_SUMMARY_MAX_KB} KB"
    errors=$((errors + 1))
  else
    echo "📏 project-summary.md: ${summary_kb} KB / ${MEMORY_SUMMARY_MAX_KB} KB"
  fi
fi

# 9. Per-session entry size soft warning
long_entries=$(awk '
  /^## \[/ {
    if (count > 150) print "  - " prev " = " count " lines"
    prev = $0; count = 0; next
  }
  { count++ }
  END { if (count > 150) print "  - " prev " = " count " lines" }
' docs/CHANGELOG.md)
if [ -n "$long_entries" ]; then
  echo "💡 Long session entries (> 150 lines):"
  echo "$long_entries"
fi

echo ""
if [ "$errors" -eq 0 ]; then
  echo "✅ All doc integrity checks passed ($total sessions, $total_archives archives, $adr_count ADRs, CHANGELOG ${changelog_kb}KB/${CHANGELOG_MAX_KB}KB)"
  exit 0
else
  echo "❌ $errors integrity issue(s) found"
  exit 1
fi
```

**Setup steps:**

1. `mkdir -p scripts && touch scripts/verify-docs-integrity.sh`
2. Paste výše
3. `chmod +x scripts/verify-docs-integrity.sh`
4. Přidej do root `package.json`: `"docs:verify": "bash scripts/verify-docs-integrity.sh"`
5. Upravit `MIN_ADRS`, `memory_summary` path per project
6. Test: `pnpm docs:verify` → expect exit 0

### 20I. Šablona docs/ARCHIVE-INDEX.md 🆕

```markdown
# [Project] Archive Index

> Single source of truth pro všechny archive soubory. Udržuje se ručně při každé archive rhythm operaci; `pnpm docs:verify` ověří sync s filesystem.
> Když přidáš archive (viz `CLAUDE.md` "Archive rhythm"), přidej řádek do tabulky.

## CHANGELOG archives

| Soubor | Obsah | Date archived | Bytes | Headers |
| --- | --- | --- | ---: | ---: |

**CHANGELOG total:** 0 archive files · 0 session headers · 0 KB

## ROADMAP archives

| Soubor | Obsah | Date archived | Bytes |
| --- | --- | --- | ---: |

**ROADMAP total:** 0 archive files · 0 KB

## Active documents (NEVER archived — current working set)

| Soubor | Obsah | Approx bytes |
| --- | --- | ---: |
| `docs/CHANGELOG.md` | Recent phase entries | ~? |
| `docs/ROADMAP.md` | Banner + pending phases | ~? |
| `docs/ARCHITECTURE.md` | Přehled + ADRs (NEVER archive) | ~? |
| `docs/MODULES.md` (optional) | Lazy-load detailed modules | ~? |
| `docs/SESSION-NOTES.md` | Lazy-load session handoff | ~? |

## Next scheduled archive operation

Per **Archive rhythm** (CLAUDE.md): archive se spouští v opening commitu fáze NÁSLEDUJÍCÍ po dokončené.

- [Phase X] dokončena → archive proběhne v opening commitu Session N+1

## Safety invariants

Viz `scripts/verify-docs-integrity.sh` pro 8 automatických kontrol.
```

### 20J. Šablona .claude/skills/resume-session/SKILL.md 🆕

```markdown
---
name: resume-session
description: Resume previous development session after /clear — loads SESSION-NOTES + ROADMAP + recent CHANGELOG and summarizes state in Czech
---

Resume a previous development session:

1. Read @docs/SESSION-NOTES.md — full context of what was last done
2. Read @docs/ROADMAP.md — current phase + what's next
3. Read @docs/CHANGELOG.md — recent entries for context (last 5 sessions)
4. Check git log for last 5 commits to confirm state matches docs
5. Verify current test status: run test suite
6. Summarize for user in Czech:
   - Jaká je aktuální fáze + co bylo poslední done
   - Kolik testů prochází
   - Co je next up (podle ROADMAP)
7. Propose detailed plan for next step, or ask user if they want different direction.

**Do NOT implement anything yet.** Only summarize + propose. User confirms before implementation.
```

---

## 21. Jak tento manuál použít

### A) Nový projekt — dvoukrokový workflow

**Krok 1 — Audit (nová session):**

```
Přečti @~/claude-code-bible.md
Projdi celý projekt — zmapuj strukturu, kód, technologie.
Zatím nic nevytvářej, řekni mi co jsi našel.
```

**Krok 2 — Vytvoření infrastruktury (nová session):**

```
Podle @~/claude-code-bible.md vytvoř kompletní infrastrukturu:
- CLAUDE.md v rootu (vč. Archive rhythm sekce)
- .claude/settings.json (permissions, hooks)
- .claude/rules/security.md
- .claude/agents/code-reviewer.md, security-reviewer.md
- .claude/skills/fix-issue/SKILL.md
- .claude/skills/resume-session/SKILL.md 🆕
- docs/ARCHITECTURE.md (+ ADR table stub)
- docs/ROADMAP.md (aktuální stav projektu)
- docs/CHANGELOG.md (prázdný, připravený)
- docs/ARCHIVE-INDEX.md 🆕 (prázdná tabulka)
- docs/SESSION-NOTES.md 🆕 (initial handoff)
- scripts/verify-docs-integrity.sh 🆕 (chmod +x)
- package.json → přidej "docs:verify" script

Po vytvoření spusť `pnpm docs:verify` → expect exit 0.
```

### B) Existující projekt — upgrade workflow

Pokud projekt už má nějaké .claude/ nebo CLAUDE.md ze starší verze bible:

**Krok 1 — Audit (nová session):**

```
Přečti @~/claude-code-bible.md

Projdi současné nastavení projektu:
1. Existující CLAUDE.md
2. .claude/ adresář
3. docs/ (ARCHITECTURE.md, ROADMAP.md, CHANGELOG.md)
4. Strukturu kódu a tech stack
5. Memory folder (project-summary.md velikost?)

Porovnej s bible v4.1 a vytvoř report:
- Co je v souladu s biblí (OK)
- Co chybí oproti bibli (hlavně v4.1 novinky: Archive rhythm, verify skript, ARCHIVE-INDEX, resume-session skill)
- Jak jsou docs velké (wc -c) — přesahuje některý size budget?
- Co je v projektu navíc

Zatím NIC NEMĚŇ. Čekej na moje rozhodnutí.
```

**Krok 2 — Selektivní upgrade:**

```
Na základě auditu proveď POUZE tyto úpravy:
[vyjmenuj konkrétně]

Pro každou úpravu:
1. Ukaž mi diff
2. Vysvětli PROČ (odkaz na sekci bible)
3. Čekej na schválení
```

### C) v4.0 → v4.1 migration (specific)

Pokud máš bible v4.0 již nasazenou:

```
Přečti @~/claude-code-bible-v4.1.md

Nasaď v4.1 přírůstky:
1. Vytvoř scripts/verify-docs-integrity.sh (kap. 20H)
2. Vytvoř docs/ARCHIVE-INDEX.md (kap. 20I)
3. Vytvoř .claude/skills/resume-session/SKILL.md (kap. 20J)
4. Vytvoř docs/SESSION-NOTES.md (initial version)
5. Aktualizuj root CLAUDE.md — přidej "Archive rhythm" sekci (kap. 20A)
6. Aktualizuj package.json — přidej "docs:verify" script
7. Spusť pnpm docs:verify → expect exit 0

Pokud aktivní CHANGELOG.md přesahuje 40 KB → spusť archive rhythm
(identifikuj dokončené fáze, archivuj, trim).

Pokud memory/project-summary.md přesahuje 10 KB → rotate
(keep current + 1 previous, compress older to 1-liners).
```

### Po vytvoření/upgradu infrastruktury:

- Tento manuál nepotřebuješ — CC pracuje podle CLAUDE.md
- Periodicky (~1× za měsíc) spusť `pnpm docs:verify` pro sanity check
- Přidávej skills a subagenty podle potřeby
- Při nové verzi bible — spusť audit

---

## Shrnutí v4.1

| Problém | Řešení v tomto systému |
|---------|----------------------|
| CC neví co je projekt | CLAUDE.md (~100–200 řádků + Archive rhythm) |
| CC neví kde hledat | docs/ARCHITECTURE.md + ADR table + odkazy na kód |
| CC neví co dělat dál | docs/ROADMAP.md banner + pending phases |
| CC přepíše existující kód | grep závislostí + schválení + zákaz refaktoringu |
| CC zapomene po /clear | `/resume-session` skill + SESSION-NOTES.md + auto-memory |
| CC rozbije závislou funkci | grep importů → testy závislých souborů |
| CC dělá zbytečné abstrakce | měřitelná pravidla (30ř/fce, 3 úrovně) |
| Prompt injection | deny list + pravidla + sandbox |
| Manipulace cen | platby server-side, FE posílá jen ID |
| Nerozumíš schvalování | povinné české vysvětlení CO/PROČ/DOPAD |
| **Docs rostou s každou session** 🆕 | **Archive rhythm + size budget gates** |
| **Historické session entries zavazí v auto-load** 🆕 | **Move-don't-compress archive pattern** |
| **Reference graph drift mezi active/archive** 🆕 | **Bidirectional pointers + verify script** |
| **Memory project-summary roste nekontrolovaně** 🆕 | **Phase-complete rotation rule** |
| **Není jak ověřit doc integrity** 🆕 | **`pnpm docs:verify` 8 invariantů < 1s** |
| **ADR rozhodnutí se ztratí v archivu** 🆕 | **ADR table v ARCHITECTURE.md NEVER archived** |
| **Cross-service patterns se reinventují** 🆕 | **Kap. 8a: reusable patterns (two-flag, non-fatal, P2002, serializable)** |
| Opakované workflow | Skills (.claude/skills/) |
| Specializované review | Subagenti (.claude/agents/) |
| Formátování po editu | Hooks (PostToolUse → prettier) |
| CC přepíše protected soubory | Hooks (PreToolUse → blokace) |
| Kontext se plní | Skills (on-demand) + subagenti (izolace) + archive rhythm |
| Plánování vs implementace | Plan Mode → Normal Mode workflow |

---

## Appendix: v4.1 novinky cheat-sheet

**Nové soubory v projektu:**

- `scripts/verify-docs-integrity.sh` — 8 invariantů, exit 0 = healthy
- `docs/ARCHIVE-INDEX.md` — single source of truth pro archives
- `docs/SESSION-NOTES.md` — session handoff
- `.claude/skills/resume-session/SKILL.md` — auto-load post /clear
- `docs/CHANGELOG-archive/` — per-phase archive soubory
- `docs/ROADMAP-archive/` — completed phase checklists

**Nové příkazy:**

- `pnpm docs:verify` — ověří 8 doc invariantů < 1 sekunda
- `/resume-session` — skill pro post-/clear context reload

**Nové rules:**

- ADR table v ARCHITECTURE.md NEVER split, NEVER condense
- Active CHANGELOG ≤ 40 KB, ROADMAP ≤ 10 KB, project-summary ≤ 10 KB
- Phase X COMPLETE v titulku = archive trigger pro next session
- Move, don't compress — archive verbatim, rollback přes git revert

**Reusable code patterns (kap. 8a):**

- Two-flag gate pro external services
- Non-fatal cross-service hooks (`.catch(() => undefined)`)
- P2002 idempotency
- Serializable transactions pro capacity race
- UTC midnight normalization pro daily bookkeeping
- Pure helper functions pro date math

---

**Konec bible v4.1 — 19. 4. 2026**

Nový projekt: viz kap. 21.A. Upgrade z v4.0: viz kap. 21.C.

Vždy spusť `pnpm docs:verify` před push. Trust the system — it has your back.
