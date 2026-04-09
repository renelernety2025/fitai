/**
 * Smoke test — minimal load, just verify endpoints are reachable and fast.
 * Run this FIRST before any bigger scenario to catch basic issues.
 *
 * Usage:
 *   k6 run load-tests/01-smoke.js
 */

import { sleep } from 'k6';
import { login, get } from './lib.js';

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export function setup() {
  return login();
}

export default function (auth) {
  get('/health', auth, 'health');
  get('/api/exercises', auth, 'exercises');
  get('/api/sessions/my/stats', auth, 'sessions-stats');
  get('/api/nutrition/today', auth, 'nutrition-today');
  get('/api/habits/today', auth, 'habits-today');
  sleep(1);
}
