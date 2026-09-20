/**
 * Thin fetch wrapper for the Django REST API.
 *
 * Authentication is session based: the browser holds an httpOnly session
 * cookie and every request is sent with credentials. Unsafe methods carry the
 * CSRF token in X-CSRFToken, following Django's convention.
 */

import { apiUrl } from "./config";
import { clearCsrfToken, getCsrfToken } from "./csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Perform an API request and parse the JSON response.
 *
 * A 403 on an unsafe method is retried once with a fresh CSRF token, because
 * the cached one expires with the session.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const response = await send(path, method, options);
  if (response.status === 403 && !SAFE_METHODS.has(method)) {
    clearCsrfToken();
    return parse<T>(await send(path, method, options));
  }
  return parse<T>(response);
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", signal }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

async function send(
  path: string,
  method: string,
  options: RequestOptions,
): Promise<Response> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (!SAFE_METHODS.has(method)) {
    headers["X-CSRFToken"] = await getCsrfToken();
  }

  return fetch(apiUrl(path), {
    method,
    headers,
    credentials: "include",
    signal: options.signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload: unknown = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, payload, errorMessage(response.status));
  }
  return payload as T;
}

function errorMessage(status: number): string {
  if (status === 401 || status === 403) return "Tu sesión no está activa.";
  if (status === 404) return "No encontramos lo que buscabas.";
  if (status >= 500) return "El servidor tuvo un problema. Intenta más tarde.";
  return "No pudimos completar la solicitud.";
}
