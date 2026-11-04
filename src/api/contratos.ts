import type { Pagina } from "../types/cliente";
import type { AlertaVencimiento, Contrato, Ejecutivo, ResumenAlertas } from "../types/contratos";
import { api } from "./client";

export const TAMANO_PAGINA_CONTRATOS = 25;

/** Kept as text: the API validates them, and its errors are what the screen shows. */
export interface FiltrosAlertas {
  estado?: string;
  mias?: string;
  umbral?: string;
  pagina?: number;
}

export function listarContratosDeCliente(
  clienteId: number,
  pagina: number,
  signal?: AbortSignal,
): Promise<Pagina<Contrato>> {
  const params = new URLSearchParams({ cliente: String(clienteId) });
  if (pagina > 1) params.set("page", String(pagina));
  return api.get(`/contratos/?${params.toString()}`, signal);
}

export function listarEjecutivos(signal?: AbortSignal): Promise<Ejecutivo[]> {
  return api.get("/contratos/ejecutivos/", signal);
}

export function asignarResponsable(contratoId: number, ejecutivo: number): Promise<Contrato> {
  return api.post(`/contratos/${contratoId}/responsable/`, { ejecutivo });
}

export function listarAlertas(
  { pagina, ...filtros }: FiltrosAlertas,
  signal?: AbortSignal,
): Promise<Pagina<AlertaVencimiento>> {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor);
  }
  if (pagina && pagina > 1) params.set("page", String(pagina));
  return api.get(`/alertas-vencimiento/?${params.toString()}`, signal);
}

export function obtenerResumenAlertas(signal?: AbortSignal): Promise<ResumenAlertas> {
  return api.get("/alertas-vencimiento/resumen/", signal);
}

export function gestionarAlerta(id: number, nota: string): Promise<AlertaVencimiento> {
  return api.post(`/alertas-vencimiento/${id}/gestionar/`, { nota });
}
