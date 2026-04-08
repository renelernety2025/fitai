# FitAI — Scale Readiness Playbook

> **Cíl:** Systematický průvodce škálováním FitAI z **~10 DAU → 1M+ DAU** bez panicení,
> předčasné optimalizace nebo plýtvání rozpočtu.
>
> **Zlaté pravidlo:** Nescaluj dokud neznáš kde bottleneck je. Jinak házíš peníze
> na problémy které nemáš.

Aktualizováno: 2026-04-08

---

## 📏 Stavové milníky (Growth stages)

| Stage | DAU | Monthly API calls (est.) | Kdy jsi tady | Critical path |
|---|---|---|---|---|
| **Launch** | 0-100 | ~100k | Teď | Mobile app ready, first users |
| **Alpha** | 100-1k | ~1M | Week 2-4 po launchi | Observability + basic caching |
| **Beta** | 1k-10k | ~10M | Měsíc 2-3 | Load test, RDS tuning |
| **Growth** | 10k-100k | ~100M | Měsíc 4-12 | RDS upgrade, read replicy, cache layer |
| **Scale** | 100k-1M | ~1B | Rok 1-2 | Multi-AZ, advanced caching, cost optimization |
| **Hyperscale** | 1M-10M+ | ~10B+ | Rok 2+ | Multi-region, custom infra, dedicated team |

**Kde jsi teď (2026-04-08):** Launch stage. Všechny následující kroky jsou **preparation**, ne reaction.

---

## 🏗️ Architektura s pohledem na škálování

```
[Mobile app] ───┐
                ├─► [Apple App Store / Google Play]  ← Apple/Google škáluje (∞)
[Web browser] ──┘
                │
                ▼
[DNS fitai.bfevents.cz] ──► [AWS ALB (HTTPS 443)]
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                                 ▼
              [ECS Web Service]                [ECS API Service]
              (Next.js SSR)                    (NestJS Fargate)
                     │                                 │
                     │                                 ├─► [RDS PostgreSQL]
                     │                                 ├─► [ElastiCache Redis]
                     │                                 ├─► [S3 + CloudFront]
                     │                                 ├─► [Secrets Manager]
                     │                                 │
                     │                                 ├─► [Claude Haiku API]
                     │                                 ├─► [ElevenLabs API]
                     │                                 └─► [OpenAI API]
```

**Aktuální konfigurace** (2026-04-08):
- ECS: 1 task per service (API, Web), autoscale 1-3
- RDS: `db.t3.micro` (1 vCPU, 1GB RAM, 20GB gp3)
- Redis: `cache.t3.micro` single node
- Capacity: ~500 concurrent users, ~50 req/s sustained

---

## 🎯 Scale readiness checklist — 4 vrstvy podle ROI

**Pravidlo:** Dělej vrstvy v pořadí. **Každá vyšší vrstva bez předchozí = plýtvání času nebo peněz.**

---

### 🥇 **Vrstva 1: FREE quick wins**
_ROI: ∞ (nulová cena, 10-100× capacity)_
_Čas: ~1 den práce_
_Kdy: Před prvním launch / jakmile máš víc než 10 DAU_

#### 1.1 Aggressive caching
**Goal:** ~80% API requests přestane sahat do RDS.

**Implementace:**

| Cache key | TTL | Zdroj | Invalidace |
|---|---|---|---|
| `user:{id}` | 1h | `User` + `UserProgress` + `FitnessProfile` | Při `updateProfile`, `awardXP`, workout end |
| `exercises:all` | 7 dní | All `Exercise` rows | Při `exercises.seed` nebo admin edit |
| `exercise:{id}` | 7 dní | Single exercise | Při edit |
| `lessons:all` | 24h | All `EducationLesson` | Při seed |
| `glossary:all` | 24h | All `GlossaryTerm` | Při seed |
| `achievements:all` | Permanent | All `Achievement` seed | Při re-seed (explicit flush) |
| `daily-brief:{userId}:{date}` | 24h | Claude-generated | Auto expire end of day (Europe/Prague) |
| `meal-plan:{userId}:{weekStart}` | 7 dní | DB-cached už (hotovo) | Manual regenerate |
| `dashboard-stats:{userId}` | 5 min | `UserProgress` + `GymSession` count | User-triggered |
| `recovery-tips:{userId}` | 1h | Claude (hotovo) | Auto |
| `weekly-review:{userId}` | 1h | Claude (hotovo) | Auto |

