import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { obtenerTramite } from "../../../api/tramites";
import { FormularioDomicilio } from "../FormularioDomicilio/FormularioDomicilio";
import { FormularioTramitePortal } from "./FormularioTramitePortal";

/** `/tramites/:tipo/nuevo`: a new request for a type sold online by plan. */
export function NuevaSolicitud() {
  const { tipo } = useParams();
  return <FormularioTramitePortal tipo={tipo!} />;
}

// The domicile keeps its own form (HU-24); every other type sold online uses
// the generic one.
const FORMULARIO_PROPIO: Record<string, () => React.JSX.Element> = {
  "domicilio-tributario": FormularioDomicilio,
};

/** `/tramites/:tramiteId/editar`: the form of the case's own type. */
export function EditarSolicitud() {
  const id = Number(useParams().tramiteId);
  const tramite = useQuery({
    queryKey: ["portal", "tramites", id],
    queryFn: ({ signal }) => obtenerTramite(id, signal),
  });

  if (tramite.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando el formulario" />
      </Box>
    );
  }
  if (tramite.isError) return <Alert severity="error">No encontramos este trámite.</Alert>;
  const Propio = FORMULARIO_PROPIO[tramite.data.tipo_codigo];
  if (Propio) return <Propio />;
  return <FormularioTramitePortal tipo={tramite.data.tipo_codigo} tramite={tramite.data} />;
}
