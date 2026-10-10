import type { UsuarioSesion } from "../types/sesion";
import { api } from "./client";
import { clearCsrfToken } from "./csrf";

export interface DatosRegistro {
  tipo: "persona" | "empresa";
  rut: string;
  email: string;
  password: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  razon_social?: string;
}

export async function registrar(datos: DatosRegistro): Promise<UsuarioSesion> {
  const usuario = await api.post<UsuarioSesion>("/portal/registro/", datos);
  // Django rotates the CSRF token when the session starts.
  clearCsrfToken();
  return usuario;
}
