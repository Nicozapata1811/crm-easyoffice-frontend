import { useState } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import { useNavigate } from "react-router-dom";

import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { tokens } from "../../../theme";
import { TRAMITES_DEMO } from "../datosDemo";

const FILTROS = ["Todos", "En curso", "Completados", "Con problemas"];

export function MisTramites() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState(0);

  return (
    <>
      <PageHeading
        titulo="Mis trámites"
        bajada="Historial y seguimiento de todos los trámites de tu empresa."
      />

      <Tabs
        value={filtro}
        onChange={(_, valor: number) => setFiltro(valor)}
        sx={{ mb: 2.75, borderBottom: `1px solid ${tokens.border}`, minHeight: 0 }}
      >
        {FILTROS.map((nombre) => (
          <Tab key={nombre} label={nombre} sx={{ fontSize: 13.5, minHeight: 0, py: 1.25 }} />
        ))}
      </Tabs>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Folio</TableCell>
              <TableCell>Trámite</TableCell>
              <TableCell>Iniciado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Documento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TRAMITES_DEMO.map((tramite) => (
              <TableRow
                key={tramite.folio}
                hover
                onClick={() => navigate("/tramites/0148")}
                sx={{ cursor: "pointer" }}
              >
                <TableCell
                  sx={{
                    fontFamily: tokens.serif,
                    fontWeight: 600,
                    color: tokens.primaryDark,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tramite.folio}
                </TableCell>
                <TableCell>{tramite.tramite}</TableCell>
                <TableCell>{tramite.iniciado}</TableCell>
                <TableCell>
                  <EstadoPill etiqueta={tramite.estado} tono={tramite.tono} />
                </TableCell>
                <TableCell>
                  {tramite.documentoDisponible ? (
                    <Link
                      component="button"
                      sx={{ fontSize: 12.5, color: tokens.primary, fontWeight: 600 }}
                    >
                      {tramite.documento}
                    </Link>
                  ) : (
                    <Box component="span" sx={{ fontSize: 12.5, color: tokens.inkFaint }}>
                      {tramite.documento}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
