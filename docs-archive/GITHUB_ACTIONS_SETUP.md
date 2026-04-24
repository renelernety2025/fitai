# GitHub Actions → AWS Setup (OIDC)

Tento návod nastaví GitHub Actions tak, aby se autentizovaly do AWS přes OIDC
(bez long-lived access keys). Celý setup zabere ~10 minut a dělá se **jednou**.

## Co budeš mít po dokončení

- Každý `git push origin main` automaticky:
  1. Detekuje co se změnilo (api/web/schema)
  2. Spustí relevantní CodeBuild projekty (paralelně)
  3. Pokud se měnil `schema.prisma` → spustí migrační task
  4. Po úspěšném buildu → ECS auto-deploy (`force-new-deployment` v buildspec)
  5. Spustí `test-production.sh` jako smoke test
  6. Shrne výsledek v GitHub UI

## Preflight

```bash
export AWS_PROFILE=fitai
aws sts get-caller-identity
# Account: 326334468637 — ověř že sedí
```

---

## Krok 1 — Vytvořit OIDC provider v AWS (jednou za účet)

Pokud jsi to už někdy dělala pro jiný repo, přeskoč.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --region eu-west-1
```

**Pokud vrátí `EntityAlreadyExists`** — super, už existuje, pokračuj.

---

## Krok 2 — Vytvořit IAM Role `fitai-github-actions`

### 2a. Trust policy (kdo může roli použít)

```bash
cat > /tmp/trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::326334468637:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:renelernety2025/fitai:*"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name fitai-github-actions \
  --assume-role-policy-document file:///tmp/trust-policy.json
```

### 2b. Permissions policy (co smí dělat)

```bash
cat > /tmp/deploy-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CodeBuildDeploy",
      "Effect": "Allow",
      "Action": [
        "codebuild:StartBuild",
        "codebuild:BatchGetBuilds",
        "codebuild:ListBuildsForProject"
      ],
      "Resource": [
        "arn:aws:codebuild:eu-west-1:326334468637:project/fitai-api-build",
        "arn:aws:codebuild:eu-west-1:326334468637:project/fitai-web-build"
      ]
    },
    {
      "Sid": "EcsRunMigration",
      "Effect": "Allow",
      "Action": [
        "ecs:RunTask",
        "ecs:DescribeTasks",
        "ecs:DescribeServices",
        "ecs:ListTasks"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EcsPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::326334468637:role/fitai-production-ecs-execution",
        "arn:aws:iam::326334468637:role/fitai-production-ecs-task"
      ]
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name fitai-github-actions \
  --policy-name fitai-deploy-policy \
  --policy-document file:///tmp/deploy-policy.json
```

### 2c. Ověření

```bash
aws iam get-role --role-name fitai-github-actions \
  --query 'Role.Arn' --output text
# Mělo by vrátit: arn:aws:iam::326334468637:role/fitai-github-actions
```

---

## Krok 3 — GitHub secrets (nejsou potřeba, pokud používáme OIDC)

**S OIDC NEPOTŘEBUJEŠ** ukládat `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.
Role ARN je hardcoded v `.github/workflows/deploy.yml`.

Pokud někdy budeš chtít Slack notifikace, přidej pak:
- `Settings → Secrets and variables → Actions → New repository secret`
- Name: `SLACK_WEBHOOK_URL`, Value: tvůj webhook

---

## Krok 4 — První deploy

```bash
cd /Users/renechlubny/Desktop/fitai
git add .github docs/GITHUB_ACTIONS_SETUP.md
git commit -m "ci: GitHub Actions → AWS deploy pipeline (OIDC)"
git push origin main
```

### Sleduj průběh
1. Otevři https://github.com/renelernety2025/fitai/actions
2. Měl by se objevit nový run "Deploy to AWS"
3. Jobs se spustí v pořadí:
   - `detect-changes` (~5s)
   - `build-api` + `build-web` paralelně (~4-5 min každý)
   - `migrate` (jen pokud se měnil schema, ~1 min)
   - `smoke-test` (~2 min)
   - `summary`

### Pokud něco selže
- Klikni na failed job → rozbalený log ti řekne co
- Nejčastější problém: **role nemá některé permission** → doplň do `deploy-policy.json`
  a běž znovu `aws iam put-role-policy ...`
- **OIDC trust fails:** zkontroluj že repo owner sedí — `repo:renelernety2025/fitai:*`

---

## Rollback / manual deploy

### Manual run přes GitHub UI
`Actions → Deploy to AWS → Run workflow → main → Run`

### Nouzový ruční deploy (pokud by GH Actions vypadlo)
Staré příkazy pořád fungují:
```bash
export AWS_PROFILE=fitai
aws codebuild start-build --project-name fitai-api-build --region eu-west-1
aws codebuild start-build --project-name fitai-web-build --region eu-west-1
```

### Rollback na předchozí ECS task definition
```bash
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-api-service \
  --task-definition fitai-api-service:PREV_REVISION \
  --region eu-west-1
```

---

## Co ještě chybí / next steps

- [ ] **Slack/Discord notifikace** — přidat step v `summary` job
- [ ] **PR preview environments** — složitější, odložit
- [ ] **Auto-rollback při smoke test fail** — přidat později
- [ ] **Cost budgets alarm** — mimo scope CI/CD

---

## Troubleshooting

### "User is not authorized to perform: codebuild:StartBuild"
→ Role nemá permission, doplň do `deploy-policy.json`, re-aplikuj `put-role-policy`.

### "Token exchange failed"
→ OIDC provider nebo trust policy je špatně. Zkontroluj krok 1 a 2a.

### Workflow se nespustí vůbec
→ Zkontroluj že soubor je v `.github/workflows/*.yml` na `main` branch a že syntaxe YAML je v pořádku (`yamllint .github/workflows/deploy.yml`).

### "Migration task failed"
→ Podívej se na CloudWatch logs skupinu `/aws/ecs/fitai-production` → stream `fitai-migrate/...`.