**Implementace pattern:**
```typescript
// apps/api/src/shared/cache/cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}
  
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);
    const fresh = await fetcher();
    await this.redis.setex(key, ttlSeconds, JSON.stringify(fresh));
    return fresh;
  }
  
  async invalidate(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length) await this.redis.del(...keys);
  }
}
```

**Očekávaný dopad:** RDS query load ↓ 80%. API p95 latency ↓ 50-70%.

#### 1.2 Database indexy
**Goal:** Každý foreign key a každé často-filtrované pole má index.

**Kontrolní script:**
```bash
# Najdi všechny Prisma modely bez @@index na userId
grep -L "@@index" apps/api/prisma/schema.prisma  # manuálně projdi
```

**Must-have indexy (kontrola jestli existují):**
- `GymSession(userId, startedAt DESC)` 
- `ExerciseSet(gymSessionId)`
- `WorkoutSession(userId, completedAt DESC)`
- `FoodLog(userId, date DESC)` (existuje)
- `DailyCheckIn(userId, date DESC)`
- `AchievementUnlock(userId)` (existuje)
- `BodyPhoto(userId, takenAt DESC)` (existuje)
- `MealPlan(userId, weekStart DESC)` (existuje)
- `PoseSnapshot(sessionId, timestamp)`

**Pokud chybí:** přidat `@@index`, `prisma db push`.

#### 1.3 Rate limiting per user
**Goal:** 1 zlý user nemůže zruinovat tvůj Claude budget.

**Instalace** (už v projektu):
```bash
pnpm add @nestjs/throttler
```

**Global limity** (`apps/api/src/app.module.ts`):
```typescript
ThrottlerModule.forRoot([
  { name: 'short', ttl: 1000, limit: 10 },       // 10 req/s
  { name: 'medium', ttl: 60000, limit: 200 },    // 200 req/min
  { name: 'long', ttl: 3600000, limit: 3000 },   // 3000 req/hour
]),
```

**Per-endpoint limity** (AI endpoints jsou drahé):

| Endpoint | Limit | Důvod |
|---|---|---|
| `POST /api/ai-insights/daily-brief` | 5/hour | Cached 24h, 5× je dost na debug |
| `POST /api/nutrition/meal-plan/generate` | 3/day | Real use case: 1× týdně, 3× safety |
| `POST /api/progress-photos/:id/analyze` | 20/day | Reasonable upper bound |
| `POST /api/coaching/feedback` | 30/min | Real-time coaching — high rate OK |
| `POST /api/coaching/voice` | 60/min | TTS při workoutu — high rate OK |
| `POST /api/auth/login` | 10/min per IP | Brute force protection |
| `POST /api/auth/register` | 5/hour per IP | Spam protection |

**Implementace:**
```typescript
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5/hour
@Post('daily-brief')
generate(@Request() req) { ... }
```

#### 1.4 ECS autoscaling rozšíření
**Goal:** ECS se sám roztáhne při peak traffic.

**Aktuální:** min 1, max 3 tasky.

**Nový setup:**
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/fitai-production/fitai-api-service \
  --min-capacity 2 \
  --max-capacity 20

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/fitai-production/fitai-api-service \
  --policy-name cpu-target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 60.0,
    "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"},
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

**Efekt:**
- Při low traffic: **2 tasky** (HA), ~$40/měsíc
- Při burst: automaticky scale-out do **20 tasků** v ~2 min
- Scale-in po 5 min bez zátěže

**Cost impact:** +$20/měsíc (min 2 namísto 1), variabilní pod zátěží.

#### 1.5 ALB + Connection tuning
**Goal:** Správné timeouts aby ALB nezabíjel requesty uprostřed.

**Aktuální default:** 60s idle timeout (stačí většinou).

