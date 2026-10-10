import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";

import { listarVentas } from "../../../api/portal";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { formatearFechaHora, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import { ESTADO_VENTA } from "../Pago/estados";

export function MisCompras() {
  const ventas = useQuery({
    queryKey: ["portal", "ventas"],
    queryFn: ({ signal }) => listarVentas(signal),
  });

  return (
    <>
      <PageHeading titulo="Mis compras" bajada="Los servicios que contrataste y el estado de su pago." />
      {ventas.isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress aria-label="Cargando compras" />
        </Box>
      )}
      {ventas.isError && <Alert severity="error">No pudimos cargar tus compras.</Alert>}
      {ventas.data?.results.length === 0 && (
        <Typography sx={{ color: tokens.inkSoft }}>Aún no tienes compras.</Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ventas.data?.results.map((venta) => (
          <Paper key={venta.id} sx={{ p: 2.75 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{venta.folio}</Typography>
                <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft }}>
                  {formatearFechaHora(venta.created_at)}
                </Typography>
              </Box>
              <EstadoPill {...ESTADO_VENTA[venta.estado]} />
            </Box>
            {venta.items.map((item) => (
              <Box
                key={item.servicio}
                sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, pt: 1.25 }}
              >
                <span>{item.nombre}</span>
                <span>{formatearPesos(Number(item.subtotal))}</span>
              </Box>
            ))}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${tokens.border}`,
                mt: 1.5,
                pt: 1.5,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{formatearPesos(Number(venta.total))}</Typography>
              {venta.estado === "pendiente_pago" && (
                <Button
                  size="small"
                  variant="contained"
                  component={RouterLink}
                  to={`/mis-compras/${venta.id}/pagar`}
                >
                  Pagar
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </>
  );
}
