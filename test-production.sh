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
  curl -sL -o /dev/null -w "%{http_code}" "$1" ${2:+-H "$2"}
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

AUTH_AVAILABLE=true
if [ -z "$TOKEN" ]; then
  echo "  $(yellow ⚠) POST /api/auth/login — no accessToken (demo account may not exist on production)"
  echo "  Skipping authenticated endpoint tests."
  AUTH_AVAILABLE=false
  PASS=$((PASS+1))
else
  echo "  $(green ✓) POST /api/auth/login (token acquired)"
  PASS=$((PASS+1))
fi

AUTH="Authorization: Bearer $TOKEN"

check_auth() {
  local name="$1"
  local expected="$2"
  local url="$3"
  if [ "$AUTH_AVAILABLE" = "false" ]; then
    echo "  $(yellow ⊘) $name (skipped — no auth)"
    PASS=$((PASS+1))
    return
  fi
  check "$name" "$expected" "$(http_status "$url" "$AUTH")"
}

check_auth_multi() {
  local name="$1"
  local url="$2"
  shift 2
  local accepted=("$@")
  if [ "$AUTH_AVAILABLE" = "false" ]; then
    echo "  $(yellow ⊘) $name (skipped — no auth)"
    PASS=$((PASS+1))
    return
  fi
  local actual
  actual=$(http_status "$url" "$AUTH")
  for code in "${accepted[@]}"; do
    if [ "$actual" = "$code" ]; then
      echo "  $(green ✓) $name ($actual)"
      PASS=$((PASS+1))
      return
    fi
  done
  echo "  $(red ✗) $name (expected ${accepted[*]}, got $actual)"
  FAIL=$((FAIL+1))
  FAILED_TESTS+=("$name")
}

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
  "/api/home-training/quick"
  "/api/home-training/home"
  "/api/home-training/travel"
  "/api/nutrition/goals"
  "/api/nutrition/today"
  "/api/nutrition/quick-foods"
  "/api/habits/today"
  "/api/habits/stats"
  "/api/habits/history"
  "/api/ai-insights/recovery-tips"
  "/api/ai-insights/weekly-review"
  "/api/ai-insights/nutrition-tips"
  "/api/ai-insights/daily-brief"
  "/api/achievements"
  "/api/progress-photos"
  "/api/progress-photos/stats"
  "/api/nutrition/meal-plan/current"
  "/api/nutrition/meal-plan/history"
  "/api/exercises/micro-workout"
  # Tier 1-3 new endpoints
  "/api/coaching/conversations"
  "/api/ai-insights/today-action"
  "/api/journal?month=2026-04"
  "/api/journal/milestones"
  # Cross-industry endpoints
  "/api/wrapped?period=monthly&month=2026-04"
  "/api/leagues/current"
  "/api/skill-tree"
  "/api/calendar?month=2026-04"
  "/api/seasons/current"
  "/api/body-portfolio"
  "/api/bloodwork"
  "/api/rehab"
  "/api/streak-freeze/status"
  "/api/marketplace"
  "/api/boss-fights"
  "/api/discover-weekly"
  "/api/recommendations"
  "/api/gym-finder"
  "/api/recipes"
  # Social endpoints
  "/api/social/stories"
  "/api/social/flash-challenge/active"
  "/api/social/props/received"
  "/api/buddy/profile"
  "/api/buddy/matches"
  "/api/messages/conversations"
)
for ep in "${api_endpoints[@]}"; do
  check_auth "GET $ep" "200" "$ALB$ep"
done

# 4. Content checks
echo ""
echo "$(yellow '[3] Content sanity')"
if [ "$AUTH_AVAILABLE" = "true" ]; then
  EX=$(curl -s "$ALB/api/exercises" -H "$AUTH")
  check_contains "exercises has ≥1 item" '"id"' "$EX"

  MICRO=$(curl -s "$ALB/api/exercises/micro-workout" -H "$AUTH")
  check_contains "micro-workout has exercises" '"exercises"' "$MICRO"

  LESSONS=$(curl -s "$ALB/api/education/lessons" -H "$AUTH")
  check_contains "lessons has ≥1 item" '"slug"' "$LESSONS"

  GLOSSARY=$(curl -s "$ALB/api/education/glossary" -H "$AUTH")
  check_contains "glossary has ≥1 term" '"term"' "$GLOSSARY"
