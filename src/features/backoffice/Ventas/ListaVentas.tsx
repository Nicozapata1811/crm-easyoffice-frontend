import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { TAMANO_PAGINA_CLIENTES } from "../../../api/clientes";
import { listarVentasBackoffice } from "../../../api/ventas";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { formatearFechaHora, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { EstadoVenta } from "../../../types/ventas";
import { ESTADO_VENTA } from "../../portal/Pago/estados";

export function ListaVentas() {
  const navigate = useNavigate();
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState<EstadoVenta | "">("");
  const [pagina, setPagina] = useState(1);
  const filtros = { buscar: buscar.trim(), estado, pagina };
  const { data, isPending, isError } = useQuery({
    queryKey: ["ventas", "lista", filtros],
    queryFn: ({ signal }) => listarVentasBackoffice(filtros, signal),
    placeholderData: keepPreviousData,
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <PageHeading titulo="Ventas" bajada="Compras hechas en el portal y el estado de su pago." />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
        <TextField
          label="Buscar"
          type="search"
          size="small"
          value={buscar}
          onChange={(event) => {
            setBuscar(event.target.value);
            setPagina(1);
          }}
          placeholder="VEN-000001, RUT o nombre del cliente"
          sx={{ flex: "1 1 320px", maxWidth: 480 }}
        />
        <TextField
          select
          label="Estado"
          size="small"
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value as EstadoVenta | "");
            setPagina(1);
          }}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ESTADO_VENTA).map(([valor, { etiqueta }]) => (
            <MenuItem key={valor} value={valor}>
              {etiqueta}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && <Alert severity="error">No pudimos cargar las ventas. Intenta nuevamente.</Alert>}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando ventas" />
        </Box>
      )}
      {data && (
        <Paper sx={{ overflowX: "auto" }}>
          <Table aria-label="Ventas">
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.results.map((venta) => (
                <TableRow
                  key={venta.id}
                  hover
                  onClick={() => navigate(`/backoffice/ventas/${venta.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap", color: tokens.inkSoft }}>{venta.folio}</TableCell>
                  <TableCell>{venta.cliente.nombre}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFechaHora(venta.created_at)}</TableCell>
                  <TableCell align="right">{formatearPesos(Number(venta.total))}</TableCell>
                  <TableCell>
                    <EstadoPill {...ESTADO_VENTA[venta.estado]} />
                  </TableCell>
                </TableRow>
              ))}
              {data.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: tokens.inkSoft }}>
                    No hay ventas con estos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data.count}
            page={pagina - 1}
            rowsPerPage={TAMANO_PAGINA_CLIENTES}
            rowsPerPageOptions={[]}
            onPageChange={(_, nueva) => setPagina(nueva + 1)}
          />
        </Paper>
      )}
    </Box>
  );
}
