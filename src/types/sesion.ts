/** Session user returned by GET /api/auth/me/ and POST /api/auth/login/. */
export interface UsuarioSesion {
  id: number;
  email: string;
  name: string;
  rol: string | null;
  permisos: string[];
}
