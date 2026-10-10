/** Product header: wordmark on the left, the signed-in client or the login links on the right. */

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { tokens } from "../theme";

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
        bgcolor: tokens.surface,
        borderBottom: `1px solid ${tokens.border}`,
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
          display: "flex",
          alignItems: "center",
          gap: 1.125,
          textDecoration: "none",
          fontFamily: tokens.serif,
          fontWeight: 600,
          fontSize: 19,
          color: tokens.primaryDark,
        }}
      >
        <Box
          sx={{
            width: 26,
            height: 26,
            border: `1.5px solid ${tokens.primaryDark}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          EO
        </Box>
        Easy Office
      </Box>

      {nombre ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Typography
            sx={{ fontSize: 13.5, color: tokens.inkSoft, display: { xs: "none", sm: "block" } }}
          >
            {nombre}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: tokens.primaryTint,
              color: tokens.primaryDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: tokens.serif,
            }}
          >
            {iniciales(nombre)}
          </Box>
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
