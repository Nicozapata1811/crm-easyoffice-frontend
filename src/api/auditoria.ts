import type { EntradaAuditoria } from "../types/auditoria";
import type { Pagina } from "../types/cliente";
import { api } from "./client";

export const TAMANO_PAGINA_AUDITORIA = 25;

/** Kept as text: the API validates them, and its errors are what the screen shows. */
export interface FiltrosAuditoria {
  entidad?: string;
  registro_id?: string;
  usuario?: string;
  accion?: string;
  origen?: string;
  desde?: string;
  hasta?: string;
  pagina?: number;
}

export function listarAuditoria(
  { pagina, ...filtros }: FiltrosAuditoria,
  signal?: AbortSignal,
): Promise<Pagina<EntradaAuditoria>> {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor);
  }
  if (pagina && pagina > 1) params.set("page", String(pagina));
  const query = params.toString();
  return api.get(`/auditoria/${query ? `?${query}` : ""}`, signal);
}

export function obtenerHistorial(
  entidad: string,
  registroId: number,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<EntradaAuditoria>> {
  const params = new URLSearchParams({ entidad, registro_id: String(registroId) });
  if (pagina > 1) params.set("page", String(pagina));
  return api.get(`/auditoria/historial/?${params.toString()}`, signal);
}
