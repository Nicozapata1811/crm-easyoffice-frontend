import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { listarTramites } from "../../../api/tramites";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { formatearFechaHora } from "../../../lib/formato";
import type { Tramite } from "../../../types/tramites";
import { etiquetaCliente } from "../../tramites/estados";

const FILTROS: { nombre: string; incluye: (tramite: Tramite) => boolean }[] = [
  { nombre: "Todos", incluye: () => true },
  { nombre: "En curso", incluye: (tramite) => tramite.estado !== "completado" },
  { nombre: "Completados", incluye: (tramite) => tramite.estado === "completado" },
];

/** The client's cases (HU-28). */
export function MisTramites() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState(0);
  const tramites = useQuery({
    queryKey: ["portal", "tramites", "lista"],
    queryFn: ({ signal }) => listarTramites(signal),
  });
  const filas = (tramites.data?.results ?? []).filter(FILTROS[filtro].incluye);

  return (
    <>
      <PageHeading titulo="Mis trámites" bajada="Historial y seguimiento de los trámites de tu empresa." />

      <Tabs
        value={filtro}
        onChange={(_, valor: number) => setFiltro(valor)}
        sx={{ mb: 2.75, borderBottom: 1, borderColor: "divider", minHeight: 0 }}
      >
        {FILTROS.map(({ nombre }) => (
          <Tab key={nombre} label={nombre} sx={{ fontSize: 13.5, minHeight: 0, py: 1.25 }} />
        ))}
      </Tabs>

      {tramites.isError && <Alert severity="error">No pudimos cargar tus trámites. Intenta nuevamente.</Alert>}
      {tramites.isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando tus trámites" />
        </Box>
      )}
      {tramites.data && (
        <Paper sx={{ overflowX: "auto" }}>
          <Table aria-label="Mis trámites">
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Trámite</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Iniciado</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((tramite) => (
                <TableRow
                  key={tramite.id}
                  hover
                  onClick={() => navigate(`/tramites/${tramite.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {tramite.folio}
                  </TableCell>
                  <TableCell>{tramite.tipo}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{tramite.contrato?.folio ?? "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFechaHora(tramite.created_at)}</TableCell>
                  <TableCell>
                    <EstadoPill {...etiquetaCliente(tramite)} />
                  </TableCell>
                </TableRow>
              ))}
              {filas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "text.secondary" }}>
                    No tienes trámites aquí todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </>
  );
}
