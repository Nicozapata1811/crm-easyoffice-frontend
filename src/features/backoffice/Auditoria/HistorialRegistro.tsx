import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { SectionHeading } from "../../../components/SectionHeading";
import { SinAcceso } from "../../../components/SinAcceso";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { TablaAuditoria } from "./TablaAuditoria";
import { useHistorialRegistro, useSinAcceso } from "./useAuditoria";

interface HistorialRegistroProps {
  entidad: string;
  registroId: number;
  bajada: string;
}

/** A record's audit history. Without the permission nothing shows and nothing is asked. */
export function HistorialRegistro(props: HistorialRegistroProps) {
  const { data: usuario } = useSesion();
  if (!tienePermiso(usuario, PERMISOS.consultarAuditoria)) return null;
  return <Contenido {...props} />;
}

function Contenido({ entidad, registroId, bajada }: HistorialRegistroProps) {
  const [pagina, setPagina] = useState(1);
  const { data, isPending, isError, error } = useHistorialRegistro(entidad, registroId, pagina);
  const sinAcceso = useSinAcceso(error);

  return (
    <Paper component="section" aria-label="Registro de auditoría" sx={{ p: 4, mb: 3 }}>
      <SectionHeading texto="Registro de auditoría" primera />
      {sinAcceso ? (
        <SinAcceso nivel="h3" />
      ) : (
        <>
          <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 2 }}>{bajada}</Typography>
          {isError && <Alert severity="error">No pudimos cargar el historial. Intenta nuevamente.</Alert>}
          {isPending && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress aria-label="Cargando historial" />
            </Box>
          )}
          {data && (
            <TablaAuditoria
              etiqueta="Historial del registro"
              entradas={data.results}
              total={data.count}
              pagina={pagina}
              alCambiarPagina={setPagina}
              mensajeVacio="Este registro no tiene entradas todavía."
            />
          )}
        </>
      )}
    </Paper>
  );
}
