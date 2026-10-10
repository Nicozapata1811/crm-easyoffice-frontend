import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { crearVenta, listarServicios } from "../../../api/portal";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import { mensajeDePago } from "../Pago/mensajes";
import { PanelMedioPago } from "../Pago/PanelMedioPago";
import { useMediosPago } from "../Pago/useMediosPago";
import { usePagarVenta } from "../Pago/usePagarVenta";

/**
 * ASSUMPTION: pending validation with Easy Office. What the domicile flow
 * charges belongs to the case type's configuration, which does not exist yet;
 * these are the prototype's two lines.
 */
const SERVICIOS_DEL_TRAMITE = ["domicilio-tributario", "firma-electronica-avanzada"];

export function ConfirmacionPago() {
  const navigate = useNavigate();
  const servicios = useQuery({
    queryKey: ["portal", "servicios"],
    queryFn: ({ signal }) => listarServicios(signal),
  });
  const [ventaId, setVentaId] = useState<number>();
  const nuevaVenta = useMutation({ mutationFn: (items: Parameters<typeof crearVenta>[0]) => crearVenta(items) });
  const pagar = usePagarVenta();
  const medios = useMediosPago();

  const lineas = (servicios.data ?? []).filter(({ codigo }) =>
    SERVICIOS_DEL_TRAMITE.includes(codigo),
  );
  const total = lineas.reduce((suma, servicio) => suma + Number(servicio.precio_base), 0);
  const preciosDeEjemplo = lineas.some(({ precio_confirmado }) => !precio_confirmado);
  const ocupado = nuevaVenta.isPending || pagar.isPending || !medios.elegido;
  const error = nuevaVenta.error ?? pagar.error;

  const pagarTramite = async () => {
    let id = ventaId;
    if (id === undefined) {
      const venta = await nuevaVenta.mutateAsync(
        lineas.map(({ codigo }) => ({ servicio: codigo, cantidad: 1 })),
      );
      id = venta.id;
      setVentaId(id);
    }
    pagar.mutate({ ventaId: id, proveedor: medios.elegido });
  };

  if (servicios.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando precios" />
      </Box>
    );
  }
  if (servicios.isError || lineas.length === 0) {
    return (
      <Alert severity="error">
        No pudimos cargar los precios del trámite. Recarga la página o intenta más tarde.
      </Alert>
    );
  }

  return (
    <>
      <PageHeading
        titulo="Confirma y paga"
        bajada="El documento se envía a firma electrónica avanzada apenas se confirme el pago."
      />

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
          {lineas.map((servicio) => (
            <Box
              key={servicio.codigo}
              sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, py: 1.125 }}
            >
              <span>{servicio.nombre}</span>
              <span>{formatearPesos(Number(servicio.precio_base))}</span>
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
            <span>{formatearPesos(total)}</span>
          </Box>

          {preciosDeEjemplo && (
            <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 1.5, lineHeight: 1.5 }}>
              Valores de ejemplo. Easy Office aún no confirma los precios.
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {mensajeDePago(error)}
            </Alert>
          )}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2.25 }}
            disabled={ocupado}
            onClick={() => void pagarTramite().catch(() => undefined)}
          >
            {ocupado ? "Preparando el pago…" : "Pagar y enviar a firma"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => navigate("/tramites/domicilio-tributario/documento")}
          >
            Volver
          </Button>
        </Paper>
      </Box>
    </>
  );
}
