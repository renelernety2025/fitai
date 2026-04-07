# FitAI Regression Tests

Před každým deployem spustit:
```bash
bash test-production.sh
```

Script otestuje kritické endpointy a stránky. Pokud cokoliv selže, **NEDEPLOYOVAT** dokud se to neopraví.

## Co se testuje

### API endpointy (vyžadují JWT z demo@fitai.com)
- `GET /health` — ALB health check
- `POST /api/auth/login` — login flow + token
- `GET /api/auth/me`
- `GET /api/users/profile`
- `GET /api/exercises` — musí vrátit ≥ 8 cviků
- `GET /api/exercises/:id` — detail s `phases` a `instructions`
- `GET /api/workout-plans`
- `GET /api/videos`
- `GET /api/progress`
- `GET /api/gym-sessions/history`
- `GET /api/gym-sessions/weekly-volume`
- `GET /api/intelligence/plateaus`
- `GET /api/intelligence/recovery`
- `GET /api/onboarding/status`
- `GET /api/education/lessons` — musí vrátit ≥ 8 lekcí
- `GET /api/education/glossary` — musí vrátit ≥ 16 termínů
- `GET /api/education/lesson-of-week`
- `GET /api/social/feed`
- `GET /api/social/leaderboard`

### Frontend stránky (musí vrátit HTML 200, ne JSON)
- `/`, `/login`, `/register`
- `/dashboard`, `/onboarding`
- `/videos`, `/exercises`, `/plans`
- `/gym/start`, `/ai-coach`
- `/lekce`, `/slovnik`, `/community`, `/progress`

### Routing sanity check
- `/api/exercises` musí vrátit JSON (ne HTML)
- `/exercises` musí vrátit HTML (ne JSON)
- Pokud se prohodí → ALB rule je rozbitý

## Manuální regression checklist (po větších změnách)

- [ ] Login s demo@fitai.com / demo1234 funguje
- [ ] Dashboard zobrazuje XP, streak, AI Insights, Lekce týdne
- [ ] /exercises zobrazuje 8 cviků s ikonami
- [ ] /exercises/[id] zobrazuje phases + instructions
- [ ] /gym/start umožní vybrat plán a den
- [ ] /gym/[sessionId] — rep counter, RPE modal, rest timer
- [ ] /workout/[videoId] — kamera se zapne, pose detection běží (jen na HTTPS!)
- [ ] /lekce zobrazuje 8 lekcí
- [ ] /slovnik zobrazuje 16 termínů
- [ ] /community zobrazuje feed
- [ ] /progress zobrazuje weekly volume

## Co dělat když test selže

1. **Nedeployovat.**
2. Identifikuj který endpoint/page selhal.
3. Zkontroluj `aws logs tail /ecs/fitai-api --since 10m`
4. Zkontroluj ALB routing pravidla.
5. Pokud schema změna → spustit migrate task.
6. Až všechno projde → znovu `bash test-production.sh`.
