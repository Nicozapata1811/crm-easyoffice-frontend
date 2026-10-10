import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";

import { obtenerVentaBackoffice } from "../../../api/ventas";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { formatearFechaHora, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import { ESTADO_VENTA } from "../../portal/Pago/estados";
import { ETIQUETA_ORDEN } from "./etiquetas";

export function DetalleVenta() {
  const ventaId = Number(useParams().ventaId);
  const { data: venta, isPending, isError } = useQuery({
    queryKey: ["ventas", ventaId],
    queryFn: ({ signal }) => obtenerVentaBackoffice(ventaId, signal),
  });

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="Cargando venta" />
      </Box>
    );
  }
  if (isError) return <Alert severity="error">No encontramos esta venta.</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <PageHeading titulo={venta.folio} bajada={formatearFechaHora(venta.created_at)} />
        <EstadoPill {...ESTADO_VENTA[venta.estado]} />
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <SectionHeading texto="Cliente" primera />
        <Link component={RouterLink} to={`/backoffice/clientes/${venta.cliente.id}`}>
          {venta.cliente.nombre}
        </Link>{" "}
        <Typography component="span" sx={{ color: tokens.inkSoft, fontSize: 13 }}>
          {venta.cliente.folio}
        </Typography>

        <SectionHeading texto="Detalle" />
        {venta.items.map((item) => (
          <Box key={item.servicio} sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
            <span>
              {item.cantidad} × {item.nombre}
            </span>
            <span>{formatearPesos(Number(item.subtotal))}</span>
          </Box>
        ))}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            borderTop: `1px solid ${tokens.border}`,
            mt: 1,
            pt: 1.25,
          }}
        >
          <span>Total</span>
          <span>{formatearPesos(Number(venta.total))}</span>
        </Box>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        <Table aria-label="Intentos de pago">
          <TableHead>
            <TableRow>
              <TableCell>Intento</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Id en el proveedor</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {venta.ordenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFechaHora(orden.created_at)}</TableCell>
                <TableCell>{orden.proveedor}</TableCell>
                <TableCell sx={{ color: tokens.inkSoft }}>{orden.id_externo ?? "—"}</TableCell>
                <TableCell>
                  {ETIQUETA_ORDEN[orden.estado]}
                  {orden.detalle_error && (
                    <Typography sx={{ fontSize: 12, color: tokens.stamp }}>{orden.detalle_error}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {orden.pagos.map((pago) => (
                    <Typography key={pago.id} sx={{ fontSize: 13 }}>
                      {formatearPesos(Number(pago.monto))} · {[pago.marca, pago.ultimos_digitos && `**** ${pago.ultimos_digitos}`]
                        .filter(Boolean)
                        .join(" ") || "Tarjeta"}
                      {pago.cuotas ? ` · ${pago.cuotas} cuotas` : ""}
                    </Typography>
                  ))}
                  {orden.pagos.length === 0 && "—"}
                </TableCell>
              </TableRow>
            ))}
            {venta.ordenes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ color: tokens.inkSoft }}>
                  El cliente aún no intenta pagar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
