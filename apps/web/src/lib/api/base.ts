const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_URL = `${API_BASE}/api`;

const REQUEST_TIMEOUT_MS = 20000;

/** Typed API error — callers can branch on status instead of string-matching. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fitai_token')
      : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isGet = !options?.method || options.method === 'GET';
  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    // One retry for idempotent GETs on network failure / timeout.
    if (!isGet) throw err;
    res = await fetchWithTimeout(`${API_URL}${path}`, { ...options, headers });
  }

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('fitai_token');
    if (
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register') &&
      window.location.pathname !== '/'
    ) {
      window.location.href = '/login';
    }
    throw new ApiError('Session expired', 401);
  }

  if (!res.ok) {
    const body: { message?: string } = await res.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed: ${res.status}`, res.status, body);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}
