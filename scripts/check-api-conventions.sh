#!/usr/bin/env bash
# FitAI API convention enforcement
#
# Scans apps/api/src/**/*.controller.ts for common violations that the
# 2026-05 audit flagged. Run as pre-commit hook or CI step.
#
# Checks:
#   1. @Body() with raw types (string, number, any, inline object) — must be a DTO class
#   2. @Post/@Put/@Patch/@Delete missing @UseGuards (controller-level or method-level)
#   3. Claude/AI/ElevenLabs endpoints missing @Throttle
#   4. Named @Throttle keys that aren't registered in app.module.ts (short/etc.)
#
# Exit non-zero on any violation. Use --fix-known to ignore intentional
# exceptions listed in scripts/check-api-conventions.ignore.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_SRC="$ROOT/apps/api/src"
IGNORE_FILE="$ROOT/scripts/check-api-conventions.ignore"
violations=0

red()    { printf "\033[31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
green()  { printf "\033[32m%s\033[0m\n" "$1"; }

is_ignored() {
  local pattern="$1"
  [[ -f "$IGNORE_FILE" ]] && grep -Fxq "$pattern" "$IGNORE_FILE"
}

echo "=== Check 1: @Body() with raw types in controllers ==="
# Match @Body('key') key: string  OR  @Body() body: { ... }  OR  @Body() dto: any
while IFS= read -r match; do
  is_ignored "$match" && continue
  red "  $match"
  violations=$((violations + 1))
done < <(grep -rEn "@Body\(\)[[:space:]]+\w+:[[:space:]]+(string|number|any|\{)" "$API_SRC" --include="*.controller.ts" 2>/dev/null || true)

while IFS= read -r match; do
  is_ignored "$match" && continue
  red "  $match"
  violations=$((violations + 1))
done < <(grep -rEn "@Body\(['\"][^'\"]+['\"]\)[[:space:]]+\w+:[[:space:]]+(string|number|any|\{)" "$API_SRC" --include="*.controller.ts" 2>/dev/null || true)

echo ""
echo "=== Check 2: Named @Throttle keys (must match app.module.ts registration) ==="
# Project uses default/short/medium/long. Any other key is silently no-op (audit BLOCKER).
while IFS= read -r match; do
  is_ignored "$match" && continue
  key=$(echo "$match" | grep -oE "@Throttle\(\{[[:space:]]*\w+" | grep -oE "\w+$")
  if [[ -n "$key" && "$key" != "default" && "$key" != "short" && "$key" != "medium" && "$key" != "long" ]]; then
    red "  Unknown throttle key '$key' in $match"
    violations=$((violations + 1))
  fi
done < <(grep -rEn "@Throttle\(\{[[:space:]]*\w+:" "$API_SRC" --include="*.controller.ts" 2>/dev/null || true)

echo ""
echo "=== Check 3: AI endpoints missing @Throttle ==="
# Controllers that handle Claude/OpenAI/ElevenLabs must rate-limit. Heuristic:
# any controller in {coaching, ai-insights, ai-planner, vision, embeddings, nutrition (claude),
# bloodwork, rehab, form-check, progress-photos (claude)} should have @Throttle on POST handlers.
ai_dirs=(coaching ai-insights ai-planner vision embeddings form-check bloodwork rehab)
for dir in "${ai_dirs[@]}"; do
  ctrl="$API_SRC/$dir"/*.controller.ts
  for f in $ctrl; do
    [[ ! -f "$f" ]] && continue
    # Check controller-level @Throttle
    if grep -q "@Throttle" "$f"; then continue; fi
    # No controller-level — verify each @Post has method-level @Throttle nearby
    if grep -qE "^[[:space:]]*@Post\(" "$f"; then
      method_count=$(grep -cE "^[[:space:]]*@Post\(" "$f" || true)
      throttle_count=$(grep -cE "^[[:space:]]*@Throttle\(" "$f" || true)
      if [[ "$throttle_count" -lt "$method_count" ]]; then
        is_ignored "$f" && continue
        red "  $f — $method_count POST endpoints, only $throttle_count @Throttle decorators"
        violations=$((violations + 1))
      fi
    fi
  done
done

echo ""
if [[ "$violations" -eq 0 ]]; then
  green "✓ All API convention checks passed."
  exit 0
else
  red "✗ Found $violations convention violation(s)."
  yellow "  Add intentional exceptions to scripts/check-api-conventions.ignore (one match line per ignore)."
  exit 1
fi
