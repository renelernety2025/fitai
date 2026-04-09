/**
 * Scenario A: Dashboard rush
 * Simulates burst traffic when many users simultaneously open the app.
 * Ramps up to 500 concurrent users, random dashboard-adjacent endpoints.
 *
 * Success criteria:
 *   - p95 < 2s
 *   - error rate < 1%
 *   - RDS CPU stays < 70% (verify manually in CloudWatch)
 *
 * Usage:
 *   k6 run load-tests/02-dashboard-rush.js
 */

import { sleep } from 'k6';
import { login, get, weightedPick } from './lib.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp to 50 users
    { duration: '2m', target: 200 },  // ramp to 200 users
    { duration: '2m', target: 500 },  // peak 500 users
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.98'],
  },
};

export function setup() {
  return login();
}

// Weighted mix reflecting real dashboard visit pattern
const DASHBOARD_ENDPOINTS = [
  { value: '/api/sessions/my/stats', weight: 10 },              // stats
  { value: '/api/exercises', weight: 8 },                       // cached, lightweight
  { value: '/api/nutrition/today', weight: 6 },                 // food log
  { value: '/api/habits/today', weight: 6 },                    // check-in status
  { value: '/api/gym-sessions/my', weight: 5 },                 // history
  { value: '/api/education/lessons/of-the-week', weight: 3 },   // cached
  { value: '/api/achievements', weight: 3 },                    // cached
  { value: '/api/gym-sessions/my/weekly-volume', weight: 2 },   // heavier query
];

export default function (auth) {
  const path = weightedPick(DASHBOARD_ENDPOINTS);
  get(path, auth, path);
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5s between requests
}
