import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { formatearEntero, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";

interface Fila {
  nombre: string;
  monto: number;
  cantidad: number;
}

interface VentasDesgloseProps {
  titulo: string;
  filas: Fila[];
  deEjemplo: boolean;
}

export function VentasDesglose({ titulo, filas, deEjemplo }: VentasDesgloseProps) {
  const maximo = Math.max(...filas.map(({ monto }) => monto), 1);

  return (
    <Paper component="section" aria-label={titulo} sx={{ p: 3.5 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 2.5 }}>
        <Typography variant="h2" component="h2">
          {titulo}
        </Typography>
        {deEjemplo && (
          <Typography sx={{ fontSize: 12.5, color: tokens.inkFaint }}>valores de ejemplo</Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        {filas.map(({ nombre, monto, cantidad }) => (
          <Box key={nombre}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
              <Typography sx={{ fontSize: 14 }}>{nombre}</Typography>
              <Typography sx={{ fontSize: 14, color: tokens.inkSoft, whiteSpace: "nowrap" }}>
                {formatearPesos(monto)} · {formatearEntero(cantidad)}{" "}
                {cantidad === 1 ? "venta" : "ventas"}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(monto / maximo) * 100}
              aria-label={nombre}
              sx={{ height: 8, borderRadius: 4, bgcolor: tokens.primaryTint }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
