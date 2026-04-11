#!/bin/bash
# PreToolUse hook — blokuje editaci zámčených souborů (viz CLAUDE.md "Zámčené části").
# Čte JSON z stdin, extrahuje file_path, matchuje proti locked patternům.
# Exit 2 = blokace (Claude dostane stderr message); exit 0 = pokračuj.

set -euo pipefail

FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [ -z "$FILE" ]; then
  exit 0
fi

# Zámčené soubory (match viz CLAUDE.md)
LOCKED_PATTERNS=(
  "prisma/schema\.prisma"
  "apps/api/src/auth/"
  "apps/web/src/lib/feedback-engine\.ts"
  "apps/web/src/lib/rep-counter\.ts"
  "apps/web/src/lib/safety-checker\.ts"
  "apps/web/src/lib/smart-voice\.ts"
  "apps/api/src/main\.ts"
)

for pattern in "${LOCKED_PATTERNS[@]}"; do
  if echo "$FILE" | grep -qE "$pattern"; then
    echo "🔒 Protected file blocked by .claude/hooks/protect-files.sh" >&2
    echo "   File: $FILE" >&2
    echo "   Reason: listed in CLAUDE.md 'Zámčené části' — needs explicit user approval." >&2
    exit 2
  fi
done

exit 0
