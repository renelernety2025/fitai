#!/usr/bin/env bash
# Fails when a newly added Prisma migration contains destructive or
# non-transactional DDL. Override for a reviewed migration by adding an
# empty marker file `.approved-destructive` next to its migration.sql.
set -euo pipefail

BASE="${1:-origin/main}"

files=$(git diff --name-only --diff-filter=A "$BASE"...HEAD -- 'apps/api/prisma/migrations/*/migration.sql' 2>/dev/null || true)
if [ -z "$files" ]; then
  echo "No new migrations — OK."
  exit 0
fi

dangerous=0
for f in $files; do
  dir=$(dirname "$f")
  if [ -f "$dir/.approved-destructive" ]; then
    echo "⚠ $f contains reviewed destructive DDL (.approved-destructive marker present) — skipping."
    continue
  fi
  if grep -nEi '\b(DROP[[:space:]]+(TABLE|COLUMN)|RENAME[[:space:]]+(TO|COLUMN)|TRUNCATE|CREATE[[:space:]]+INDEX[[:space:]]+CONCURRENTLY)\b' "$f"; then
    echo "::error file=$f::Destructive or non-transactional statement detected. Review it, then add $dir/.approved-destructive to acknowledge."
    dangerous=1
  else
    echo "✓ $f — additive only."
  fi
done

exit $dangerous
