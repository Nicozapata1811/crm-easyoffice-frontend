/**
 * API location.
 *
 * VITE_API_BASE_URL is inlined at build time, so it must never hold a secret.
 * A base URL is not one.
 */

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Join the configured base URL with an API path. */
export function apiUrl(path: string): string {
  const base = BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
