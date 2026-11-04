import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import { TAMANO_PAGINA_AUDITORIA } from "../../../api/auditoria";
import { formatearFechaHoraChile } from "../../../lib/formato";
import type { EntradaAuditoria } from "../../../types/auditoria";
import { DetalleEntrada } from "./DetalleEntrada";
import { etiquetaEntidad } from "./entidades";
import { etiquetaAccion, etiquetaOrigen, etiquetaUsuario } from "./etiquetas";

interface TablaAuditoriaProps {
  etiqueta: string;
  entradas: EntradaAuditoria[];
  total: number;
  pagina: number;
  alCambiarPagina: (pagina: number) => void;
  mensajeVacio: string;
}

/** The log's rows and their detail, for the screen and for a record's history. */
export function TablaAuditoria({
  etiqueta,
  entradas,
  total,
  pagina,
  alCambiarPagina,
  mensajeVacio,
}: TablaAuditoriaProps) {
  const [abierta, setAbierta] = useState<EntradaAuditoria | null>(null);

  return (
    <>
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label={etiqueta}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y hora (Chile)</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Canal</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Entidad</TableCell>
              <TableCell>Registro</TableCell>
              <TableCell>IP</TableCell>
              <TableCell aria-label="Detalle" />
            </TableRow>
          </TableHead>
          <TableBody>
            {entradas.map((entrada) => (
              <TableRow key={entrada.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatearFechaHoraChile(entrada.fecha_hora)}
                </TableCell>
                <TableCell>{etiquetaUsuario(entrada)}</TableCell>
                <TableCell>{etiquetaOrigen(entrada.origen)}</TableCell>
                <TableCell>{etiquetaAccion(entrada.accion)}</TableCell>
                <TableCell>{etiquetaEntidad(entrada.entidad, entrada.entidad_nombre)}</TableCell>
                <TableCell>{entrada.registro_nombre ?? "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                  {entrada.direccion_ip ?? "—"}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setAbierta(entrada)} sx={{ whiteSpace: "nowrap" }}>
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {entradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} sx={{ color: "text.secondary" }}>
                  {mensajeVacio}
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
        rowsPerPage={TAMANO_PAGINA_AUDITORIA}
        rowsPerPageOptions={[]}
        onPageChange={(_, nueva) => alCambiarPagina(nueva + 1)}
      />
      {abierta && <DetalleEntrada entrada={abierta} alCerrar={() => setAbierta(null)} />}
    </>
  );
}
