/**
 * Scenario C: AI endpoint burst
 * Tests rate limiting + caching of expensive Claude endpoints.
 *
 * Expected behavior:
 *   - First 5 requests per user to /daily-brief succeed (throttle: 5/hour)
 *   - Subsequent requests get 429 (throttle triggered)
 *   - Cached responses return fast (24h cache)
 *   - Claude is NOT called for cached responses (verify via CloudWatch FitAI/AI metric)
 *
 * Usage:
 *   k6 run load-tests/03-ai-burst.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, login } from './lib.js';

export const options = {
  vus: 20,
  duration: '2m',
  thresholds: {
    // AI endpoints can be slow (Claude call ~5-15s)
    'http_req_duration{endpoint:daily-brief}': ['p(95)<20000'],
    'http_req_duration{endpoint:recovery-tips}': ['p(95)<15000'],
    // 429 responses are expected — don't count as failures
    'http_req_failed{expected_response:true}': ['rate<0.02'],
  },
};

export function setup() {
  return login();
}

export default function (auth) {
  // Mix of AI endpoints to measure cache hit rate + throttle behavior
  const endpoints = [
    { path: '/api/ai-insights/daily-brief', tag: 'daily-brief' },
    { path: '/api/ai-insights/recovery-tips', tag: 'recovery-tips' },
    { path: '/api/ai-insights/weekly-review', tag: 'weekly-review' },
    { path: '/api/ai-insights/nutrition-tips', tag: 'nutrition-tips' },
  ];
  const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${ep.path}`, {
    headers: auth.headers,
    tags: { endpoint: ep.tag, name: ep.path },
  });
  check(res, {
    [`${ep.tag} status 200 or 429`]: (r) => r.status === 200 || r.status === 429,
  });
  sleep(1);
}
