import type { IndicadoresPanel, Periodo } from "../types/panel";
import { api, type Descarga } from "./client";

const consulta = ({ desde, hasta }: Periodo) => new URLSearchParams({ desde, hasta }).toString();

export function obtenerIndicadores(
  periodo: Periodo,
  signal?: AbortSignal,
): Promise<IndicadoresPanel> {
  return api.get(`/panel/indicadores/?${consulta(periodo)}`, signal);
}

export function descargarIndicadores(periodo: Periodo): Promise<Descarga> {
  return api.descargar(`/panel/indicadores/exportar/?${consulta(periodo)}`);
}
