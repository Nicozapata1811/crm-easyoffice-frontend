import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  gestionarAlerta,
  listarAlertas,
  obtenerResumenAlertas,
  type FiltrosAlertas,
} from "../../../api/contratos";
import { reintentar } from "../Auditoria/useAuditoria";

export const ALERTAS_KEY = ["alertas"] as const;

export function useAlertas(filtros: FiltrosAlertas) {
  return useQuery({
    queryKey: [...ALERTAS_KEY, "lista", filtros],
    queryFn: ({ signal }) => listarAlertas(filtros, signal),
    placeholderData: keepPreviousData,
    retry: reintentar,
  });
}

/**
 * The pending count and the thresholds to filter by. It refreshes when the
 * window regains focus and after handling an alert, never on a timer: polling
 * would keep an idle session alive past its inactivity timeout.
 */
export function useResumenAlertas(habilitado = true) {
  return useQuery({
    queryKey: [...ALERTAS_KEY, "resumen"],
    queryFn: ({ signal }) => obtenerResumenAlertas(signal),
    enabled: habilitado,
    refetchOnWindowFocus: true,
    retry: reintentar,
  });
}

export function useGestionarAlerta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nota }: { id: number; nota: string }) => gestionarAlerta(id, nota),
    // A 409 means someone else handled it, so the list is stale either way.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ALERTAS_KEY }),
  });
}
