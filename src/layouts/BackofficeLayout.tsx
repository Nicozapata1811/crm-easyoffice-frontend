/** Shell for Easy Office staff: executives, supervisors, administrators. */

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet } from "react-router-dom";

import { NavLinks } from "../components/NavLinks";

const LINKS = [
  { to: "/backoffice", label: "Panel", end: true },
  { to: "/backoffice/tipos-tramite", label: "Tipos de trámite" },
];

export function BackofficeLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="default">
        <Toolbar sx={{ gap: 3 }}>
          <Typography variant="h6" component="span">
            Easy Office · Backoffice
          </Typography>
          <NavLinks links={LINKS} />
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false} sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
