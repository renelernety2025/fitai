/**
 * Scenario D: Mixed realistic traffic
 * Simulates real-world usage distribution with sustained load.
 * - 60% browsing (dashboard, exercises, lessons)
 * - 20% logging (food log, check-in)
 * - 15% gym sessions
 * - 5% AI generation
 *
 * Ramps to 200 VUs sustained for 5 min to test steady-state capacity.
 *
 * Usage:
 *   k6 run load-tests/04-mixed-realistic.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, login, get, weightedPick } from './lib.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },  // sustained load
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'http_req_duration{category:browse}': ['p(95)<2000'],
    'http_req_duration{category:log}': ['p(95)<3000'],
    'http_req_duration{category:gym}': ['p(95)<2500'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.97'],
  },
};

export function setup() {
  return login();
}

const BROWSE = [
  '/api/sessions/my/stats',
  '/api/exercises',
  '/api/education/lessons',
  '/api/education/glossary',
  '/api/achievements',
  '/api/nutrition/today',
  '/api/habits/today',
];
const LOG_PATHS = ['/api/nutrition/today', '/api/habits/today'];
const GYM = ['/api/gym-sessions/my', '/api/gym-sessions/my/weekly-volume'];
const AI = ['/api/ai-insights/recovery-tips', '/api/ai-insights/weekly-review'];

export default function (auth) {
  const action = weightedPick([
    { value: 'browse', weight: 60 },
    { value: 'log', weight: 20 },
    { value: 'gym', weight: 15 },
    { value: 'ai', weight: 5 },
  ]);

  let path;
  switch (action) {
    case 'browse':
      path = BROWSE[Math.floor(Math.random() * BROWSE.length)];
      break;
    case 'log':
      path = LOG_PATHS[Math.floor(Math.random() * LOG_PATHS.length)];
      break;
    case 'gym':
      path = GYM[Math.floor(Math.random() * GYM.length)];
      break;
    case 'ai':
      path = AI[Math.floor(Math.random() * AI.length)];
      break;
  }

  const res = http.get(`${BASE_URL}${path}`, {
    headers: auth.headers,
    tags: { category: action, name: path },
  });
  check(res, {
    [`${action} ${path} status 200 or 429`]: (r) => r.status === 200 || r.status === 429,
  });
  sleep(Math.random() * 3 + 1); // 1-4s think time
}