**Úpravy pro AI endpointy** (Claude trvá 10-20s):
- ALB idle timeout: **120s** (místo 60s)
- Connection draining: 30s (pro rolling deploy)

```bash
aws elbv2 modify-load-balancer-attributes \
  --load-balancer-arn <ALB_ARN> \
  --attributes Key=idle_timeout.timeout_seconds,Value=120
```

**Efekt:** Claude requests nebudou timing out.

#### 1.6 Prisma connection pooling
**Goal:** Každý API task má efektivní pool k RDS.

**Current:** Prisma default (10 connections per instance).

**Nový:** `connection_limit=20` + `pool_timeout=15` ve `DATABASE_URL`:
```
DATABASE_URL=postgresql://.../?connection_limit=20&pool_timeout=15&connect_timeout=10
```

**RDS `db.t3.micro` max connections:** 87. S 20 ECS tasky × 20 connections = 400, overload.
→ Musíme buď **snížit pool per instance** (10) nebo **upgrade RDS** (Vrstva 4).

**Pro teď:** `connection_limit=10`, `pool_timeout=15`.

#### Vrstva 1 souhrn

| Úloha | Čas | Cost | Dopad |
|---|---|---|---|
| Caching layer (CacheService + 10 cached endpointů) | 3-4h | $0 | ~80% RDS traffic ↓ |
| Database indexy audit | 30 min | $0 | Query speed 2-10× |
| Rate limiting (global + per-endpoint) | 1-2h | $0 | Claude budget chráněn |
| ECS autoscaling 1-3 → 2-20 | 10 min | +$20/mo | 10× burst capacity |
| ALB timeout tuning | 15 min | $0 | AI endpointy nefailují |
| Prisma connection pool | 10 min | $0 | DB connection exhaustion prevention |
| **CELKEM** | **~1 den** | **+$20/mo** | **~100× capacity** |

---

### 🥈 **Vrstva 2: Observability**
_ROI: Vysoký (vidíš kde trpíš = opravuješ správné věci)_
_Čas: ~půl dne_
_Kdy: Po Vrstvě 1, před prvními real users_

#### 2.1 CloudWatch dashboard
**Goal:** Jeden screen kde vidíš "zdraví" platformy.

**Metriky:**
- **API service:**
  - CPU % per task
  - Memory % per task
  - Request count / min
  - Error rate (5xx %)
  - p50, p95, p99 latency
- **Web service:**
  - CPU, memory, request count
- **RDS:**
  - CPU %
  - Database connections
  - Read/write IOPS
  - Slow query count (>1s)
- **Redis:**
  - Memory used
  - Cache hit rate
  - Evictions
- **ALB:**
  - Target healthy count
  - Target response time
  - Request count per target
- **Claude usage:**
  - Requests/min (custom metric)
  - Tokens/min (custom metric)
  - Error rate

**Setup:**
```bash
aws cloudwatch put-dashboard --dashboard-name fitai-production \
  --dashboard-body file:///tmp/fitai-dashboard.json
```
Dashboard JSON bude v repozitáři: `infrastructure/monitoring/cloudwatch-dashboard.json`.

#### 2.2 CloudWatch alarmy + SNS email
**Goal:** Dostaneš email **před** tím než to spadne, ne po.

**Alarmy:**

| Alarm | Threshold | Email |
|---|---|---|
| API 5xx error rate | > 1% over 5 min | admin@fitai.com |
| API CPU | > 80% for 5 min | admin |
| API memory | > 85% for 5 min | admin |
| RDS CPU | > 70% for 10 min | admin |
| RDS connections | > 60 (of 87) | admin |
| RDS free storage | < 10 GB | admin |
| ALB target unhealthy | any target | admin |
| ALB p95 latency | > 3000 ms for 5 min | admin |
| Claude rate limit | 429 response | admin |
| ECS task exits | > 3 in 10 min | admin |

**Setup (AWS CLI + Terraform v `infrastructure/monitoring/alarms.tf`):**
```bash
aws sns create-topic --name fitai-production-alerts
aws sns subscribe --topic-arn <ARN> --protocol email --notification-endpoint admin@fitai.com
# Potvrdit email subscription
# Pak put-metric-alarm pro každý alarm
```

