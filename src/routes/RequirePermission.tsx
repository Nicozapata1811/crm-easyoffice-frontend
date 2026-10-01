import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { tienePermiso, useSesion } from "../features/auth/useSesion";

interface RequirePermissionProps {
  permiso: string;
  children: ReactNode;
}

/** Must sit under RequireAuth, which has already loaded the session. */
export function RequirePermission({ permiso, children }: RequirePermissionProps) {
  const { data: usuario } = useSesion();

  if (!tienePermiso(usuario, permiso)) {
    return (
      <Paper sx={{ p: 4, maxWidth: 560 }}>
        <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
          Sin acceso
        </Typography>
        <Typography color="text.secondary">
          Tu perfil no tiene acceso a esta sección. Si lo necesitas, pídeselo a un
          administrador.
        </Typography>
      </Paper>
    );
  }
  return children;
}
