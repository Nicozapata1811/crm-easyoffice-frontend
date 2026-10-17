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
import { listarTramitesBackoffice } from "../../../api/tramites";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { formatearFechaHora } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { EstadoTramite } from "../../../types/tramites";
import { etiquetaStaff, MOTIVOS } from "../../tramites/estados";

const ESTADOS: { valor: EstadoTramite; nombre: string }[] = [
  { valor: "iniciado", nombre: "Iniciado" },
  { valor: "pendiente", nombre: "Pendiente" },
  { valor: "completado", nombre: "Completado" },
];

/** Every case, filterable by state and pending reason (HU-11, HU-61). */
export function ListaTramites() {
  const navigate = useNavigate();
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState<EstadoTramite | "">("");
  const [motivo, setMotivo] = useState("");
  const [pagina, setPagina] = useState(1);
  const filtros = { buscar: buscar.trim(), estado, motivo, pagina };
  const { data, isPending, isError } = useQuery({
    queryKey: ["tramites", "lista", filtros],
    queryFn: ({ signal }) => listarTramitesBackoffice(filtros, signal),
    placeholderData: keepPreviousData,
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <PageHeading titulo="Trámites" bajada="Solicitudes de los clientes y en qué paso está cada una." />
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
          placeholder="TRA-000001, folio del contrato, RUT o nombre"
          sx={{ flex: "1 1 320px", maxWidth: 480 }}
        />
        <TextField
          select
          label="Estado"
          size="small"
          value={estado}
          onChange={(event) => {
            setEstado(event.target.value as EstadoTramite | "");
            setPagina(1);
          }}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS.map(({ valor, nombre }) => (
            <MenuItem key={valor} value={valor}>
              {nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Motivo"
          size="small"
          value={motivo}
          onChange={(event) => {
            setMotivo(event.target.value);
            setPagina(1);
          }}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {MOTIVOS.map(({ codigo, nombre }) => (
            <MenuItem key={codigo} value={codigo}>
              {nombre}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && <Alert severity="error">No pudimos cargar los trámites. Intenta nuevamente.</Alert>}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando trámites" />
        </Box>
      )}
      {data && (
        <Paper sx={{ overflowX: "auto" }}>
          <Table aria-label="Trámites">
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Iniciado</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.results.map((tramite) => (
                <TableRow
                  key={tramite.id}
                  hover
                  onClick={() => navigate(`/backoffice/tramites/${tramite.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap", color: tokens.inkSoft }}>{tramite.folio}</TableCell>
                  <TableCell>{tramite.cliente.nombre}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{tramite.contrato?.folio ?? "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFechaHora(tramite.created_at)}</TableCell>
                  <TableCell>
                    <EstadoPill {...etiquetaStaff(tramite)} />
                  </TableCell>
                </TableRow>
              ))}
              {data.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: tokens.inkSoft }}>
                    No hay trámites con estos filtros.
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
