/** Shell for the client portal: self-service for entrepreneurs. */

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Outlet, useLocation } from "react-router-dom";

import { AppHeader } from "../components/AppHeader";
import { FolioNav } from "../components/FolioNav";
import { CLIENTE_DEMO } from "../features/portal/datosDemo";

/**
 * ASSUMPTION: pending validation with Easy Office. Which step a route belongs
 * to follows the prototype's five-step flow, not a validated state machine.
 */
const PASO_POR_RUTA: { patron: RegExp; paso: number }[] = [
  { patron: /^\/tramites\/[^/]+\/nuevo$/, paso: 2 },
  { patron: /^\/tramites\/[^/]+\/documento$/, paso: 3 },
  { patron: /^\/tramites\/[^/]+\/pago$/, paso: 4 },
  { patron: /^\/tramites\/[^/]+$/, paso: 5 },
];

export function PortalLayout() {
  const { pathname } = useLocation();
  const paso = PASO_POR_RUTA.find(({ patron }) => patron.test(pathname))?.paso;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader
        clienteNombre={CLIENTE_DEMO.nombre}
        iniciales={CLIENTE_DEMO.iniciales}
      />
      {paso !== undefined && <FolioNav pasoActual={paso} />}
      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 5, px: { xs: 2, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
