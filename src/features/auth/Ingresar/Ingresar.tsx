import Box from "@mui/material/Box";

import { FormularioIngreso } from "../FormularioIngreso";

export function Ingresar() {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}
    >
      <FormularioIngreso
        titulo="Ingreso del personal"
        bajada="Usa tu correo y contraseña de Easy Office."
        destinoPorDefecto="/backoffice"
      />
    </Box>
  );
}
