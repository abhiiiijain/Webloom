const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/**
 * API prefix used by fetch().
 * - Local: `/api` (Vite proxies to the backend)
 * - Vercel: Render origin, with or without `/api`
 */
export const resolveApiBase = (value?: string) => {
  const trimmed = trimTrailingSlash(value?.trim() || "");
  if (!trimmed) {
    return "/api";
  }
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) {
    return `${trimmed}/api`;
  }
  return trimmed;
};

export const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE_URL);
