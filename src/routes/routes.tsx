/**
 * Route tree for both audiences.
 *
 * The backoffice requires a staff session and checks permissions from
 * GET /api/auth/me/. In the portal, paying requires a client session (HU-03).
 */

import { createBrowserRouter } from "react-router-dom";

import { BackofficeLayout } from "../layouts/BackofficeLayout";
import { PortalLayout } from "../layouts/PortalLayout";
import { Ingresar } from "../features/auth/Ingresar/Ingresar";
import { IngresoCliente } from "../features/auth/IngresoCliente/IngresoCliente";
import { Registro } from "../features/auth/Registro/Registro";
import { CatalogoServicios } from "../features/portal/CatalogoServicios/CatalogoServicios";
import { ConfirmacionPago } from "../features/portal/ConfirmacionPago/ConfirmacionPago";
import { EstadoTramite } from "../features/portal/EstadoTramite/EstadoTramite";
import { FormularioDomicilio } from "../features/portal/FormularioDomicilio/FormularioDomicilio";
import { MisCompras } from "../features/portal/MisCompras/MisCompras";
import { MisTramites } from "../features/portal/MisTramites/MisTramites";
import { PrevisualizacionDocumento } from "../features/portal/PrevisualizacionDocumento/PrevisualizacionDocumento";
import { ResultadoPago } from "../features/portal/ResultadoPago/ResultadoPago";
import { FichaCliente } from "../features/backoffice/Clientes/FichaCliente";
import { FormularioCliente } from "../features/backoffice/Clientes/FormularioCliente";
import { ListaClientes } from "../features/backoffice/Clientes/ListaClientes";
import { DetalleTramite } from "../features/backoffice/DetalleTramite/DetalleTramite";
import { TiposTramite } from "../features/backoffice/TiposTramite/TiposTramite";
import { DetalleVenta } from "../features/backoffice/Ventas/DetalleVenta";
import { ListaVentas } from "../features/backoffice/Ventas/ListaVentas";
import { PERMISOS } from "../features/auth/permisos";
import { InicioBackoffice } from "./InicioBackoffice";
import { NoEncontrado } from "./NoEncontrado";
import { RequireAuth, RequireCliente, RUTA_INGRESO, RUTA_INGRESO_CLIENTE } from "./RequireAuth";
import { RequirePermission } from "./RequirePermission";

export const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { path: "/", element: <CatalogoServicios /> },
      { path: RUTA_INGRESO_CLIENTE, element: <IngresoCliente /> },
      { path: "/registro", element: <Registro /> },
      {
        path: "/tramites/domicilio-tributario/nuevo",
        element: <FormularioDomicilio />,
      },
      { path: "/tramites/:tramiteId", element: <EstadoTramite /> },
      {
        path: "/tramites/:tramiteId/documento",
        element: <PrevisualizacionDocumento />,
      },
      {
        path: "/tramites/:tramiteId/pago",
        element: (
          <RequireCliente>
            <ConfirmacionPago />
          </RequireCliente>
        ),
      },
      { path: "/mis-tramites", element: <MisTramites /> },
      {
        path: "/mis-compras",
        element: (
          <RequireCliente>
            <MisCompras />
          </RequireCliente>
        ),
      },
      {
        path: "/pagos/:ordenId/:resultado",
        element: (
          <RequireCliente>
            <ResultadoPago />
          </RequireCliente>
        ),
      },
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
      // ASSUMPTION: pending validation with Easy Office. Whether an Ejecutivo
      // sees the dashboard is undefined; only roles granted the permission do.
      { index: true, element: <InicioBackoffice /> },
      {
        path: "clientes",
        element: (
          <RequirePermission permiso={PERMISOS.verClientes}>
            <ListaClientes />
          </RequirePermission>
        ),
      },
      {
        path: "clientes/nuevo",
        element: (
          <RequirePermission permiso={PERMISOS.crearCliente}>
            <FormularioCliente />
          </RequirePermission>
        ),
      },
      {
        path: "clientes/:clienteId",
        element: (
          <RequirePermission permiso={PERMISOS.verClientes}>
            <FichaCliente />
          </RequirePermission>
        ),
      },
      {
        path: "clientes/:clienteId/editar",
        element: (
          <RequirePermission permiso={PERMISOS.editarCliente}>
            <FormularioCliente />
          </RequirePermission>
        ),
      },
      {
        path: "ventas",
        element: (
          <RequirePermission permiso={PERMISOS.verVentas}>
            <ListaVentas />
          </RequirePermission>
        ),
      },
      {
        path: "ventas/:ventaId",
        element: (
          <RequirePermission permiso={PERMISOS.verVentas}>
            <DetalleVenta />
          </RequirePermission>
        ),
      },
      { path: "tramites/:tramiteId", element: <DetalleTramite /> },
      { path: "tipos-tramite", element: <TiposTramite /> },
    ],
  },
  { path: "*", element: <NoEncontrado /> },
]);
