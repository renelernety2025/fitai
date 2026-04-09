# Load Test Result — YYYY-MM-DD · scenario-name

**Scenario:** 02-dashboard-rush.js
**Commit:** abc1234
**Total VUs:** 500
**Duration:** 6 min
**Tested against:** https://fitai.bfevents.cz

## Thresholds

| Metric | Target | Result |
|---|---|---|
| p95 latency | < 2000ms | XXXms ✅/❌ |
| Error rate | < 1% | X.X% ✅/❌ |
| Checks passed | > 98% | XX% ✅/❌ |

## CloudWatch observations

- **API CPU peak:** XX%
- **API memory peak:** XX%
- **Running API tasks:** start X → peak Y
- **RDS CPU peak:** XX%
- **RDS connections peak:** XX
- **ALB 5xx count:** X
- **ALB request count total:** XXXX

## Bottleneck analysis

1. (top issue, if any)
2. (second issue)

## Fix applied

- (what was changed, if anything)
- (expected impact)

## Next step

- (re-test / move on / investigate further)
