import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { TAMANO_PAGINA_CONTRATOS } from "../../../api/contratos";
import { formatearFecha, formatearFechaHoraChile } from "../../../lib/formato";
import type { AlertaVencimiento } from "../../../types/contratos";
import { DiasRestantes } from "./DiasRestantes";

interface TablaAlertasProps {
  alertas: AlertaVencimiento[];
  total: number;
  pagina: number;
  puedeGestionar: boolean;
  alCambiarPagina: (pagina: number) => void;
  alGestionar: (alerta: AlertaVencimiento) => void;
}

export function TablaAlertas({
  alertas,
  total,
  pagina,
  puedeGestionar,
  alCambiarPagina,
  alGestionar,
}: TablaAlertasProps) {
  return (
    <>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Alertas de vencimiento">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Folio</TableCell>
              <TableCell>Servicios</TableCell>
              <TableCell>Vence</TableCell>
              <TableCell>Días restantes</TableCell>
              <TableCell>Umbral</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Gestión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alertas.map((alerta) => (
              <TableRow key={alerta.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/backoffice/clientes/${alerta.cliente.id}`}>
                    {alerta.cliente.nombre}
                  </Link>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{alerta.folio}</TableCell>
                <TableCell>{alerta.servicios.join(", ")}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatearFecha(alerta.fecha_vencimiento)}
                </TableCell>
                <TableCell>
                  <DiasRestantes
                    dias={alerta.dias_restantes}
                    renovacionAutomatica={alerta.renovacion_automatica}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{alerta.umbral_dias} días</TableCell>
                <TableCell>{alerta.ejecutivo_responsable?.nombre ?? "Sin responsable"}</TableCell>
                <TableCell>
                  <Gestion alerta={alerta} puedeGestionar={puedeGestionar} alGestionar={alGestionar} />
                </TableCell>
              </TableRow>
            ))}
            {alertas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ color: "text.secondary" }}>
                  No hay alertas con estos filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={total}
        page={pagina - 1}
        rowsPerPage={TAMANO_PAGINA_CONTRATOS}
        rowsPerPageOptions={[]}
        onPageChange={(_, nueva) => alCambiarPagina(nueva + 1)}
      />
    </>
  );
}

function Gestion({
  alerta,
  puedeGestionar,
  alGestionar,
}: {
  alerta: AlertaVencimiento;
  puedeGestionar: boolean;
  alGestionar: (alerta: AlertaVencimiento) => void;
}) {
  if (alerta.estado === "gestionada") {
    return (
      <Box sx={{ fontSize: 13 }}>
        <Typography sx={{ fontSize: "inherit" }}>
          {alerta.gestionada_por_nombre ?? "Sin identificar"}
          {alerta.gestionada_en && ` · ${formatearFechaHoraChile(alerta.gestionada_en)}`}
        </Typography>
        {alerta.nota && (
          <Typography sx={{ fontSize: "inherit", color: "text.secondary", overflowWrap: "anywhere" }}>
            {alerta.nota}
          </Typography>
        )}
      </Box>
    );
  }
  if (!puedeGestionar) return <>Pendiente</>;
  return (
    <Button size="small" onClick={() => alGestionar(alerta)} sx={{ whiteSpace: "nowrap" }}>
      Marcar como gestionada
    </Button>
  );
}
