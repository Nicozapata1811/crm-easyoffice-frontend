import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { TAMANO_PAGINA_CONTRATOS } from "../../../api/contratos";
import { EstadoPill, type TonoEstado } from "../../../components/EstadoPill";
import { SectionHeading } from "../../../components/SectionHeading";
import { formatearFecha } from "../../../lib/formato";
import type { Contrato, EstadoContrato } from "../../../types/contratos";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { DiasRestantes } from "../Alertas/DiasRestantes";
import { DialogoResponsable } from "./DialogoResponsable";
import { useContratosDeCliente } from "./useContratos";

const ESTADOS: Record<EstadoContrato, { etiqueta: string; tono: TonoEstado }> = {
  borrador: { etiqueta: "Borrador", tono: "espera" },
  vigente: { etiqueta: "Vigente", tono: "completo" },
  terminado: { etiqueta: "Terminado", tono: "neutro" },
  anulado: { etiqueta: "Anulado", tono: "neutro" },
};

/** The backend refuses a change of responsible on any other state. */
const admiteResponsable = ({ estado }: Contrato) => estado === "borrador" || estado === "vigente";

/** The client's contracts and their services (HU-48, RF-11). */
export function ContratosCliente({ clienteId }: { clienteId: number }) {
  const { data: usuario } = useSesion();
  if (!tienePermiso(usuario, PERMISOS.verContratos)) return null;
  return (
    <Listado
      clienteId={clienteId}
      puedeAsignar={tienePermiso(usuario, PERMISOS.asignarResponsable)}
    />
  );
}

function Listado({ clienteId, puedeAsignar }: { clienteId: number; puedeAsignar: boolean }) {
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<Contrato | null>(null);
  const { data, isPending, error } = useContratosDeCliente(clienteId, pagina);

  return (
    <Paper component="section" aria-label="Servicios y documentos" sx={{ p: 4, mb: 3 }}>
      <SectionHeading texto="Servicios y documentos" primera />
      {error && <Alert severity="error">No pudimos cargar los contratos. Intenta nuevamente.</Alert>}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress aria-label="Cargando contratos" />
        </Box>
      )}
      {data && data.count === 0 && (
        <Typography sx={{ color: "text.secondary" }}>
          Este cliente no tiene contratos registrados.
        </Typography>
      )}
      {data && data.count > 0 && (
        <>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" aria-label="Contratos del cliente">
              <TableHead>
                <TableRow>
                  <TableCell>Folio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Servicios</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Días restantes</TableCell>
                  <TableCell>Responsable</TableCell>
                  {puedeAsignar && <TableCell aria-label="Acciones" />}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{contrato.folio}</TableCell>
                    <TableCell>
                      <EstadoPill {...ESTADOS[contrato.estado]} />
                    </TableCell>
                    <TableCell>{contrato.servicios.map(({ nombre }) => nombre).join(", ")}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatearFecha(contrato.fecha_inicio)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatearFecha(contrato.fecha_vencimiento)}
                    </TableCell>
                    <TableCell>
                      {contrato.dias_restantes === null ? (
                        "—"
                      ) : (
                        <DiasRestantes
                          dias={contrato.dias_restantes}
                          renovacionAutomatica={contrato.renovacion_automatica}
                        />
                      )}
                    </TableCell>
                    <TableCell>{contrato.ejecutivo_responsable_nombre ?? "Sin responsable"}</TableCell>
                    {puedeAsignar && (
                      <TableCell align="right">
                        {admiteResponsable(contrato) && (
                          <Button
                            size="small"
                            onClick={() => setEditando(contrato)}
                            aria-label={`Cambiar responsable de ${contrato.folio}`}
                          >
                            Cambiar
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {data.count > TAMANO_PAGINA_CONTRATOS && (
            <TablePagination
              component="div"
              count={data.count}
              page={pagina - 1}
              rowsPerPage={TAMANO_PAGINA_CONTRATOS}
              rowsPerPageOptions={[]}
              onPageChange={(_, nueva) => setPagina(nueva + 1)}
            />
          )}
          <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 1.5 }}>
            Los documentos de cada contrato están en el detalle de su trámite.
          </Typography>
        </>
      )}
      {editando && <DialogoResponsable contrato={editando} alCerrar={() => setEditando(null)} />}
    </Paper>
  );
}
