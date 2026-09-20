/**
 * Route tree for both audiences.
 *
 * ASSUMPTION: pending validation with Easy Office. Routes distinguish only
 * whether a session exists and which audience a screen belongs to. The roles
 * and what each one may see are not defined yet, so no permission check is
 * made beyond that.
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
import { DetalleTramite } from "../features/backoffice/DetalleTramite/DetalleTramite";
import { PanelOperativo } from "../features/backoffice/PanelOperativo/PanelOperativo";
import { TiposTramite } from "../features/backoffice/TiposTramite/TiposTramite";
import { NoEncontrado } from "./NoEncontrado";

export const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { path: "/", element: <CatalogoServicios /> },
      { path: "/ingresar", element: <Ingresar /> },
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
    ],
  },
  {
    path: "/backoffice",
    element: <BackofficeLayout />,
    children: [
      { index: true, element: <PanelOperativo /> },
      { path: "tramites/:tramiteId", element: <DetalleTramite /> },
      { path: "tipos-tramite", element: <TiposTramite /> },
    ],
  },
  { path: "*", element: <NoEncontrado /> },
]);
