/**
 * Shared helpers for k6 load test scenarios.
 * All scenarios authenticate as demo@fitai.com and hit production.
 */

import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'https://fitai.bfevents.cz';
export const DEMO_EMAIL = __ENV.DEMO_EMAIL || 'demo@fitai.com';
export const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'demo1234';

/** Log in as demo user and return auth headers. Call once in setup(). */
export function login() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'login' } },
  );
  const ok = check(res, {
    'login status 201/200': (r) => r.status === 200 || r.status === 201,
    'has token': (r) => r.json('accessToken') !== undefined,
  });
  if (!ok) {
    throw new Error(`Login failed: ${res.status} ${res.body}`);
  }
  const token = res.json('accessToken');
  return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

/** Weighted random pick from array of {value, weight}. */
export function weightedPick(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

/** Standard GET helper that adds tag + basic check. */
export function get(path, auth, tagName) {
  const res = http.get(`${BASE_URL}${path}`, {
    headers: auth.headers,
    tags: { name: tagName || path },
  });
  check(res, {
    [`${tagName || path} status 200`]: (r) => r.status === 200,
    [`${tagName || path} < 2s`]: (r) => r.timings.duration < 2000,
  });
  return res;
}
