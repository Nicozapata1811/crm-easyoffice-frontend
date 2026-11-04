import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  asignarResponsable,
  listarContratosDeCliente,
  listarEjecutivos,
} from "../../../api/contratos";
import { ALERTAS_KEY } from "../Alertas/useAlertas";
import { reintentar } from "../Auditoria/useAuditoria";

const CONTRATOS_KEY = ["contratos"] as const;

export function useContratosDeCliente(clienteId: number, pagina: number) {
  return useQuery({
    queryKey: [...CONTRATOS_KEY, "cliente", clienteId, pagina],
    queryFn: ({ signal }) => listarContratosDeCliente(clienteId, pagina, signal),
    placeholderData: keepPreviousData,
    retry: reintentar,
  });
}

export function useEjecutivos() {
  return useQuery({
    queryKey: [...CONTRATOS_KEY, "ejecutivos"],
    queryFn: ({ signal }) => listarEjecutivos(signal),
    retry: reintentar,
  });
}

export function useAsignarResponsable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contratoId, ejecutivo }: { contratoId: number; ejecutivo: number }) =>
      asignarResponsable(contratoId, ejecutivo),
    // Who sees a contract's alerts follows its responsible.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: CONTRATOS_KEY }),
        queryClient.invalidateQueries({ queryKey: ALERTAS_KEY }),
      ]),
  });
}
