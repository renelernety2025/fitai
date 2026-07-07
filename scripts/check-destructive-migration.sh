#!/usr/bin/env bash
# Fails when a newly added Prisma migration contains destructive or
# non-transactional DDL.
#
# CI (PR gate): a reviewed migration can be unblocked by adding an empty
#   marker file `.approved-destructive` next to its migration.sql.
# Deploy gate: set IGNORE_APPROVED_MARKER=1 so the marker does NOT bypass the
#   production-migrations reviewer — destructive DDL always needs approval at
#   deploy time (a single author can't self-approve by committing the marker).
set -euo pipefail

BASE="${1:-origin/main}"
IGNORE_APPROVED_MARKER="${IGNORE_APPROVED_MARKER:-0}"

files=$(git diff --name-only --diff-filter=A "$BASE"...HEAD -- 'apps/api/prisma/migrations/*/migration.sql' 2>/dev/null || true)
if [ -z "$files" ]; then
  echo "No new migrations — OK."
  exit 0
fi

# Data-loss / rewrite / non-transactional DDL. Allowlisting known-safe verbs is
# brittle for generated SQL, so we denylist the statements Prisma can emit that
# drop, rewrite, or lock data. Keep this in sync with migration reality.
DESTRUCTIVE_RE='\b(DROP[[:space:]]+(TABLE|COLUMN|CONSTRAINT|SCHEMA|DATABASE|INDEX)|RENAME[[:space:]]+(TO|COLUMN)|TRUNCATE|DELETE[[:space:]]+FROM|ALTER[[:space:]]+COLUMN|SET[[:space:]]+NOT[[:space:]]+NULL|CREATE[[:space:]]+INDEX[[:space:]]+CONCURRENTLY)\b'

dangerous=0
for f in $files; do
  dir=$(dirname "$f")
  if [ "$IGNORE_APPROVED_MARKER" != "1" ] && [ -f "$dir/.approved-destructive" ]; then
    echo "⚠ $f has reviewed destructive DDL (.approved-destructive present) — CI gate skipped."
    continue
  fi
  if grep -nEi "$DESTRUCTIVE_RE" "$f"; then
    echo "::error file=$f::Destructive or non-transactional statement detected. At deploy time this requires the production-migrations reviewer; for the PR gate add $dir/.approved-destructive after review."
    dangerous=1
  else
    echo "✓ $f — additive only."
  fi
done

exit $dangerous
