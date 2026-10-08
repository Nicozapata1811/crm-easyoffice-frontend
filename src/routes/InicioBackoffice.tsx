import { Navigate } from "react-router-dom";

import { PanelOperativo } from "../features/backoffice/PanelOperativo/PanelOperativo";
import { PERMISOS } from "../features/auth/permisos";
import { tienePermiso, useSesion } from "../features/auth/useSesion";
import { RequirePermission } from "./RequirePermission";

/** The dashboard, or the client list for staff who cannot see the dashboard. */
export function InicioBackoffice() {
  const { data: usuario } = useSesion();

  if (
    !tienePermiso(usuario, PERMISOS.verPanelOperativo) &&
    tienePermiso(usuario, PERMISOS.verClientes)
  ) {
    return <Navigate to="clientes" replace />;
  }
  return (
    <RequirePermission permiso={PERMISOS.verPanelOperativo}>
      <PanelOperativo />
    </RequirePermission>
  );
}