#### 2.3 Sentry error tracking
**Goal:** Automatický crash reporting pro backend + mobile + web.

**Free tier:** 5k events/měsíc. **Pro:** $26/měsíc pro 50k events.

**Integrace:**

**Backend (NestJS):**
```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Mobile (React Native + Expo):**
```bash
pnpm add @sentry/react-native
```
```typescript
// App.tsx
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN });
```

**Web (Next.js):**
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Environment setup:** Sentry DSN do `Secrets Manager` → ECS task def.

#### 2.4 Structured logging (JSON)
**Goal:** CloudWatch Logs Insights queries místo `grep`.

**Backend:**
```bash
pnpm add nestjs-pino pino-http
```
```typescript
// apps/api/src/app.module.ts
LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    customProps: (req) => ({ userId: req.user?.id }),
  },
}),
```

**CloudWatch Logs Insights queries:**
```
fields @timestamp, @message
| filter level = "error"
| stats count() by msg
| sort count desc
| limit 20
```

#### 2.5 Custom metrics pro AI usage
**Goal:** Víš kolik platíš Claude / ElevenLabs / OpenAI.

**Setup:**
```typescript
// apps/api/src/shared/metrics/metrics.service.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

@Injectable()
export class MetricsService {
  async recordClaudeCall(tokens: number, endpoint: string) {
    await cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'FitAI/AI',
      MetricData: [
        { MetricName: 'ClaudeTokens', Value: tokens, Unit: 'Count',
          Dimensions: [{ Name: 'Endpoint', Value: endpoint }] },
      ],
    }));
  }
}
```

**Dashboard widget:** Total Claude tokens / den → odhad měsíčních nákladů.

#### Vrstva 2 souhrn

| Úloha | Čas | Cost | Dopad |
|---|---|---|---|
| CloudWatch dashboard | 1h | $0 | Real-time visibility |
| CloudWatch alarmy + SNS | 1h | $1/mo | Proactive warnings |
| Sentry integration (api + mobile + web) | 2h | $0-26/mo | Crash reports |
| Structured logging (pino) | 1h | $0 | Debuggable logs |
| AI usage metrics | 1h | $0 | Cost visibility |
| **CELKEM** | **~6h** | **+$26/mo** | **Vidíš vše** |

---

### 🥉 **Vrstva 3: Load Testing**
_ROI: Vysoký (data-driven decisions)_
_Čas: ~1 den_
_Kdy: Po Vrstvách 1 a 2, před big marketing push_

#### 3.1 k6 load test setup
**Instalace:**
```bash
brew install k6
```

**Test scenario 1: Dashboard rush**
```javascript
// load-tests/dashboard-rush.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // ramp up 
    { duration: '5m', target: 500 },  // peak
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // p95 < 2s
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

const BASE = 'https://fitai.bfevents.cz';

export function setup() {
  // Login test users
  const tokens = [];
  for (let i = 0; i < 10; i++) {
    const res = http.post(`${BASE}/api/auth/login`, JSON.stringify({
      email: `loadtest${i}@fitai.com`,
      password: 'loadtest123',
    }), { headers: { 'Content-Type': 'application/json' } });
    tokens.push(res.json('accessToken'));
  }
  return { tokens };
}

