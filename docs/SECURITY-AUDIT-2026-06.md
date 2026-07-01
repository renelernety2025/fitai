# Security & AWS Audit — 2026-06

Read-only audit of the project's AWS targeting + a code/security review of the
infrastructure, followed by application of the non-destructive fixes.

## 1. AWS account targeting

| Item | Value | Source |
|------|-------|--------|
| Target account | `326334468637` | `.github/workflows/deploy.yml:18`, OIDC role ARN (×6) |
| Region | `eu-west-1` | `deploy.yml`, `infrastructure/terraform.tfvars`, `backend.tf` |
| Deploy auth (CI) | GitHub Actions OIDC → `arn:aws:iam::326334468637:role/fitai-github-actions` | `deploy.yml` |
| Terraform state | S3 `fitai-terraform-state` + DynamoDB lock `fitai-terraform-lock`, encrypted | `backend.tf` |

### Active local identity at audit time
- `aws sts get-caller-identity` (default profile) → **`965932218007`** / `user/lernety-developer` — **WRONG account** (lernety).
- `--profile fitai` → `326334468637` / `user/fitai-deployer` — correct.

**Risk:** locally nothing pinned `AWS_PROFILE`, so bare `aws`/`terraform` hit the
lernety account. **Fixed** by adding `.envrc` (`export AWS_PROFILE=fitai`).
CI/CD is unaffected (OIDC, isolated from `~/.aws`).

## 2. Findings (code review + security review)

| # | Sev | Finding | Location | Status |
|---|-----|---------|----------|--------|
| C1 | Critical | Real DB password + JWT secret in plaintext on disk (NOT in git) | `infrastructure/terraform.tfvars` | ⏳ Pending — rotate + move to Secrets Manager / `TF_VAR_*` |
| 1 | Critical | Redis CloudWatch alarms never created (`redis_cluster_id` not passed) | `infrastructure/main.tf` | ✅ Fixed |
| 2 | Critical | ECS task defs pinned to `:latest` → TF/runtime drift | `modules/compute/main.tf` | ✅ Fixed (`ignore_changes`) |
| 3 | Critical | `test-production.sh` no `set -e`/`pipefail` | `test-production.sh` | ⏳ Pending — script is continue-on-fail by design; needs careful change |
| H1 | High | Real VAPID private key in `.env` (NOT in git) | `.env` | ⏳ Pending — rotate if ever shared |
| H2 | High | RDS no `deletion_protection`, `skip_final_snapshot=true` | `modules/database/main.tf` | ✅ Fixed |
| H2b | High | RDS `storage_encrypted` not set | `modules/database/main.tf` | ⏳ Pending — **destructive** (DB recreate / snapshot-restore) |
| H3 | High | Redis no transit/at-rest encryption, no auth token | `modules/cache/main.tf` | ⏳ Pending — **destructive** (needs replication_group, recreate) |
| 4 | High | CI lint/typecheck always green (`|| echo`) | `.github/workflows/ci.yml` | ✅ Fixed (may surface existing lint/type debt) |
| M1 | Medium | S3 buckets no public-access-block / SSE | `modules/storage/main.tf` | ✅ Fixed (both buckets) |
| M2 | Medium | S3 CORS `allowed_origins=["*"]` | `modules/storage/main.tf` | ⏳ Pending — set to real app origin |
| M3 | Medium | IAM `Resource=["*"]` (ECR account wildcard; mediaconvert) | `main.tf`, `modules/compute/main.tf` | ✅ ECR account fixed / ⏳ mediaconvert left (coarse-grained) |
| M4 | Medium | Local default profile = wrong account | — | ✅ Fixed (`.envrc`) |
| L1 | Low | Over-broad Bash allowlist (`rm:*`, `bash:*`) | `.claude/settings.local.json` | ⏳ Pending — prune to least-privilege |

### Verified OK (not findings)
- `.env` and `terraform.tfvars` are git-ignored, **not tracked, not in history**.
- CI deploy uses OIDC (no long-lived keys); deploy triggers only on `main` + manual.
- Security groups scoped (RDS/Redis ingress only from API SG); ECS/RDS/Redis in private subnets.
- ECS pulls secrets from Secrets Manager via `valueFrom` (not baked into env).

## 3. Changes applied this session (non-destructive)

- `.envrc` *(new)* — `export AWS_PROFILE=fitai`.
- `infrastructure/main.tf` — added `data.aws_caller_identity`; ECR ARNs use real
  account id instead of `*`; pass `redis_cluster_id` to monitoring.
- `infrastructure/modules/database/main.tf` — `deletion_protection=true`,
  `skip_final_snapshot=false` + `final_snapshot_identifier`.
- `infrastructure/modules/compute/main.tf` — `lifecycle { ignore_changes =
  [container_definitions] }` on both task definitions.
- `infrastructure/modules/storage/main.tf` — `public_access_block` + SSE (AES256)
  on `videos` and `assets` buckets.
- `.github/workflows/ci.yml` — removed `|| echo` so lint/typecheck actually gate.
- `docs/SECURITY-AUDIT-2026-06.md` *(this file)*.

Validated with `terraform fmt` + `terraform validate` → **Success, config valid.**
`terraform apply` was **NOT** run. Apply only after `export AWS_PROFILE=fitai`
(default profile points at the wrong account).

## 4. Pending — needs explicit decision (destructive or operational)

1. **C1 / H1** Rotate DB password, JWT secret, VAPID private key; move secrets off
   plaintext disk into Secrets Manager / `TF_VAR_*`.
2. **H2b** RDS `storage_encrypted=true` — recreate via encrypted snapshot restore.
3. **H3** Redis encryption + auth — migrate `aws_elasticache_cluster` →
   `aws_elasticache_replication_group` (recreate).
4. **M2** Set S3 CORS `allowed_origins` to the real frontend origin.
5. **L1** Prune `.claude/settings.local.json` allowlist (`rm:*`, `bash:*`, stale entries).
