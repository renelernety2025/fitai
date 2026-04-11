---
name: deploy
description: Deploy FitAI to production — either web/api via git push main (triggers GitHub Actions → CodeBuild → ECS) or mobile via EAS build. NEVER auto-invoke. Only run when user explicitly asks to deploy. Always runs verification steps before push.
---

# Deploy Skill

> **Manual-only skill.** Do not auto-invoke. Deployment is a deliberate decision — user must explicitly ask.

## Web + API deploy (GitHub Actions)

**Trigger:** `git push origin main` → `.github/workflows/deploy.yml`

### Pre-deploy verification (ALWAYS run first)

```bash
cd /Users/renechlubny/projekty/fitai

# 1. Clean working tree
git status --porcelain
# Expected: empty (or only the intended changes staged)

# 2. TypeScript compiles (api + web)
cd apps/api && npx tsc --noEmit 2>&1 | tail -5
cd ../web && npx tsc --noEmit 2>&1 | tail -5

# 3. Smoke test current production BEFORE pushing
cd ../..
bash test-production.sh
# Expected: 61/61 passing (if already broken, stop — don't push broken state)
```

### Deploy

```bash
# Review diff one more time
git diff --stat origin/main..HEAD

# Push to main — triggers auto-deploy
git push origin main

# Watch the workflow
gh run watch  # or: gh run list --limit 1
```

### Post-deploy verification

```bash
# Wait for workflow to finish (~5-8 min), then:
bash test-production.sh
# Expected: 61/61 still passing

# Check deployed image digest matches:
aws ecs describe-services \
  --cluster fitai-production \
  --services fitai-api-service fitai-web-service \
  --query 'services[].[serviceName,taskDefinition,desiredCount,runningCount]' \
  --output table
```

### If Prisma schema changed
`.github/workflows/deploy.yml` auto-runs `fitai-migrate:2` task. Verify it succeeded:
```bash
aws ecs list-tasks --cluster fitai-production --family fitai-migrate --max-results 1
```

## Mobile deploy (EAS Build)

### Pre-flight (always)

Run the `native-module-check` skill first. Every item in its 6-step checklist must pass.

```bash
cd apps/mobile

# Clean slate
rm -rf ios android node_modules
npm install

# Prebuild
npx expo prebuild --clean

# Local pod install (catches 80% of EAS failures)
cd ios && pod install && cd ..

# Metro bundle sanity (catches JS errors)
npx expo export --platform ios --dev
```

### Build + submit

```bash
# Development build (TestFlight internal only)
eas build --platform ios --profile development

# Preview build (TestFlight external testers)
eas build --platform ios --profile preview

# Production build (App Store submission)
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

### Monitor

```bash
eas build:list --limit 3
eas build:view --latest
```

## Stop conditions — DO NOT deploy if

- `test-production.sh` is failing on current main
- There are uncommitted changes not intended for this deploy
- TypeScript has errors (`tsc --noEmit` fails)
- Schema change without matching seed/migration path
- EAS pre-flight fails locally
- User hasn't asked for a deploy (this skill is manual-only)

## Rollback

### API/Web
```bash
# Find last known-good task definition
aws ecs list-task-definitions --family-prefix fitai-api --sort DESC --max-results 5

# Force ECS to previous revision
aws ecs update-service \
  --cluster fitai-production \
  --service fitai-api-service \
  --task-definition fitai-api:<REV> \
  --force-new-deployment
```

### Mobile
TestFlight/App Store Connect: expire the bad build, promote previous. There is no automated rollback — iteration is the only path forward.
