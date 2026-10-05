import type { UsuarioSesion } from "../types/sesion";
import { ApiError, api } from "./client";
import { clearCsrfToken } from "./csrf";

export interface Credenciales {
  email: string;
  password: string;
}

export async function login(credenciales: Credenciales): Promise<UsuarioSesion> {
  const usuario = await api.post<UsuarioSesion>("/auth/login/", credenciales);
  // Django rotates the CSRF token when the session starts.
  clearCsrfToken();
  return usuario;
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>("/auth/logout/");
  } finally {
    clearCsrfToken();
  }
}

/** The signed-in user, or null when there is no active session. */
export async function getSesion(signal?: AbortSignal): Promise<UsuarioSesion | null> {
  try {
    return await api.get<UsuarioSesion>("/auth/me/", signal);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) return null;
    throw error;
  }
}
