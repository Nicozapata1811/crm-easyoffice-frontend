import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, useLocation } from "react-router-dom";

import { useSesion } from "../features/auth/useSesion";

export const RUTA_INGRESO = "/backoffice/ingresar";

export function RequireAuth({ children }: { children: ReactNode }) {
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
    return <Navigate to={`${RUTA_INGRESO}?siguiente=${siguiente}`} replace />;
  }
  return children;
}
