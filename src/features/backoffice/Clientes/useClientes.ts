import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarCliente,
  crearCliente,
  listarClientes,
  obtenerCliente,
} from "../../../api/clientes";
import type {
  CambiosCliente,
  FichaCliente,
  FiltrosClientes,
  NuevoCliente,
} from "../../../types/cliente";

const CLIENTES_KEY = ["clientes"] as const;

export function useClientes(filtros: FiltrosClientes) {
  return useQuery({
    queryKey: [...CLIENTES_KEY, "lista", filtros],
    queryFn: ({ signal }) => listarClientes(filtros, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: [...CLIENTES_KEY, id],
    queryFn: ({ signal }) => obtenerCliente(id, signal),
    enabled: Number.isInteger(id),
  });
}

export function useCrearCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: NuevoCliente) => crearCliente(datos),
    onSuccess: (ficha) => guardarFicha(queryClient, ficha),
  });
}

export function useActualizarCliente(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cambios: CambiosCliente) => actualizarCliente(id, cambios),
    onSuccess: (ficha) => guardarFicha(queryClient, ficha),
  });
}

function guardarFicha(queryClient: ReturnType<typeof useQueryClient>, ficha: FichaCliente) {
  queryClient.setQueryData([...CLIENTES_KEY, ficha.id], ficha);
  return queryClient.invalidateQueries({ queryKey: [...CLIENTES_KEY, "lista"] });
}
