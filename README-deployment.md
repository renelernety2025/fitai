# FitAI — Produkční Deployment na AWS

## Architektura

```
Internet → CloudFront (videa/HLS)
Internet → ALB (HTTPS)
            ├── /api/* → ECS Fargate (NestJS API, port 3001)
            └── /*     → ECS Fargate (Next.js Web, port 3000)

ECS API → RDS PostgreSQL (private subnet)
ECS API → ElastiCache Redis (private subnet)
ECS API → S3 (videa, choreografie)
ECS API → MediaConvert (HLS transcode)
```

## Prerekvizity

- [AWS CLI v2](https://aws.amazon.com/cli/) nakonfigurovaný s IAM credentials
- [Terraform >= 1.5](https://www.terraform.io/downloads)
- [Docker](https://www.docker.com/get-started)
- AWS účet s oprávněními: VPC, ECS, ECR, RDS, ElastiCache, S3, CloudFront, IAM, CloudWatch, CodeBuild

## 1. Příprava Terraform State Bucketu

Jednorázově vytvořte S3 bucket a DynamoDB tabulku pro Terraform state:

```bash
aws s3 mb s3://fitai-terraform-state --region eu-west-1
aws s3api put-bucket-versioning --bucket fitai-terraform-state --versioning-configuration Status=Enabled
aws dynamodb create-table \
  --table-name fitai-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

## 2. Terraform Deploy

```bash
cd infrastructure
cp terraform.tfvars.example terraform.tfvars
# Upravte terraform.tfvars — nastavte silné heslo a email

terraform init
terraform plan
terraform apply
```

Po dokončení si poznamenejte výstupy:
```bash
terraform output
# alb_url, ecr_api_url, ecr_web_url, cloudfront_url, ...
```

## 3. První Push Docker Imagů

```bash
# Login do ECR
ECR_URL=$(terraform output -raw ecr_api_url | cut -d'/' -f1)
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $ECR_URL

# Build a push API
cd ..
docker build -t $(terraform -chdir=infrastructure output -raw ecr_api_url):latest \
  --platform linux/amd64 -f apps/api/Dockerfile .
docker push $(terraform -chdir=infrastructure output -raw ecr_api_url):latest

# Build a push Web
ALB_URL=$(terraform -chdir=infrastructure output -raw alb_url)
docker build -t $(terraform -chdir=infrastructure output -raw ecr_web_url):latest \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=$ALB_URL \
  -f apps/web/Dockerfile .
docker push $(terraform -chdir=infrastructure output -raw ecr_web_url):latest
```

ECS automaticky stáhne nové image a spustí kontejnery.

## 4. Prisma Migrace v Produkci

Spusťte jednorázový ECS task pro migraci:

```bash
# Z lokálního stroje s přístupem do VPC (nebo přes bastion)
DATABASE_URL="postgresql://fitai:PASSWORD@RDS_ENDPOINT:5432/fitai_db"
npx prisma migrate deploy
npx prisma db seed
```

Alternativně: přidejte migraci do init kontejneru v ECS task definition.

## 5. GitHub → CodeBuild Webhook

1. V AWS Console → CodeBuild → fitai-api-build → Edit → Source
2. Nastavte GitHub webhook: "Push to branch: main"
3. Opakujte pro fitai-web-build
4. Každý push na main automaticky buildne a deployne

## 6. Environment Variables Checklist

| Proměnná | Kde nastavit | Popis |
|----------|-------------|-------|
| DATABASE_URL | Secrets Manager (auto) | PostgreSQL connection string |
| REDIS_URL | Secrets Manager (auto) | Redis connection string |
| JWT_SECRET | terraform.tfvars | Silný random string |
| AWS_REGION | ECS env (auto) | eu-west-1 |
| S3_BUCKET_VIDEOS | ECS env (auto) | fitai-videos-production |
| CLOUDFRONT_URL | ECS env (auto) | https://dXXXXXX.cloudfront.net |
| OPENAI_API_KEY | terraform.tfvars | Pro Whisper STT |
| ANTHROPIC_API_KEY | terraform.tfvars | Pro Claude choreography |
| NEXT_PUBLIC_API_URL | Build arg | ALB URL |

## 7. Odhadované Náklady (eu-west-1)

| Služba | Konfigurace | Cena/měsíc |
|--------|------------|-----------|
| ECS Fargate API | 0.25 vCPU, 0.5 GB | ~$10 |
| ECS Fargate Web | 0.25 vCPU, 0.5 GB | ~$8 |
| RDS PostgreSQL | db.t3.micro | ~$15 |
| ElastiCache Redis | cache.t3.micro | ~$13 |
| NAT Gateway | 1x | ~$32 |
| ALB | 1x | ~$16 |
| S3 + CloudFront | Low traffic | ~$2 |
| **Celkem** | | **~$60-80/měsíc** |

## 8. Užitečné Příkazy

```bash
# Sleduj logy API
aws logs tail /ecs/fitai-api --follow

# Sleduj logy Web
aws logs tail /ecs/fitai-web --follow

# Force redeploy
aws ecs update-service --cluster fitai-production --service fitai-api-service --force-new-deployment

# Škálování
aws ecs update-service --cluster fitai-production --service fitai-api-service --desired-count 2
```
