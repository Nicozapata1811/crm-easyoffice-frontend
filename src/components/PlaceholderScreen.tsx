/**
 * Stands in for a screen that has not been built yet.
 *
 * The prototype these screens come from has not been validated with the
 * counterpart, so nothing here commits to a layout.
 */

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PlaceholderScreenProps {
  titulo: string;
  descripcion: string;
}

export function PlaceholderScreen({
  titulo,
  descripcion,
}: PlaceholderScreenProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1">
        {titulo}
      </Typography>
      <Typography color="text.secondary">{descripcion}</Typography>
      <Alert severity="info">
        Pantalla pendiente de implementación. El prototipo aún no se valida con
        Easy Office.
      </Alert>
    </Box>
  );
}
