import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";

import { obtenerTramite } from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import { mensajeDePago } from "../Pago/mensajes";
import { PanelMedioPago } from "../Pago/PanelMedioPago";
import { useMediosPago } from "../Pago/useMediosPago";
import { usePagarVenta } from "../Pago/usePagarVenta";

/**
 * Pay the sale created when the client confirmed the draft (RN-40). What it
 * charges comes from the plan chosen: the backend built the sale's lines.
 */
export function ConfirmacionPago() {
  const id = Number(useParams().tramiteId);
  const tramite = useQuery({
    queryKey: ["portal", "tramites", id],
    queryFn: ({ signal }) => obtenerTramite(id, signal),
  });
  const pagar = usePagarVenta();
  const medios = useMediosPago();

  if (tramite.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando el resumen" />
      </Box>
    );
  }
  const venta = tramite.data?.venta;
  if (tramite.isError || !venta || venta.estado !== "pendiente_pago") {
    return (
      <Alert severity="info">
        Este trámite no tiene un pago pendiente.{" "}
        <RouterLink to={`/tramites/${id}`}>Ver el estado del trámite</RouterLink>
      </Alert>
    );
  }
  const ocupado = pagar.isPending || !medios.elegido;

  return (
    <>
      <PageHeading
        titulo="Confirma y paga"
        bajada="Cuando se confirme el pago, gestionamos la firma electrónica avanzada del contrato."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: 3, alignItems: "start" }}>
        <PanelMedioPago {...medios} />

        <Paper sx={{ p: 2.75 }}>
          <Typography variant="h3" sx={{ fontSize: 14.5, mb: 1.75 }}>
            Resumen
          </Typography>
          {venta.items.map((item) => (
            <Box
              key={item.servicio}
              sx={{ display: "flex", justifyContent: "space-between", gap: 2, fontSize: 13, py: 1.125 }}
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
              borderTop: 1, borderColor: "divider",
              mt: 0.75,
              pt: 1.75,
            }}
          >
            <span>Total</span>
            <span>{formatearPesos(Number(venta.total))}</span>
          </Box>

          {pagar.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {mensajeDePago(pagar.error)}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2.25 }}
            disabled={ocupado}
            onClick={() => pagar.mutate({ ventaId: venta.id, proveedor: medios.elegido })}
          >
            {pagar.isPending ? "Preparando el pago…" : "Pagar y enviar a firma"}
          </Button>
          <Button fullWidth variant="outlined" sx={{ mt: 1 }} component={RouterLink} to={`/tramites/${id}/documento`}>
            Volver al borrador
          </Button>
        </Paper>
      </Box>
    </>
  );
}
