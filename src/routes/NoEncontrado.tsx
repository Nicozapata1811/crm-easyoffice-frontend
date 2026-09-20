import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

export function NoEncontrado() {
  return (
    <Box sx={{ p: 6, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1">
        No encontramos esta página
      </Typography>
      <Typography color="text.secondary">
        Es posible que el enlace esté equivocado o que la página ya no exista.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Volver al inicio
        </Button>
      </Box>
    </Box>
  );
}