export default function (data) {
  const token = data.tokens[Math.floor(Math.random() * data.tokens.length)];
  const headers = { 'Authorization': `Bearer ${token}` };
  
  const endpoints = [
    '/api/progress',
    '/api/ai-insights/daily-brief',
    '/api/exercises',
    '/api/habits/today',
    '/api/nutrition/today',
  ];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const res = http.get(`${BASE}${endpoint}`, { headers });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

**Spuštění:**
```bash
k6 run load-tests/dashboard-rush.js
```

#### 3.2 Test scenarios

**Scenario A: Dashboard rush** (nejběžnější)
- 500 concurrent users, random dashboard endpoints
- Cíl: p95 < 2s, error rate < 1%

**Scenario B: Gym workout sustained**
- 200 concurrent users provádějících gym session
- Start session → complete set × 20 (throttled 30s apart) → end session
- Cíl: p95 < 1s na `set/complete`, zero data loss

**Scenario C: AI generation burst**
- 50 concurrent users regeneruje daily brief (drahé)
- Cíl: no 429s, Claude rate limit respected, cache hit rate > 90%

**Scenario D: Mixed realistic**
- 1000 users, weighted distribution:
  - 60% browsing (dashboard, exercises, lessons)
  - 20% logging (food log, check-in)
  - 15% gym sessions
  - 5% AI generation

#### 3.3 Analýza & iterace
**Po každém testu:**
1. Zapiš si throughput, p50/p95/p99, error rate, RDS CPU, ECS CPU
2. Identifikuj **#1 bottleneck** (nejčastěji: slow query, cache miss, CPU exhaustion)
3. Fix → re-test → porovnej
4. Commit výsledků do `load-tests/results/YYYY-MM-DD.md`

**Track progress:**
```markdown
# 2026-04-15 — Baseline
- Scenario A (500 users)
- Before: p95 = 4.2s, error rate 3.1%, RDS CPU 95%
- Bottleneck: `/api/progress` N+1 query na ExerciseSet
- Fix: add Prisma `include: { sets: true }` batch
- After: p95 = 800ms, error rate 0.2%, RDS CPU 45%
```

#### 3.4 Load test jako součást CI (volitelné)
**Goal:** Každý release projde smoke load test.

**GitHub Actions step:**
```yaml
smoke-load-test:
  needs: [smoke-test]
  runs-on: ubuntu-latest
  steps:
    - uses: grafana/k6-action@v0.3.1
      with:
        filename: load-tests/smoke.js
        flags: --vus 50 --duration 30s
```

**Smoke test = low intensity**, chytne regresi ale nezatíží produkci.

#### Vrstva 3 souhrn

| Úloha | Čas | Cost | Dopad |
|---|---|---|---|
| k6 instalace + setup | 30 min | $0 | - |
| 4 test scenarios napsání | 2-3h | $0 | - |
| Baseline run + analýza | 2-3h | $0 | Data-driven priorities |
| První 3 optimalizace (podle výsledků) | 2-4h | $0 | Real bottlenecks fixed |
| **CELKEM** | **~1 den** | **$0** | **Víš kde stojíš** |

---

### 💰 **Vrstva 4: Paid infrastructure upgrades**
_ROI: Střední (vyšší cena, ale nutný po určitém bodu)_
_Čas: Variabilní_
_Kdy: **Jen po load testu z Vrstvy 3**, který ukáže reálný bottleneck_

**⚠️ DŮLEŽITÉ:** Nedělej nic z Vrstvy 4 bez load test dat. Jinak utrácíš na hypotetické problémy.

#### 4.1 RDS upgrade path

| Krok | Instance | RAM | vCPU | Cena/mo | Kdy |
|---|---|---|---|---|---|
| Current | `db.t3.micro` | 1 GB | 1 | $15 | Nyní |
| Step 1 | `db.t3.small` | 2 GB | 2 | $30 | CPU > 70% sustained |
| Step 2 | `db.r6g.large` | 16 GB | 2 | $120 | Working set > 1 GB |
| Step 3 | `db.r6g.xlarge` | 32 GB | 4 | $240 | Query concurrency > 100 |
| Step 4 | + Read replica | same | same | +$120 | Read/write ratio > 4:1 |
| Step 5 | Multi-AZ | 2× cost | Neutral | +100% | HA requirement |

**Upgrade command:**
```bash
aws rds modify-db-instance \
  --db-instance-identifier fitai-production-db \
  --db-instance-class db.t3.small \
  --apply-immediately
```

**Downtime:** 3-5 minut při upgrade. Schedule na off-peak.

#### 4.2 ElastiCache upgrade path

| Krok | Nodes | Memory | Cena/mo | Kdy |
|---|---|---|---|---|
| Current | 1 × cache.t3.micro | 0.5 GB | $10 | Nyní |
| Step 1 | 1 × cache.t3.small | 1.5 GB | $25 | Memory > 80% |
| Step 2 | Cluster (3 shards × 1 replica) | 4.5 GB | $75 | High availability |
| Step 3 | 6 shards × 2 replicas | 9 GB | $200 | Massive scale |

#### 4.3 ECS Fargate Spot
**Goal:** -70% cena za web service (méně critical).

Fargate Spot = stejný Fargate, ale preemptible. Vhodné pro:
- Web service (Next.js SSR — ztracený task = user reload)
- Background workers
- Migration tasks

**NE vhodné pro:** API service, real-time coaching.

**Setup:**
```bash
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-web-service \
  --capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1 \
    capacityProvider=FARGATE_SPOT,weight=3
```
→ 1 base Fargate task (guaranteed) + 3 Spot tasks (cheap).

**Cost saving:** ~60% na web tier.

#### 4.4 CloudFront pro API (pokročilé)
**Goal:** Cache GET endpointů na edge, 0ms latence globálně.

**Cachovatelné endpointy:**
- `GET /api/exercises` — read-only, semi-static
- `GET /api/education/lessons` — static
- `GET /api/education/glossary` — static

**Necachovatelné:**
- Vše authenticated (user-specific)
- POST/PUT/DELETE

**Setup:**
- CloudFront distribution před ALB
- Cache behavior: `/api/exercises` → TTL 1h
- Origin request: forward headers selectively

**Čekáme:** až load test ukáže že `/api/exercises` je top 5 endpoint.

#### 4.5 Anthropic API Tier upgrade

| Tier | Req/min | Tokens/min | Kdy |
|---|---|---|---|
| Tier 1 (current) | 50 | 50k | Nyní |
| Tier 2 | 1000 | 100k | $40/měsíc spend triggered |
| Tier 3 | 2000 | 200k | $200/mo spend |
| Tier 4 | 4000 | 400k | $1000/mo spend |
| Custom | Contact | Contact | $10k+/mo |

Tier upgrade je automatický podle spend — nic nekonfiguruješ.

**Cache hit rate** je kritický — každý cached response = 0 tokenů, 0 rate limit hit.

#### 4.6 Read replicas + connection pooler
**Goal:** Read-heavy workloady odpojíš z primary DB.

**Setup:**
1. Create RDS read replica (1-click v konzoli)
2. Prisma nemá native read/write split → použít **PgBouncer** jako connection pooler
3. V kódu: read queries → PgBouncer → replica; writes → primary

**Alternativa:** **Neon / Supabase** managed Postgres s automatickým read scaling. Migrace = změna `DATABASE_URL`.

#### Vrstva 4 souhrn

**Nedělej žádnou z těchto operací naslepo.** Každou spouštěj jen když load test z Vrstvy 3 ukázal konkrétní bottleneck.

**Odhadovaná cena při 50k DAU:**
- RDS `r6g.large` + replica: +$240/mo
- ElastiCache cluster: +$75/mo
- ECS autoscale (avg 10 tasků): +$150/mo
- Sentry Pro: $26/mo
- CloudFront: +$50/mo
- **Total nad baseline:** ~$540/mo

**Při 500k DAU:**
- RDS `r6g.xlarge` + 2 replicas: +$480/mo
- ElastiCache cluster (scaled): +$200/mo
- ECS (avg 30 tasků): +$450/mo
- Claude usage: +$2000-5000/mo
- **Total nad baseline:** ~$3500-6000/mo

**Tržby potřebné pro udržení 500k DAU:**
- Při $1 ARPU/měsíc × 500k × 2% paid = **$10k/mo** → zdravý margin
- Při $5 ARPU/měsíc × 500k × 5% paid = **$125k/mo** → luxusní margin

---

## ⚠️ Čeho se VYHNOUT (předčasná optimalizace)

Tyhle věci NEDĚLEJ dokud jejich řešení není blokující problém. Každá z nich má vlastní cenu v komplexitě a údržbě.

### 🚫 **Nedělat teď** (overengineering pro current state)

| Co | Proč to je lákavé | Proč je to špatně TEĎ |
|---|---|---|
| Multi-region deploy | "Co kdyby AWS eu-west spadl?" | 99.99% SLA = 4 min downtime/měsíc. Multi-region = 3× cena + distributed DB hell |
| Kubernetes migrace | "Všichni mají K8s" | ECS Fargate stačí do 10M+ DAU, K8s = ops overhead |
| Microservices split | "Škálují nezávisle" | Monolith NestJS je skvělý do 100k DAU. Split = network latency + distributed tracing |
| GraphQL | "Jeden endpoint pro mobile i web" | REST + typed client stačí. GraphQL = caching problems + N+1 nightmares |
| Event sourcing / CQRS | "Enterprise architecture" | 10× komplexita pro 0× reálný přínos na tvém use case |
| Kafka / event streaming | "Real-time analytics" | RabbitMQ stačí, CloudWatch stačí. Kafka = ops |
| Self-hosted Whisper (GPU) | "Ušetříme $/call" | Až při 10k+ transcribe/měsíc. Dokud: OpenAI je levnější |
| Vlastní CDN | "Plná kontrola" | CloudFront je skvělý, $0 setup, auto-scaling |
| Custom auth (OAuth2 server) | "Enterprise grade" | Clerk/Auth0/Firebase Auth = 1h setup, battle-tested |
| Rewrite do Rust/Go | "Faster" | Node.js stačí do milionů DAU. Rewrite = měsíce práce = nulový business value |
| Server-side render everything | "SEO" | Next.js už to dělá. Ne všechno musí být SSR |
| Service mesh (Istio, Linkerd) | "Observability + security" | Overkill do 50+ microservices |

**Obecné pravidlo:** Když vidíš článek "How we scaled to 1 billion users with X", zeptej se: **kolik DAU jsme měli KDYŽ jsme X implementovali?** Většinou to bylo potom, ne předtím.

---

## 📅 Doporučená časová osa

### Week 0 (právě teď — 2026-04-08)
- ✅ Launch stage: basic functionality hotová
- ✅ Dnes: Phase 6 part 2 — mobile pose detection (Den 1)

### Week 1
- **Den 1:** Phase 6 part 2 — EAS Build + native pose detection
- **Den 2:** Vrstva 1 (caching + autoscaling + rate limiting + indexy)
- **Den 3:** Vrstva 2 (observability + Sentry + dashboard)
- **Den 4:** Vrstva 3 (load test baseline + první optimalizace)
- **Den 5:** Polish, bug fixes, produkce ready pro alpha testy

### Week 2-4 (Alpha — 100-1k DAU)
- Reální uživatelé → reálné metriky
- Oprava top 3 bugs ze Sentry
- Optimalizace top 3 pomalých queries z CloudWatch
- **Vrstva 4 step 1:** RDS upgrade pokud CPU > 70%

### Měsíc 2-3 (Beta — 1k-10k DAU)
- ECS autoscale limity zvýšené
- ElastiCache monitoring
- CDN pro exercises/lessons endpointy
- Anthropic tier 2 upgrade
- První uživatelské interview → UX iterations

### Měsíc 4-12 (Growth — 10k-100k DAU)
- **Vrstva 4 plně:** RDS r6g.large + read replica
- Multi-AZ pro HA
- Load test každý měsíc
- Performance regression guards v CI
- DB query optimization dedicated sprint

### Rok 2+ (Scale — 100k-1M+ DAU)
- Reevaluovat microservices (jen pokud kritické)
- Multi-region eval (jen pokud globální expansion)
- Dedicated SRE engineer
- 24/7 on-call rotace

---

## 📋 Scale readiness checklist (before launch)

### Must-have (blocking launch)
- [ ] Vrstva 1 completed: caching, indexy, rate limiting, autoscaling
- [ ] Vrstva 2 completed: CloudWatch dashboard, alarmy, Sentry
- [ ] Vrstva 3 baseline: k6 load test proběhl, víme current capacity
- [ ] Database backup strategy: RDS automated backups ON, 7-day retention, tested restore
- [ ] Secrets rotation plan: JWT secret, DB password, API keys
- [ ] Error budget defined: "Akceptujeme 99.5% uptime = 3.6h downtime/měsíc"
- [ ] Incident response plan: Kdo je on-call, jak notifikuje, jaký runbook

### Nice-to-have (post-launch first month)
- [ ] GDPR compliance: data export endpoint, delete user endpoint
- [ ] Terms of service + Privacy policy updates pro AI features
- [ ] Pilot group uživatelů (20-50) pro feedback před masovým launch
- [ ] Analytics: Mixpanel/Amplitude/PostHog pro user behavior (zdarma do 10k users)
- [ ] A/B testing framework (Unleash / GrowthBook)
- [ ] Feature flags pro safe rollouts (LaunchDarkly / Unleash free tier)

### Paranoia-level (optional, large impact)
- [ ] Chaos engineering: Gremlin / custom scripts pro failure injection
- [ ] Red team security audit
- [ ] Penetration testing
- [ ] SOC2 Type I (pokud enterprise customers)

---

## 🆘 Runbook — Incident response

### Scénář: "API je pomalé"
1. **CloudWatch dashboard:** Který endpoint? Jaký p95?
2. **RDS CPU:** > 80%? → slow query, check Performance Insights
3. **ECS CPU:** > 80%? → scale out (manuálně pokud autoscale selže)
4. **Claude 429:** → check rate limit headers, zapnout fallback
5. **Redis memory:** > 90%? → evictions, zvýšit nebo upgradovat

### Scénář: "API vrací 5xx"
1. **Sentry:** Poslední stack traces → root cause
2. **CloudWatch Logs:** Filter `level = "error"`
3. **ECS task restart:** `aws ecs update-service --force-new-deployment`
4. **Rollback:** `aws ecs update-service --task-definition fitai-api:PREVIOUS`

### Scénář: "Databáze nedostupná"
1. **RDS console:** Status?
2. **Connections maxed out:** PgBouncer nebo restart tasks
3. **Disk full:** scale storage (RDS auto-scaling do 100 GB už je on)
4. **Corruption:** restore z latest automated backup

### Scénář: "Web je pomalý"
1. **CloudFront stats:** Cache hit rate?
2. **ECS web service CPU:** > 80%? Scale out
3. **ALB target health:** Unhealthy targets? Check container logs

---

## 🎯 Success metrics (kdy víš že jsi ready)

**Pro Launch (nyní):**
- ✅ Vrstva 1 kompletní
- ✅ Vrstva 2 základ (dashboard + Sentry)
- ✅ Load test: 500 concurrent users, p95 < 2s, 0% errors

**Pro Alpha (1k DAU):**
- ✅ Autoscale 2-20 ověřené
- ✅ Zero incidents za 1 týden uptime
- ✅ RDS CPU < 50% at peak

**Pro Beta (10k DAU):**
- ✅ Sentry < 10 errors/den
- ✅ Claude cache hit rate > 80%
- ✅ Load test 5k concurrent, p95 < 2s

**Pro Growth (100k DAU):**
- ✅ Vrstva 4 plně implementovaná
- ✅ 99.9% uptime měsíční
- ✅ Dedicated monitoring (Datadog nebo in-house)

**Pro Scale (1M+ DAU):**
- ✅ Multi-AZ RDS
- ✅ Read replicas
- ✅ Dedicated SRE engineer
- ✅ 24/7 on-call rotace

---

## 📚 Další čtení (pro inspiraci, ne nutně k implementaci)

- **"Release It!"** by Michael Nygard — anti-patterns + stability patterns
- **"Database Internals"** by Alex Petrov — proč databáze fungují tak jak fungují
- **"Site Reliability Engineering"** (Google) — SRE principy
- **Postmortem databases** — https://github.com/danluu/post-mortems

**FitAI specific references:**
- AWS Fargate limits: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-quotas.html
- RDS instance sizes: https://aws.amazon.com/rds/postgresql/instance-types/
- Anthropic rate limits: https://docs.anthropic.com/en/api/rate-limits
- Prisma performance: https://www.prisma.io/docs/guides/performance-and-optimization

---

## 🎯 Shrnutí v jedné větě

**Vrstva 1 (free quick wins) → Vrstva 2 (observability) → Vrstva 3 (load test) → Vrstva 4 (paid upgrades jen podle dat).**

Nikdy **neskip** Vrstvu 3. Bez měření jsou všechny scaling decisions hazard.
