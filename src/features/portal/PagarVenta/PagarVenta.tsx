import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Link as RouterLink, useParams } from "react-router-dom";

import { obtenerVenta } from "../../../api/portal";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import { mensajeDePago } from "../Pago/mensajes";
import { PanelMedioPago } from "../Pago/PanelMedioPago";
import { useMediosPago } from "../Pago/useMediosPago";
import { usePagarVenta } from "../Pago/usePagarVenta";

/** Pay a pending sale from "Mis compras", choosing the payment method. */
export function PagarVenta() {
  const ventaId = Number(useParams().ventaId);
  const venta = useQuery({
    queryKey: ["portal", "venta", ventaId],
    queryFn: ({ signal }) => obtenerVenta(ventaId, signal),
  });
  const medios = useMediosPago();
  const pagar = usePagarVenta();

  if (venta.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando la compra" />
      </Box>
    );
  }
  if (venta.isError) return <Alert severity="error">No encontramos esta compra.</Alert>;
  if (venta.data.estado !== "pendiente_pago") return <Navigate to="/mis-compras" replace />;

  return (
    <>
      <PageHeading titulo="Paga tu compra" bajada={venta.data.folio} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <PanelMedioPago {...medios} />
        <Paper sx={{ p: 2.75 }}>
          <Typography variant="h3" sx={{ fontSize: 14.5, mb: 1.75 }}>
            Resumen
          </Typography>
          {venta.data.items.map((item) => (
            <Box
              key={item.servicio}
              sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, py: 1.125 }}
            >
              <span>{item.nombre}</span>
              <span>{formatearPesos(Number(item.subtotal))}</span>
            </Box>
          ))}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 15,
              fontWeight: 700,
              borderTop: `1px solid ${tokens.border}`,
              mt: 0.75,
              pt: 1.75,
            }}
          >
            <span>Total</span>
            <span>{formatearPesos(Number(venta.data.total))}</span>
          </Box>
          {pagar.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {mensajeDePago(pagar.error)}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2.25 }}
            disabled={pagar.isPending || !medios.elegido}
            onClick={() => pagar.mutate({ ventaId, proveedor: medios.elegido })}
          >
            {pagar.isPending ? "Preparando el pago…" : "Pagar"}
          </Button>
          <Button fullWidth variant="outlined" sx={{ mt: 1 }} component={RouterLink} to="/mis-compras">
            Volver
          </Button>
        </Paper>
      </Box>
    </>
  );
}
