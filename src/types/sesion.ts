export type TipoUsuario = "cliente" | "staff";

export interface ClienteSesion {
  id: number;
  folio: string;
  nombre: string;
}

/** Session user returned by GET /api/auth/me/ and POST /api/auth/login/. */
export interface UsuarioSesion {
  id: number;
  email: string;
  name: string;
  tipo: TipoUsuario;
  cliente: ClienteSesion | null;
  rol: string | null;
  permisos: string[];
}
