import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Link as RouterLink, useParams } from "react-router-dom";

import { obtenerOrden } from "../../../api/portal";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import {
  ORDEN_ABIERTA,
  RESULTADO_POR_ESTADO,
  rutaPago,
  type ResultadoPago as Resultado,
} from "../Pago/estados";
import { mensajeDePago } from "../Pago/mensajes";
import { usePagarVenta } from "../Pago/usePagarVenta";

export const CONSULTA_CADA_MS = 2000;

const TEXTOS: Record<Resultado, { titulo: string; bajada: string }> = {
  resultado: {
    titulo: "Estamos confirmando tu pago",
    bajada: "Esto toma unos segundos. No cierres esta página.",
  },
  aprobado: {
    titulo: "Pago confirmado",
    bajada: "Recibimos tu pago. Seguimos con tu trámite y te avisaremos por correo.",
  },
  rechazado: {
    titulo: "El pago fue rechazado",
    bajada: "No se hizo ningún cargo. Puedes intentarlo de nuevo con otra tarjeta.",
  },
  cancelado: {
    titulo: "Cancelaste el pago",
    bajada: "No se hizo ningún cargo. Puedes pagar cuando quieras desde aquí o desde Mis compras.",
  },
  expirado: {
    titulo: "El plazo para pagar venció",
    bajada: "No se hizo ningún cargo. Puedes iniciar el pago otra vez.",
  },
  reembolsado: {
    titulo: "El pago fue devuelto",
    bajada: "Devolvimos el monto a tu tarjeta. Si tienes dudas, escríbenos.",
  },
  error: {
    titulo: "No pudimos completar el pago",
    bajada: "Si ves un cargo en tu tarjeta, escríbenos y lo revisamos.",
  },
};

const SIN_REINTENTO: Resultado[] = ["aprobado", "reembolsado"];

const ETIQUETA_REINTENTO: Partial<Record<Resultado, string>> = {
  resultado: "Abrir el pago otra vez",
  cancelado: "Pagar ahora",
};

function esResultado(valor: string | undefined): valor is Resultado {
  return valor !== undefined && valor in TEXTOS;
}

/**
 * One page per payment outcome. Klap sends the client to /resultado or
 * /cancelado; once the backend knows the order's final state, the page moves to
 * the URL of that state, so what is shown always matches what was charged.
 */
export function ResultadoPago() {
  const params = useParams();
  const ordenId = Number(params.ordenId);
  const resultado = esResultado(params.resultado) ? params.resultado : "resultado";
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
  const definitivo = RESULTADO_POR_ESTADO[estado];
  if (definitivo && definitivo !== resultado) {
    return <Navigate to={rutaPago(ordenId, definitivo)} replace />;
  }

  const abierta = ORDEN_ABIERTA.includes(estado);
  const texto = TEXTOS[resultado];

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <PageHeading titulo={texto.titulo} bajada={texto.bajada} />
      <Paper sx={{ p: 3.25 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 14 }}>Monto</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{formatearPesos(Number(monto))}</Typography>
        </Box>
        {abierta && resultado === "resultado" && (
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
          {!SIN_REINTENTO.includes(resultado) && (
            <Button
              variant={resultado === "resultado" ? "text" : "contained"}
              disabled={pagar.isPending}
              onClick={() => pagar.mutate(venta)}
            >
              {ETIQUETA_REINTENTO[resultado] ?? "Intentar de nuevo"}
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
