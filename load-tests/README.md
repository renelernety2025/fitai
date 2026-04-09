# FitAI Load Tests (k6)

Scale Readiness Layer 3 — data-driven performance testing.

## Install k6

```bash
brew install k6
```

## Run tests

All tests hit production (`https://fitai.bfevents.cz`) and authenticate as `demo@fitai.com`.

```bash
# Quick smoke test (30s, 2 users) — always run first
k6 run load-tests/01-smoke.js

# Dashboard rush (500 users, 6 min) — main capacity test
k6 run load-tests/02-dashboard-rush.js

# AI endpoint burst (20 users, 2 min) — tests rate limiting + caching
k6 run load-tests/03-ai-burst.js

# Mixed realistic (200 users, 9 min) — steady-state capacity
k6 run load-tests/04-mixed-realistic.js
```

### Custom env vars

```bash
BASE_URL=http://localhost:3001 k6 run load-tests/01-smoke.js
DEMO_EMAIL=other@user.com DEMO_PASSWORD=... k6 run ...
```

## What to watch during a test

Open these in parallel in your browser:

1. **CloudWatch dashboard:** https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=fitai-production
   - API CPU — should stay < 70%
   - RDS CPU — should stay < 70%
   - API 5xx count — should stay at 0
   - p95 latency — should stay < 2s

2. **Running tasks** — autoscale should kick in when CPU > 60%, adding more API tasks

3. **Alarms:** https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#alarmsV2:
   - If any go into ALARM state during test, you found a bottleneck

## Interpreting k6 output

Key metrics at end of run:

```
http_req_duration.............: p(95)=1.42s    ← want < 2s for dashboard
http_req_failed...............: 0.12%          ← want < 1%
http_reqs.....................: 12543  41.81/s ← throughput
iterations....................: 3128           ← successful user flows
vus...........................: 500            ← peak concurrent
```

**Thresholds** are defined in each test file. If a threshold fails, k6 exits
with non-zero code — easy CI integration.

## Analyzing results

Save results for trend tracking:

```bash
k6 run --out json=results/2026-04-09-dashboard.json load-tests/02-dashboard-rush.js
```

Then compare runs over time to catch regressions.

## When to run what

| Situation | Test |
|---|---|
| Before a release | `01-smoke.js` |
| After major backend change | `02-dashboard-rush.js` |
| Before enabling marketing push | `04-mixed-realistic.js` |
| Testing cache/throttle changes | `03-ai-burst.js` |
| Monthly capacity check | All 4, in sequence |

## Tracking results over time

Document each run in `results/YYYY-MM-DD-NAME.md` with:
- Scenario + git commit hash
- Thresholds (pass/fail)
- CloudWatch observations (peak CPU, memory, connections)
- Notes on any bottleneck found + fix

Example template in `results/TEMPLATE.md`.
