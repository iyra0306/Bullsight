const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '') || '/api';
export const API_REQUEST_TIMEOUT_MS = 10000;

export function buildApiUrl(
  endpoint: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = `${API_BASE_URL}${cleanEndpoint}`;

  if (!query) return base;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
