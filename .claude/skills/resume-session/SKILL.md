---
name: resume-session
description: Quick orientation after /clear — reads project summary, ROADMAP, recent CHANGELOG, git state, and summarizes where we are + what's next. Use after /clear or at start of new session.
---

# Resume Session

Rychlá orientace v projektu po /clear nebo na začátku nové session.

## Kroky

1. Přečti `~/.claude/projects/-Users-renechlubny-projekty-fitai/memory/project_summary.md` — aktuální stav projektu
2. Přečti `ROADMAP.md` — pending priority + next up
3. Přečti `CHANGELOG.md` — co se dělo v poslední session
4. Spusť `git log --oneline -10` — poslední commity
5. Spusť `git status --short` — uncommitted changes
6. Spusť `bash scripts/verify-docs-integrity.sh` — doc health check

## Výstup

Shrň uživateli česky v 5-8 větách:
- Kde jsme (aktuální fáze, co je hotovo)
- Co je next (první pending task z ROADMAP)
- Git stav (clean/dirty, ahead/behind)
- Doc health (verify script výsledek)
- Případné known issues z memory

## Příklad výstupu

> FitAI je na Phase E (voice latency reduction). Backend SSE streaming (E-1, E-2) je deployed a curl-verified. Mobile rollbacknul na expo-audio (VoiceEngine má silent playback bug). Git je clean, main ahead of origin by 1 commit. Docs healthy: 55 KB auto-load, 15 ADRs, 2 archives. Next: VoiceEngine debug s Xcode nebo App Store launch prep.
