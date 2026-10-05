/** Shell for Easy Office staff. */

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, useNavigate } from "react-router-dom";

import { NavLinks } from "../components/NavLinks";
import { useLogout, useSesion } from "../features/auth/useSesion";
import { RUTA_INGRESO } from "../routes/RequireAuth";

const LINKS = [
  { to: "/backoffice", label: "Panel", end: true },
  { to: "/backoffice/tipos-tramite", label: "Tipos de trámite" },
];

export function BackofficeLayout() {
  const { data: usuario } = useSesion();
  const logout = useLogout();
  const navigate = useNavigate();

  const cerrarSesion = () =>
    logout.mutate(undefined, { onSettled: () => navigate(RUTA_INGRESO, { replace: true }) });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="default">
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" component="span">
            Easy Office · Backoffice
          </Typography>
          <NavLinks links={LINKS} />
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
