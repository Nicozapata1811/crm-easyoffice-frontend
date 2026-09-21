/** Product header: wordmark on the left, the signed-in client on the right. */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { tokens } from "../theme";

interface AppHeaderProps {
  clienteNombre: string;
  iniciales: string;
}

export function AppHeader({ clienteNombre, iniciales }: AppHeaderProps) {
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Typography
          sx={{ fontSize: 13.5, color: tokens.inkSoft, display: { xs: "none", sm: "block" } }}
        >
          {clienteNombre}
        </Typography>
        <Box
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
          {iniciales}
        </Box>
      </Box>
    </Box>
  );
}
