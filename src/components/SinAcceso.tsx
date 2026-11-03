/** What a user sees where their profile has no access, from a guard or a 403. */

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export function SinAcceso({ nivel = "h1" }: { nivel?: "h1" | "h3" }) {
  return (
    <Paper sx={{ p: 4, maxWidth: 560 }}>
      <Typography variant="h2" component={nivel} sx={{ mb: 1 }}>
        Sin acceso
      </Typography>
      <Typography color="text.secondary">
        Tu perfil no tiene acceso a esta sección. Si lo necesitas, pídeselo a un
        administrador.
      </Typography>
    </Paper>
  );
}
