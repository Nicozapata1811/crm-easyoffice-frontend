import type { FiltrosAlertas } from "../../../api/contratos";

export const GESTIONADA = "gestionada";
export const PENDIENTE = "pendiente";

/**
 * The filters a URL holds; the query is the only place they live. A URL without
 * a state shows the pending alerts, which is what the screen is for.
 */
export function filtrosDesdeUrl(params: URLSearchParams): FiltrosAlertas {
  const filtros: FiltrosAlertas = {
    estado: params.get("estado")?.trim() || PENDIENTE,
    pagina: Math.max(1, Number(params.get("pagina")) || 1),
  };
  if (params.get("mias") === "true") filtros.mias = "true";
  const umbral = params.get("umbral")?.trim();
  if (umbral) filtros.umbral = umbral;
  return filtros;
}

export const hayFiltros = ({ estado, mias, umbral }: FiltrosAlertas) =>
  estado !== PENDIENTE || Boolean(mias) || Boolean(umbral);
