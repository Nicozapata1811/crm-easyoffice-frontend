import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, useLocation } from "react-router-dom";

import { useSesion } from "../features/auth/useSesion";
import type { TipoUsuario } from "../types/sesion";

export const RUTA_INGRESO = "/backoffice/ingresar";
export const RUTA_INGRESO_CLIENTE = "/ingresar";

const RUTA_POR_TIPO: Record<TipoUsuario, string> = {
  staff: RUTA_INGRESO,
  cliente: RUTA_INGRESO_CLIENTE,
};

const OTRO_TIPO: Record<TipoUsuario, string> = {
  staff: "Esta sección es para el personal de Easy Office.",
  cliente: "Esta sección es para clientes. Cierra la sesión del personal para continuar.",
};

interface RequireAuthProps {
  children: ReactNode;
  tipo?: TipoUsuario;
}

export function RequireAuth({ children, tipo = "staff" }: RequireAuthProps) {
  const { data: usuario, isPending, isError } = useSesion();
  const { pathname, search } = useLocation();

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Verificando sesión" />
      </Box>
    );
  }
  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        No pudimos verificar tu sesión. Recarga la página o intenta más tarde.
      </Alert>
    );
  }
  if (!usuario) {
    const siguiente = encodeURIComponent(`${pathname}${search}`);
    return <Navigate to={`${RUTA_POR_TIPO[tipo]}?siguiente=${siguiente}`} replace />;
  }
  if (usuario.tipo !== tipo) {
    return (
      <Alert severity="warning" sx={{ m: 4 }}>
        {OTRO_TIPO[tipo]}
      </Alert>
    );
  }
  return children;
}

export function RequireCliente({ children }: { children: ReactNode }) {
  return <RequireAuth tipo="cliente">{children}</RequireAuth>;
}
