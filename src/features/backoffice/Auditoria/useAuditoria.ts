import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarAuditoria, obtenerHistorial, type FiltrosAuditoria } from "../../../api/auditoria";
import { ApiError } from "../../../api/client";
import { useRevisarSesion } from "../../auth/useSesion";

// Asking again cannot change a refused or invalid request.
const reintentar = (fallas: number, error: Error) =>
  fallas < 1 && !(error instanceof ApiError && error.status < 500);

export function useRegistroAuditoria(filtros: FiltrosAuditoria) {
  return useQuery({
    queryKey: ["auditoria", "lista", filtros],
    queryFn: ({ signal }) => listarAuditoria(filtros, signal),
    placeholderData: keepPreviousData,
    retry: reintentar,
  });
}

export function useHistorialRegistro(entidad: string, registroId: number, pagina: number) {
  return useQuery({
    queryKey: ["auditoria", "historial", entidad, registroId, pagina],
    queryFn: ({ signal }) => obtenerHistorial(entidad, registroId, pagina, signal),
    placeholderData: keepPreviousData,
    retry: reintentar,
  });
}

/**
 * Whether the API refused access. It also reads the session again, because a
 * 403 is what an ended session gets too: RequireAuth then sends them to log in.
 */
export function useSinAcceso(error: unknown): boolean {
  const revisarSesion = useRevisarSesion();
  const sinAcceso = error instanceof ApiError && error.isUnauthenticated;
  useEffect(() => {
    if (sinAcceso) void revisarSesion();
  }, [sinAcceso, revisarSesion]);
  return sinAcceso;
}
