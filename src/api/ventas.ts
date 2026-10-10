import type { Pagina } from "../types/cliente";
import type { EstadoVenta, VentaBackoffice } from "../types/ventas";
import { api } from "./client";

export interface FiltrosVentas {
  buscar?: string;
  estado?: EstadoVenta | "";
  pagina?: number;
}

export function listarVentasBackoffice(
  { buscar, estado, pagina }: FiltrosVentas,
  signal?: AbortSignal,
): Promise<Pagina<VentaBackoffice>> {
  const params = new URLSearchParams();
  if (buscar) params.set("buscar", buscar);
  if (estado) params.set("estado", estado);
  if (pagina && pagina > 1) params.set("page", String(pagina));
  const query = params.toString();
  return api.get(`/ventas/${query ? `?${query}` : ""}`, signal);
}

export function obtenerVentaBackoffice(id: number, signal?: AbortSignal): Promise<VentaBackoffice> {
  return api.get(`/ventas/${id}/`, signal);
}
