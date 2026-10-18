import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useLogout, useSesion } from "../features/auth/useSesion";
import type { TipoUsuario } from "../types/sesion";

export const RUTA_INGRESO = "/backoffice/ingresar";
export const RUTA_INGRESO_CLIENTE = "/ingresar";

const RUTA_POR_TIPO: Record<TipoUsuario, string> = {
  staff: RUTA_INGRESO,
  cliente: RUTA_INGRESO_CLIENTE,
};

const OTRA_SESION: Record<TipoUsuario, { mensaje: string; accion: string }> = {
  staff: {
    mensaje: "Esta sección es para el personal de Easy Office y tienes abierta una sesión de cliente. Al continuar se cerrará.",
    accion: "Ingresar como personal",
  },
  cliente: {
    mensaje: "Esta sección es para clientes y tienes abierta una sesión del personal. Al continuar se cerrará.",
    accion: "Ingresar como cliente",
  },
};

interface RequireAuthProps {
  children: ReactNode;
  tipo?: TipoUsuario;
}

export function RequireAuth({ children, tipo = "staff" }: RequireAuthProps) {
  const { data: usuario, isPending, isError } = useSesion();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const ingreso = `${RUTA_POR_TIPO[tipo]}?siguiente=${encodeURIComponent(`${pathname}${search}`)}`;

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
    return <Navigate to={ingreso} replace />;
  }
  if (usuario.tipo !== tipo) {
    return (
      <Alert
        severity="warning"
        sx={{ m: 4 }}
        action={
          <Button
            color="inherit"
            size="small"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, { onSettled: () => navigate(ingreso, { replace: true }) })
            }
          >
            {OTRA_SESION[tipo].accion}
          </Button>
        }
      >
        {OTRA_SESION[tipo].mensaje}
      </Alert>
    );
  }
  return children;
}

export function RequireCliente({ children }: { children: ReactNode }) {
  return <RequireAuth tipo="cliente">{children}</RequireAuth>;
}
