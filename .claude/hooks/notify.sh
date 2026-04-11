#!/bin/bash
# Notification hook — macOS desktop notification when Claude needs attention.
# Reads optional JSON from stdin; uses 'message' field if present.

MESSAGE=$(jq -r '.message // "Claude Code needs your input"' 2>/dev/null || echo "Claude Code")

osascript -e "display notification \"$MESSAGE\" with title \"Claude Code — FitAI\" sound name \"Ping\"" 2>/dev/null || true

exit 0
