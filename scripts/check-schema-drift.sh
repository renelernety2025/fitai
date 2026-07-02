#!/usr/bin/env bash
# Compares a live database against prisma/schema.prisma.
# Exit 0 = no drift, exit 2 = drift detected (prints the reconciling DDL).
# Usage: DATABASE_URL=postgresql://... bash scripts/check-schema-drift.sh
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set (the DB to compare against schema.prisma)." >&2
  exit 1
fi

cd "$(dirname "$0")/../apps/api"

npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --exit-code
