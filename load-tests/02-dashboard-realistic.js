/**
 * Scenario A (realistic version): Dashboard traffic within throttle limits
 *
 * Why not 500 VUs from single IP?
 * Throttle is 200 req/min per IP. From a single k6 machine, 500 VUs all share
 * one source IP → ~750 req/s saturates the throttler → 65% 429 responses.
 * In production, 500 real users = 500 IPs → no throttle collision.
 *
 * This scenario stays WITHIN single-IP throttle (~100 VUs × ~1 req/s = ~100
 * req/min) so we can measure true infra performance, not rate limiting.
 *
 * Usage:
 *   k6 run load-tests/02-dashboard-realistic.js
 */

import { sleep } from 'k6';
import { login, get, weightedPick } from './lib.js';

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '1m', target: 100 },  // peak at 100 VUs
    { duration: '2m', target: 100 },  // sustained
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.98'],
  },
};

export function setup() {
  return login();
}

const DASHBOARD_ENDPOINTS = [
  { value: '/api/sessions/my/stats', weight: 10 },
  { value: '/api/exercises', weight: 8 },
  { value: '/api/nutrition/today', weight: 6 },
  { value: '/api/habits/today', weight: 6 },
  { value: '/api/gym-sessions/my', weight: 5 },
  { value: '/api/education/lessons/of-the-week', weight: 3 },
  { value: '/api/achievements', weight: 3 },
  { value: '/api/gym-sessions/my/weekly-volume', weight: 2 },
];

export default function (auth) {
  const path = weightedPick(DASHBOARD_ENDPOINTS);
  get(path, auth, path);
  sleep(Math.random() * 4 + 2); // 2-6s realistic think time
}
