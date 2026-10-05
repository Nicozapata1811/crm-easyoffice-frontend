/**
 * Route tree for both audiences.
 *
 * The backoffice requires a staff session and checks permissions from
 * GET /api/auth/me/. Client portal routes are not guarded yet: client
 * accounts (HU-03) are not defined.
 */

import { createBrowserRouter } from "react-router-dom";

import { BackofficeLayout } from "../layouts/BackofficeLayout";
import { PortalLayout } from "../layouts/PortalLayout";
import { Ingresar } from "../features/auth/Ingresar/Ingresar";
import { CatalogoServicios } from "../features/portal/CatalogoServicios/CatalogoServicios";
import { ConfirmacionPago } from "../features/portal/ConfirmacionPago/ConfirmacionPago";
import { EstadoTramite } from "../features/portal/EstadoTramite/EstadoTramite";
import { FormularioDomicilio } from "../features/portal/FormularioDomicilio/FormularioDomicilio";
import { MisTramites } from "../features/portal/MisTramites/MisTramites";
import { PrevisualizacionDocumento } from "../features/portal/PrevisualizacionDocumento/PrevisualizacionDocumento";
import { EntradaServicio } from "../features/portal/EntradaServicio/EntradaServicio";
import { DetalleTramite } from "../features/backoffice/DetalleTramite/DetalleTramite";
import { PanelOperativo } from "../features/backoffice/PanelOperativo/PanelOperativo";
import { TiposTramite } from "../features/backoffice/TiposTramite/TiposTramite";
import { PERMISOS } from "../features/auth/permisos";
import { PlaceholderScreen } from "../components/PlaceholderScreen";
import { NoEncontrado } from "./NoEncontrado";
import { RequireAuth, RUTA_INGRESO } from "./RequireAuth";
import { RequirePermission } from "./RequirePermission";

export const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { path: "/", element: <CatalogoServicios /> },
      {
        path: "/ingresar",
        element: (
          <PlaceholderScreen
            titulo="Ingresar"
            descripcion="Ingreso de clientes al portal. Pendiente de definir (HU-03)."
          />
        ),
      },
      {
        path: "/tramites/domicilio-tributario/nuevo",
        element: <FormularioDomicilio />,
      },
      { path: "/tramites/:tramiteId", element: <EstadoTramite /> },
      {
        path: "/tramites/:tramiteId/documento",
        element: <PrevisualizacionDocumento />,
      },
      { path: "/tramites/:tramiteId/pago", element: <ConfirmacionPago /> },
      { path: "/mis-tramites", element: <MisTramites /> },
      { path: "/:servicioSlug", element: <EntradaServicio /> },
    ],
  },
  { path: RUTA_INGRESO, element: <Ingresar /> },
  {
    path: "/backoffice",
    element: (
      <RequireAuth>
        <BackofficeLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        // ASSUMPTION: pending validation with Easy Office. Whether an Ejecutivo
        // sees the dashboard is undefined; only roles granted the permission do.
        element: (
          <RequirePermission permiso={PERMISOS.verPanelOperativo}>
            <PanelOperativo />
          </RequirePermission>
        ),
      },
      { path: "tramites/:tramiteId", element: <DetalleTramite /> },
      { path: "tipos-tramite", element: <TiposTramite /> },
    ],
  },
  { path: "*", element: <NoEncontrado /> },
]);
