# Runbook — Rollback produkce

Tři úrovně, od nejrychlejší. Vždy `AWS_PROFILE=fitai`, region `eu-west-1`.

## 0. Automatický rollback (nic nedělat)

ECS deployment circuit breaker (`enable + rollback`) vrací službu na poslední
funkční deployment, když nové tasky opakovaně padají na health checku.
Deploy workflow to zviditelní: krok „Verify rollout completed" selže, když
`rolloutState != COMPLETED`.

## 1. App rollback — ECR retag `:latest` na dobrý SHA (standardní cesta)

Buildspec taguje každý image git SHA (7 znaků) vedle `:latest`. ECR lifecycle
drží 30 images → hloubka ~14 deployů.

```bash
# 1) najdi poslední dobrý SHA tag
aws ecr describe-images --repository-name fitai-api --region eu-west-1 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-8:].{tags:imageTags,pushed:imagePushedAt}' --output table

# 2) přepni :latest na jeho manifest (digest-stable, bez dockeru)
MANIFEST=$(aws ecr batch-get-image --repository-name fitai-api --region eu-west-1 \
  --image-ids imageTag=<GOOD_SHA> --query 'images[0].imageManifest' --output text)
aws ecr put-image --repository-name fitai-api --region eu-west-1 \
  --image-tag latest --image-manifest "$MANIFEST"

# 3) roll service
aws ecs update-service --cluster fitai-production --service fitai-api-service \
  --force-new-deployment --region eu-west-1
```

Pro web analogicky (`fitai-web`, `fitai-web-service`). Retag přežije
autoscaling (nové tasky tahají přepnutý `:latest`).

Alternativa bez retagu: `describe-task-definition` → jq swap `.image` na SHA
tag → `register-task-definition` → `update-service --task-definition <rev>`.
Terraform má `ignore_changes = [task_definition]`, takže se nepohádá.

## 2. Migrace selhala (`prisma migrate deploy` non-zero)

Prisma spouští každou migraci v transakci — failed migrace se sama rollbackne
a zapíše `failed` řádek do `_prisma_migrations`, který blokuje další deploye.
deploy.yml v tom případě přeskočí `deploy-api` (starý kód běží dál).

1. Přečti logy: CloudWatch `/ecs/fitai-api`, stream prefix `migrate/`.
2. Oprav migration SQL v novém commitu.
3. Odblokuj historii — one-off ECS task s override:
   ```bash
   aws ecs run-task --cluster fitai-production --task-definition fitai-migrate \
     --launch-type FARGATE --region eu-west-1 \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-0bd0a6c5d4eadd609,subnet-0d261214e57e14fba],securityGroups=[sg-0bfd908240d06c541],assignPublicIp=DISABLED}" \
     --overrides '{"containerOverrides":[{"name":"migrate","command":["npx","prisma","migrate","resolve","--rolled-back","<MIGRATION_NAME>"]}]}'
   ```
4. Push opraveného commitu → deploy pipeline zopakuje migrate.

Cutover revert (nouzový): v deploy.yml repin `--task-definition fitai-migrate:3`
(revize s `db push` zůstává ACTIVE navždy); `0_init` řádek je pod db push inertní.

## 3. DB restore ze snapshotu (poslední možnost)

Pre-migrate snapshoty: `fitai-predeploy-<sha>-<timestamp>` (vytváří deploy.yml
při schema změně; **vyžaduje jednorázový IAM grant** — viz níže). Restore point
je fixní od okamžiku initiation.

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier fitai-production-postgres-restore \
  --db-snapshot-identifier <SNAP_ID> --region eu-west-1
```

Pak: přepnout `DATABASE_URL` v Secrets Manageru (`fitai-production-secrets`)
na nový endpoint, force-new-deployment api + web, a srovnat Terraform state.
Preferuj forward-fix přes `migrate resolve` — restore ztrácí zápisy po snapshotu.

## Jednorázový IAM grant pro pre-migrate snapshoty (PENDING — user)

```bash
AWS_PROFILE=fitai aws iam put-role-policy --role-name fitai-github-actions \
  --policy-name rds-predeploy-snapshots --policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["rds:CreateDBSnapshot", "rds:DeleteDBSnapshot", "rds:DescribeDBSnapshots"],
    "Resource": [
      "arn:aws:rds:eu-west-1:326334468637:db:fitai-production-postgres",
      "arn:aws:rds:eu-west-1:326334468637:snapshot:fitai-predeploy-*"
    ]
  }]
}'
```

Bez grantu selže krok „Pre-migration RDS snapshot" na prvním schema-change
deployi (AccessDenied) a deploy se zastaví — bezpečné selhání, ale blokuje.
