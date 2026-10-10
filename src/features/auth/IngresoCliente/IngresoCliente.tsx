import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { FormularioIngreso } from "../FormularioIngreso";

export function IngresoCliente() {
  const [params] = useSearchParams();

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <FormularioIngreso
        titulo="Ingresa a tu cuenta"
        bajada="Con tu cuenta puedes pagar tus trámites y revisar tus compras."
        destinoPorDefecto="/"
        pie={
          <Typography sx={{ fontSize: 14, textAlign: "center" }}>
            ¿Aún no tienes cuenta?{" "}
            <Link component={RouterLink} to={`/registro?${params.toString()}`}>
              Crea una aquí
            </Link>
          </Typography>
        }
      />
    </Box>
  );
}