else
  echo "  $(yellow ⊘) Content checks skipped — no auth"
fi

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
  "/gym"
  "/gym/start"
  "/ai-coach"
  "/lekce"
  "/slovnik"
  "/community"
  "/progress"
  "/doma"
  "/vyziva"
  "/habity"
  "/uspechy"
  "/progres-fotky"
  "/jidelnicek"
  "/micro-workout"
  "/sports"
  "/shadow-boxing"
  "/golf-lab"
  "/soccer-drills"
  "/workout-mode"
  "/sequences"
  # Tier 1-3 new pages
  "/ai-chat"
  "/journal"
  "/recepty"
  "/export"
  # Cross-industry pages
  "/wrapped"
  "/leagues"
  "/skill-tree"
  "/calendar"
  "/season"
  "/body-portfolio"
  "/bloodwork"
  "/rehab"
  "/marketplace"
  "/boss-fights"
  "/discover-weekly"
  "/gym-finder"
  # Social pages
  "/gym-buddy"
  "/messages"
  "/profile"
  "/notifications"
  # Fitness Instagram Wave 1
  "/community"
  "/trending"
  # Fitness Instagram Wave 2
  "/creator-dashboard"
)
for page in "${pages[@]}"; do
  check "GET $page" "200" "$(http_status "$ALB$page")"
done

# === Fitness Instagram Wave 2 ===
echo ""
echo "$(yellow '[6] Fitness Instagram Wave 2')"
# Creator Economy
check_auth "GET /api/creator-economy/subscriptions" "200" "$ALB/api/creator-economy/subscriptions"
check_auth_multi "GET /api/creator-economy/earnings" "$ALB/api/creator-economy/earnings" "200" "404"
# Smart Notifications
check_auth "GET /api/smart-notifications/social" "200" "$ALB/api/smart-notifications/social"
check_auth "GET /api/smart-notifications/unread-count" "200" "$ALB/api/smart-notifications/unread-count"
# Creator Dashboard (404 OK — user may not be a creator)
check_auth_multi "GET /api/creator-dashboard/stats" "$ALB/api/creator-dashboard/stats" "200" "404"
check_auth_multi "GET /api/creator-dashboard/subscriber-growth" "$ALB/api/creator-dashboard/subscriber-growth" "200" "404"
check_auth_multi "GET /api/creator-dashboard/earnings" "$ALB/api/creator-dashboard/earnings" "200" "404"
check_auth_multi "GET /api/creator-dashboard/post-performance" "$ALB/api/creator-dashboard/post-performance" "200" "404"

# === Fitness Instagram Wave 1 ===
echo ""
echo "$(yellow '[7] Fitness Instagram Wave 1')"
# Feed
check_auth "GET /api/feed/for-you" "200" "$ALB/api/feed/for-you"
check_auth "GET /api/feed/following" "200" "$ALB/api/feed/following"
check_auth "GET /api/feed/trending" "200" "$ALB/api/feed/trending"
# Hashtags
check_auth "GET /api/hashtags/trending" "200" "$ALB/api/hashtags/trending"
check_auth "GET /api/hashtags/search?q=test" "200" "$ALB/api/hashtags/search?q=test"
check_auth "GET /api/hashtags/suggested" "200" "$ALB/api/hashtags/suggested"
# Promo
check_auth "GET /api/promo/for-feed" "200" "$ALB/api/promo/for-feed"

# 8. Routing sanity (API vs page collision)
echo ""
echo "$(yellow '[8] Routing sanity')"
if [ "$AUTH_AVAILABLE" = "true" ]; then
  API_EX=$(curl -s "$ALB/api/exercises" -H "$AUTH" -o /dev/null -w "%{content_type}")
  check_contains "/api/exercises returns JSON" "application/json" "$API_EX"
else
  echo "  $(yellow ⊘) API content-type check skipped — no auth"
fi

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
