import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";

import { obtenerOrden } from "../../../api/portal";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import type { EstadoOrden } from "../../../types/ventas";
import { ORDEN_ABIERTA } from "../Pago/estados";
import { mensajeDePago } from "../Pago/mensajes";
import { usePagarVenta } from "../Pago/usePagarVenta";

export const CONSULTA_CADA_MS = 2000;

const TEXTOS: Partial<Record<EstadoOrden, { titulo: string; bajada: string }>> = {
  pagada: {
    titulo: "Pago confirmado",
    bajada: "Recibimos tu pago. Seguimos con tu trámite y te avisaremos por correo.",
  },
  rechazada: {
    titulo: "El pago fue rechazado",
    bajada: "No se hizo ningún cargo. Puedes intentarlo de nuevo con otra tarjeta.",
  },
  expirada: {
    titulo: "El plazo para pagar venció",
    bajada: "No se hizo ningún cargo. Puedes iniciar el pago otra vez.",
  },
  cancelada: {
    titulo: "El pago se canceló",
    bajada: "No se hizo ningún cargo. Puedes iniciar el pago otra vez.",
  },
  error: {
    titulo: "No pudimos completar el pago",
    bajada: "Si ves un cargo en tu tarjeta, escríbenos y lo revisamos.",
  },
  pendiente: {
    titulo: "Estamos confirmando tu pago",
    bajada: "Esto toma unos segundos. Si cerraste la ventana de pago sin pagar, puedes abrirla otra vez.",
  },
};

export function ResultadoPago() {
  const ordenId = Number(useParams().ordenId);
  const orden = useQuery({
    queryKey: ["portal", "orden", ordenId],
    queryFn: ({ signal }) => obtenerOrden(ordenId, signal),
    refetchInterval: (query) =>
      query.state.data && ORDEN_ABIERTA.includes(query.state.data.estado) ? CONSULTA_CADA_MS : false,
  });
  const pagar = usePagarVenta();

  if (orden.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Consultando el pago" />
      </Box>
    );
  }
  if (orden.isError) {
    return <Alert severity="error">No encontramos este pago.</Alert>;
  }

  const { estado, monto, venta } = orden.data;
  const texto = TEXTOS[estado] ?? TEXTOS.pendiente!;
  const reintentable = estado !== "pagada" && estado !== "reembolsada";

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <PageHeading titulo={texto.titulo} bajada={texto.bajada} />
      <Paper sx={{ p: 3.25 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 14 }}>Monto</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{formatearPesos(Number(monto))}</Typography>
        </Box>
        {ORDEN_ABIERTA.includes(estado) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
            <CircularProgress size={18} aria-label="Esperando confirmación" />
            <Typography sx={{ fontSize: 13 }}>Esperando la confirmación de Klap…</Typography>
          </Box>
        )}
        {pagar.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mensajeDePago(pagar.error)}
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
          {reintentable && (
            <Button variant="contained" disabled={pagar.isPending} onClick={() => pagar.mutate(venta)}>
              {estado === "pendiente" ? "Abrir el pago otra vez" : "Intentar de nuevo"}
            </Button>
          )}
          <Button variant="outlined" component={RouterLink} to="/mis-compras">
            Ver mis compras
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
