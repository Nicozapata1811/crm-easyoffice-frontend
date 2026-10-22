/** Product header: wordmark on the left, the signed-in client or the login links on the right. */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { Marca } from "./Marca";

interface AppHeaderProps {
  nombre?: string;
  onSalir?: () => void;
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

export function AppHeader({ nombre, onSalir }: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 4 },
        py: 1.75,
      }}
    >
      <Box
        component={RouterLink}
        to="/"
        sx={{
          textDecoration: "none",
          borderRadius: 1,
          "&:focus-visible": { outline: "2px solid", outlineColor: "primary.strong", outlineOffset: 2 },
        }}
      >
        <Marca />
      </Box>

      {nombre ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Typography
            sx={{ fontSize: 13.5, color: "text.secondary", display: { xs: "none", sm: "block" } }}
          >
            {nombre}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "primary.soft",
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {iniciales(nombre)}
          </Box>
          <Button size="small" component={RouterLink} to="/mis-compras">
            Mis compras
          </Button>
          <Button size="small" onClick={onSalir}>
            Salir
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" component={RouterLink} to="/ingresar">
            Ingresar
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to="/registro">
            Crear cuenta
          </Button>
        </Box>
      )}
    </Box>
  );
}
