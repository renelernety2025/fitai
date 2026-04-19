#!/usr/bin/env bash
# verify-docs-integrity.sh — doc sustainability safety net for FitAI.
#
# Adapted from Claude Code Bible v4.2. Checks size budgets, archive
# pointer integrity, and ADR count regression. Run before push or
# after any archive operation.
#
# Exit 0 = healthy. Exit 1 = broken.

set -euo pipefail
cd "$(dirname "$0")/.."

errors=0

# Configurable budgets (FitAI-specific)
CHANGELOG_MAX_KB=40
ROADMAP_MAX_KB=10
MIN_ADRS=15

echo "=== FitAI Doc Integrity Check ==="
echo ""

# 1. CHANGELOG size budget
if [ -f CHANGELOG.md ]; then
  changelog_kb=$(( $(wc -c < CHANGELOG.md) / 1024 ))
  if [ "$changelog_kb" -gt "$CHANGELOG_MAX_KB" ]; then
    echo "  [FAIL] CHANGELOG.md: ${changelog_kb} KB > ${CHANGELOG_MAX_KB} KB budget"
    echo "         Archive completed phases to CHANGELOG-archive/"
    errors=$((errors + 1))
  else
    echo "  [OK] CHANGELOG.md: ${changelog_kb} KB / ${CHANGELOG_MAX_KB} KB"
  fi
fi

# 2. ROADMAP size budget
if [ -f ROADMAP.md ]; then
  roadmap_kb=$(( $(wc -c < ROADMAP.md) / 1024 ))
  if [ "$roadmap_kb" -gt "$ROADMAP_MAX_KB" ]; then
    echo "  [FAIL] ROADMAP.md: ${roadmap_kb} KB > ${ROADMAP_MAX_KB} KB"
    errors=$((errors + 1))
  else
    echo "  [OK] ROADMAP.md: ${roadmap_kb} KB / ${ROADMAP_MAX_KB} KB"
  fi
fi

# 3. Archive forward pointers resolve
missing_archives=0
for dir in CHANGELOG-archive ROADMAP-archive; do
  if [ -d "$dir" ]; then
    for f in "$dir"/*.md; do
      [ -f "$f" ] || continue
      # Check back-pointer to active doc exists
      if ! grep -qE "@(CHANGELOG|ROADMAP)\.md|aktivní|active" "$f" 2>/dev/null; then
        echo "  [FAIL] Archive missing back-pointer: $f"
        errors=$((errors + 1))
        missing_archives=$((missing_archives + 1))
      fi
    done
  fi
done
archive_count=$(find CHANGELOG-archive ROADMAP-archive -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$missing_archives" -eq 0 ] && [ "$archive_count" -gt 0 ]; then
  echo "  [OK] Archive back-pointers: $archive_count/$archive_count"
fi

# 4. ADR count regression guard
if [ -f ARCHITECTURE.md ]; then
  adr_count=$(grep -cE "^\| [0-9]+ " ARCHITECTURE.md 2>/dev/null || echo "0")
  if [ "$adr_count" -lt "$MIN_ADRS" ]; then
    echo "  [FAIL] ADR count: $adr_count < $MIN_ADRS (regression?)"
    errors=$((errors + 1))
  else
    echo "  [OK] ADR count: $adr_count (>= $MIN_ADRS)"
  fi
fi

# 5. Auto-load total estimate
total_kb=0
for f in CLAUDE.md ROADMAP.md ARCHITECTURE.md CHANGELOG.md; do
  [ -f "$f" ] && total_kb=$((total_kb + $(wc -c < "$f") / 1024))
done
echo "  [INFO] Auto-load estimate: ${total_kb} KB (CLAUDE + ROADMAP + ARCH + CHANGELOG)"

# 6. Smoke test exists
if [ -f test-production.sh ]; then
  echo "  [OK] test-production.sh exists"
else
  echo "  [WARN] test-production.sh missing"
fi

echo ""
if [ "$errors" -eq 0 ]; then
  echo "All doc integrity checks passed. ($archive_count archives, $adr_count ADRs)"
  exit 0
else
  echo "$errors integrity issue(s) found."
  exit 1
fi
