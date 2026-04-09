# FitAI — Deployment Guide

Produkční nasazení FitAI na AWS. **Auto-deploy přes GitHub Actions je primární cesta** — manuální kroky jsou záloha.

**Kompletní GitHub Actions OIDC setup viz [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md).**

---

## 🎯 Rychlý standardní deploy

```bash
git add -A && git commit -m "feat: popis změny" && git push origin main
```

GitHub Actions (`.github/workflows/deploy.yml`) automaticky:
1. Detekuje co se změnilo (`dorny/paths-filter`)
2. Paralelně spustí relevantní CodeBuild projekty
3. Spustí migrační task (Prisma db push + seed)
4. Rolling deploy na ECS Fargate (čeká `services-stable`)
5. Smoke test `test-production.sh` (61/61 testů)
6. Shrnutí v GitHub UI

**Sleduj:** https://github.com/renelernety2025/fitai/actions
**Produkce:** https://fitai.bfevents.cz

---

## 📐 Architektura

```
Internet
   ↓
DNS: fitai.bfevents.cz → ALB
   ↓
ALB (HTTPS 443 + HTTP 80 → 301)
   ├── /api/* + /health  → ECS API Service (NestJS, port 3001)
   └── /*                 → ECS Web Service (Next.js, port 3000)

ECS API
├── RDS PostgreSQL 16 (private subnet)
├── ElastiCache Redis 7 (private subnet)
├── S3 buckets + CloudFront
├── Secrets Manager (DB, JWT, Anthropic, ElevenLabs, OpenAI, VAPID)
└── External: Claude Haiku, ElevenLabs, OpenAI Whisper, Expo Push
```

---

## 💰 Náklady (eu-west-1, baseline)

| Služba | Konfigurace | ~$/měsíc |
|---|---|---|
| ECS Fargate API (2 tasks min, 20 max) | 0.25 vCPU, 0.5 GB | $40 |
| ECS Fargate Web (2 tasks min) | 0.25 vCPU, 0.5 GB | $16 |
| RDS PostgreSQL | db.t3.micro | $15 |
| ElastiCache Redis | cache.t3.micro | $13 |
| NAT Gateway | 1× | $32 |
| ALB | 1× | $16 |
| S3 + CloudFront (low traffic) | | $5 |
| Secrets Manager | 9 secrets | $4 |
| CloudWatch (dashboard + 14 alarmů) | | $8 |
| Sentry (free tier) | 5k events/month | $0 |
| **Total baseline** | | **~$150/měsíc** |
| + Claude API (variabilní) | ~1k DAU | +$5-20 |
| + ElevenLabs | Free → Creator | $0-22 |
| **Total při cca 100 DAU** | | **~$155-190/měsíc** |

Detailní scale plán viz [SCALING.md](../SCALING.md).

---

## 🛠️ Manuální deploy (fallback pokud GH Actions vypadne)

```bash
export AWS_PROFILE=fitai

# 1. API build
aws codebuild start-build --project-name fitai-api-build --region eu-west-1

# 2. Web build
aws codebuild start-build --project-name fitai-web-build --region eu-west-1

# 3. Počkat na SUCCEEDED → ECS auto-deploy via force-new-deployment v buildspec

# 4. Pokud schema change: migrace
aws ecs run-task \
  --cluster fitai-production \
  --task-definition fitai-migrate:2 \
  --launch-type FARGATE \
  --region eu-west-1 \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0bd0a6c5d4eadd609,subnet-0d261214e57e14fba],securityGroups=[sg-0bfd908240d06c541]}"

# 5. Smoke test
bash test-production.sh
```

---

## 🧱 First-time infrastructure setup (Terraform)

**Tyto kroky proběhly na začátku projektu. Slouží jen jako reference pro disaster recovery nebo clone do jiného regionu.**

### Prerekvizity
- AWS CLI v2 (`aws --version`)
- Terraform ≥ 1.5 (`terraform --version`)
- Docker (pro local image build — DEPRECATED, používáme CodeBuild)
- AWS účet s oprávněním pro: VPC, ECS, ECR, RDS, ElastiCache, S3, CloudFront, IAM, CloudWatch, CodeBuild, SNS, Secrets Manager

### 1. Terraform state bucket (jednorázové)
```bash
aws s3 mb s3://fitai-terraform-state --region eu-west-1
aws s3api put-bucket-versioning \
  --bucket fitai-terraform-state \
  --versioning-configuration Status=Enabled
aws dynamodb create-table \
  --table-name fitai-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

### 2. Terraform apply
```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Upravit terraform.tfvars: db_password, api_keys, email pro alerts

