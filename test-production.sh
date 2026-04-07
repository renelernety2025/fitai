#!/bin/bash
# FitAI Production Regression Test
# Usage: bash test-production.sh
# Tests critical API endpoints + frontend pages.
# Exit 1 if anything fails.

set -u
ALB="${ALB_URL:-http://fitai-production-alb-1685369378.eu-west-1.elb.amazonaws.com}"
EMAIL="${TEST_EMAIL:-demo@fitai.com}"
PASSWORD="${TEST_PASSWORD:-demo1234}"

PASS=0
FAIL=0
FAILED_TESTS=()

green() { printf "\033[32m%s\033[0m" "$1"; }
red()   { printf "\033[31m%s\033[0m" "$1"; }
yellow(){ printf "\033[33m%s\033[0m" "$1"; }

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  $(green ✓) $name"
    PASS=$((PASS+1))
  else
    echo "  $(red ✗) $name (expected $expected, got $actual)"
    FAIL=$((FAIL+1))
    FAILED_TESTS+=("$name")
  fi
}

check_contains() {
  local name="$1"
  local needle="$2"
  local haystack="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  $(green ✓) $name"
    PASS=$((PASS+1))
  else
    echo "  $(red ✗) $name (missing: $needle)"
    FAIL=$((FAIL+1))
    FAILED_TESTS+=("$name")
  fi
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$1" ${2:+-H "$2"}
}

echo "$(yellow '=== FitAI Regression Tests ===')"
echo "Target: $ALB"
echo ""

# 1. Health check
echo "$(yellow '[1] Health & Auth')"
check "GET /health" "200" "$(http_status "$ALB/health")"

# 2. Login
LOGIN_RESP=$(curl -s -X POST "$ALB/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN_RESP" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "  $(red ✗) POST /api/auth/login — no accessToken in response"
  echo "  Response: $LOGIN_RESP"
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("login")
else
  echo "  $(green ✓) POST /api/auth/login (token acquired)"
  PASS=$((PASS+1))
fi

AUTH="Authorization: Bearer $TOKEN"

# 3. API endpoints
echo ""
echo "$(yellow '[2] API endpoints')"
api_endpoints=(
  "/api/auth/me"
  "/api/users/me/reminder-status"
  "/api/exercises"
  "/api/workout-plans"
  "/api/videos"
  "/api/gym-sessions/my"
  "/api/gym-sessions/my/weekly-volume"
  "/api/intelligence/plateaus"
  "/api/intelligence/recovery"
  "/api/intelligence/weak-points"
  "/api/onboarding/status"
  "/api/education/lessons"
  "/api/education/glossary"
  "/api/education/lessons/of-the-week"
  "/api/social/feed"
  "/api/social/follow-counts"
)
for ep in "${api_endpoints[@]}"; do
  check "GET $ep" "200" "$(http_status "$ALB$ep" "$AUTH")"
done

# 4. Content checks
echo ""
echo "$(yellow '[3] Content sanity')"
EX=$(curl -s "$ALB/api/exercises" -H "$AUTH")
check_contains "exercises has ≥1 item" '"id"' "$EX"

LESSONS=$(curl -s "$ALB/api/education/lessons" -H "$AUTH")
check_contains "lessons has ≥1 item" '"slug"' "$LESSONS"

GLOSSARY=$(curl -s "$ALB/api/education/glossary" -H "$AUTH")
check_contains "glossary has ≥1 term" '"term"' "$GLOSSARY"

# 5. Frontend pages (must return HTML, not JSON)
echo ""
echo "$(yellow '[4] Frontend pages (HTML)')"
pages=(
  "/"
  "/login"
  "/register"
  "/dashboard"
  "/onboarding"
  "/videos"
  "/exercises"
  "/plans"
  "/gym/start"
  "/ai-coach"
  "/lekce"
  "/slovnik"
  "/community"
  "/progress"
)
for page in "${pages[@]}"; do
  check "GET $page" "200" "$(http_status "$ALB$page")"
done

# 6. Routing sanity (API vs page collision)
echo ""
echo "$(yellow '[5] Routing sanity')"
API_EX=$(curl -s "$ALB/api/exercises" -H "$AUTH" -o /dev/null -w "%{content_type}")
check_contains "/api/exercises returns JSON" "application/json" "$API_EX"

PAGE_EX=$(curl -s "$ALB/exercises" -o /dev/null -w "%{content_type}")
check_contains "/exercises returns HTML" "text/html" "$PAGE_EX"

# Summary
echo ""
echo "$(yellow '=== Summary ===')"
echo "  Passed: $(green $PASS)"
echo "  Failed: $(red $FAIL)"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "$(red 'FAILED TESTS:')"
  for t in "${FAILED_TESTS[@]}"; do echo "  - $t"; done
  exit 1
fi

echo ""
echo "$(green '✓ All tests passed.')"
exit 0
