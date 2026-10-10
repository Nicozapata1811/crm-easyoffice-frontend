import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSesion, login, logout } from "../../api/auth";
import { registrar } from "../../api/portal";
import type { UsuarioSesion } from "../../types/sesion";

const SESION_KEY = ["sesion"] as const;

export function useSesion() {
  return useQuery({
    queryKey: SESION_KEY,
    queryFn: ({ signal }) => getSesion(signal),
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (usuario) => queryClient.setQueryData(SESION_KEY, usuario),
  });
}

export function useRegistro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registrar,
    onSuccess: (usuario) => queryClient.setQueryData(SESION_KEY, usuario),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(SESION_KEY, null);
    },
  });
}

export function tienePermiso(usuario: UsuarioSesion | null | undefined, permiso: string) {
  return usuario?.permisos.includes(permiso) ?? false;
}