terraform init
terraform plan
terraform apply
```

Zaznamenat outputs:
```bash
terraform output
# alb_url, ecr_api_url, ecr_web_url, cloudfront_url, rds_endpoint
```

### 3. Initial secrets v Secrets Manager
```bash
export AWS_PROFILE=fitai
aws secretsmanager create-secret --name fitai/anthropic-api-key --secret-string "sk-ant-..." --region eu-west-1
aws secretsmanager create-secret --name fitai/openai-api-key --secret-string "sk-..." --region eu-west-1
aws secretsmanager create-secret --name fitai/elevenlabs-api-key --secret-string "..." --region eu-west-1
aws secretsmanager create-secret --name fitai/elevenlabs-voice-id --secret-string "..." --region eu-west-1
aws secretsmanager create-secret --name fitai/vapid-public-key --secret-string "BN..." --region eu-west-1
aws secretsmanager create-secret --name fitai/vapid-private-key --secret-string "..." --region eu-west-1
```

### 4. GitHub Actions OIDC setup
Viz samostatný návod [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) — vytvoří OIDC provider + IAM role pro auto-deploy.

---

## 🔐 Environment variables

Runtime env vars se injektují do ECS task definition — část z AWS Secrets Manager, část z Terraform.

| Proměnná | Zdroj | Účel |
|---|---|---|
| `DATABASE_URL` | Secrets Manager | RDS connection |
| `REDIS_URL` | Secrets Manager | ElastiCache connection |
| `JWT_SECRET` | Secrets Manager | JWT signing |
| `ANTHROPIC_API_KEY` | Secrets Manager | Claude Haiku |
| `OPENAI_API_KEY` | Secrets Manager | Whisper STT |
| `ELEVENLABS_API_KEY` | Secrets Manager | TTS |
| `ELEVENLABS_VOICE_ID` | Secrets Manager | Czech voice |
| `VAPID_PUBLIC_KEY` | Secrets Manager | Web push |
| `VAPID_PRIVATE_KEY` | Secrets Manager | Web push |
| `AWS_REGION` | Terraform | eu-west-1 |
| `S3_BUCKET_VIDEOS` | Terraform | fitai-videos-production |
| `S3_BUCKET_ASSETS` | Terraform | fitai-assets-production |
| `CLOUDFRONT_URL` | Terraform | https://d2xm0s90jjozt9.cloudfront.net |
| `NEXT_PUBLIC_API_URL` | CodeBuild env | https://fitai.bfevents.cz |

---

## 🧪 Smoke test proti produkci

```bash
bash test-production.sh
```

Testuje 61 endpointů + frontend stránek + routing sanity. Součást GitHub Actions pipeline, ale lze spustit i lokálně.

**Detail:** [REGRESSION_TESTS workflow (součást deploy.yml)](../.github/workflows/deploy.yml)

---

## 🔁 Rollback

```bash
# Najdi předchozí task definition revision
aws ecs list-task-definitions --family fitai-api --sort DESC --region eu-west-1

# Vrat se na předchozí revizi
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-api-service \
  --task-definition fitai-api:N-1 \
  --region eu-west-1
```

---

## 📊 Observability

- **CloudWatch dashboard:** https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=fitai-production
- **CloudWatch alarmy (14):** https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#alarmsV2:
- **Alert email:** chlubnyrene@gmail.com (SNS topic: `fitai-production-alerts`)
- **Sentry:** https://sentry.io (TODO: setup DSN v Secrets Manager)

**Detail Scale Readiness plan viz [SCALING.md](../SCALING.md).**

---

## 🛟 Užitečné příkazy

```bash
# Logs API (live tail)
aws logs tail /ecs/fitai-api --follow --region eu-west-1

# Logs Web
aws logs tail /ecs/fitai-web --follow --region eu-west-1

# Force redeploy API (bez změny kódu)
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-api-service \
  --force-new-deployment \
  --region eu-west-1

# Scale manually (autoscale funguje automaticky — toto jen pokud potřebuješ override)
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-api-service \
  --desired-count 5 \
  --region eu-west-1

# Check service health
aws ecs describe-services \
  --cluster fitai-production \
  --services fitai-api-service \
  --region eu-west-1 \
  --query 'services[0].{running:runningCount,desired:desiredCount,status:status}'
```

---

## 📚 Related docs

- [ARCHITECTURE.md](../ARCHITECTURE.md) — diagram + tech stack + modules
- [SCALING.md](../SCALING.md) — 4-layer scale readiness playbook
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) — OIDC + IAM role setup
- [CONTRACTS.md](../CONTRACTS.md) — API shapes a zámčené modely
