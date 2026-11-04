/** Shell for Easy Office staff. */

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, useNavigate } from "react-router-dom";

import { Marca } from "../components/Marca";
import { NavLinks } from "../components/NavLinks";
import { PERMISOS } from "../features/auth/permisos";
import { tienePermiso, useLogout, useSesion } from "../features/auth/useSesion";
import { useResumenAlertas } from "../features/backoffice/Alertas/useAlertas";
import { RUTA_INGRESO } from "../routes/RequireAuth";

const RUTA_ALERTAS = "/backoffice/alertas";

const LINKS: { to: string; label: string; end?: boolean; permiso?: string }[] = [
  { to: "/backoffice", label: "Panel", end: true, permiso: PERMISOS.verPanelOperativo },
  { to: "/backoffice/clientes", label: "Clientes", permiso: PERMISOS.verClientes },
  { to: RUTA_ALERTAS, label: "Alertas", permiso: PERMISOS.verAlertas },
  { to: "/backoffice/tramites", label: "Trámites", permiso: PERMISOS.verTramites },
  { to: "/backoffice/ventas", label: "Ventas", permiso: PERMISOS.verVentas },
  { to: "/backoffice/tipos-tramite", label: "Tipos de trámite" },
  { to: "/backoffice/auditoria", label: "Auditoría", permiso: PERMISOS.consultarAuditoria },
];

export function BackofficeLayout() {
  const { data: usuario } = useSesion();
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: resumenAlertas } = useResumenAlertas(tienePermiso(usuario, PERMISOS.verAlertas));
  const pendientes = resumenAlertas?.pendientes ?? 0;

  const links = LINKS.filter(({ permiso }) => !permiso || tienePermiso(usuario, permiso)).map((link) =>
    link.to === RUTA_ALERTAS && pendientes > 0
      ? { ...link, insignia: { cantidad: pendientes, que: "pendientes" } }
      : link,
  );

  const cerrarSesion = () =>
    logout.mutate(undefined, { onSettled: () => navigate(RUTA_INGRESO, { replace: true }) });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="default">
        <Toolbar sx={{ gap: 3 }}>
          <Marca contexto="Backoffice" />
          <NavLinks links={links} />
          {usuario && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: 13.5, display: { xs: "none", sm: "block" } }}>
                {usuario.name || usuario.email} · {usuario.rol ?? "Sin rol"}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={cerrarSesion}
                disabled={logout.isPending}
              >
                Cerrar sesión
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false} sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
