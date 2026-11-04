import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { useSearchParams } from "react-router-dom";

import { ApiError } from "../../../api/client";
import { PageHeading } from "../../../components/PageHeading";
import { SinAcceso } from "../../../components/SinAcceso";
import type { AlertaVencimiento } from "../../../types/contratos";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { erroresDeCampo } from "../../tramites/errores";
import { useSinAcceso } from "../Auditoria/useAuditoria";
import { DialogoGestionar } from "./DialogoGestionar";
import { FiltrosAlertas } from "./FiltrosAlertas";
import { filtrosDesdeUrl } from "./filtrosUrl";
import { TablaAlertas } from "./TablaAlertas";
import { useAlertas, useResumenAlertas } from "./useAlertas";

/** Contracts about to expire, for the executive to handle (HU-42, UC-09). */
export function AlertasVencimiento() {
  const [params, setParams] = useSearchParams();
  const filtros = filtrosDesdeUrl(params);
  const pagina = filtros.pagina ?? 1;
  const { data: usuario } = useSesion();
  const { data, isPending, error } = useAlertas(filtros);
  const { data: resumen } = useResumenAlertas();
  const sinAcceso = useSinAcceso(error);
  const [enGestion, setEnGestion] = useState<AlertaVencimiento | null>(null);
  const [yaGestionada, setYaGestionada] = useState(false);

  const irAPagina = (nueva: number) =>
    setParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales);
        if (nueva > 1) siguientes.set("pagina", String(nueva));
        else siguientes.delete("pagina");
        return siguientes;
      },
      { replace: true },
    );

  // Any filter changes the results, so it starts again from the first page.
  const cambiarFiltros = (cambios: Record<string, string>) =>
    setParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales);
        siguientes.delete("pagina");
        for (const [clave, valor] of Object.entries(cambios)) {
          if (valor) siguientes.set(clave, valor);
          else siguientes.delete(clave);
        }
        return siguientes;
      },
      { replace: true },
    );

  if (sinAcceso) return <SinAcceso />;

  const errores = erroresDeCampo(error);
  const paginaInexistente = error instanceof ApiError && error.status === 404;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      <PageHeading
        titulo="Alertas de vencimiento"
        bajada="Contratos próximos a vencer, para gestionar su pago o renovación. Las fechas siguen el calendario de Chile."
      />
      <FiltrosAlertas
        filtros={filtros}
        umbrales={resumen?.umbrales ?? []}
        errores={Object.fromEntries(errores)}
        alCambiar={cambiarFiltros}
        alLimpiar={() => setParams(new URLSearchParams(), { replace: true })}
      />

      {yaGestionada && (
        <Alert severity="info" onClose={() => setYaGestionada(false)} sx={{ mb: 2 }}>
          Otra persona ya gestionó esa alerta. Actualizamos el listado.
        </Alert>
      )}
      {errores.length > 0 && (
        <Alert severity="error">Corrige los filtros marcados para ver las alertas.</Alert>
      )}
      {paginaInexistente && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => irAPagina(1)}>
              Ir a la primera página
            </Button>
          }
        >
          Esa página no existe con estos filtros.
        </Alert>
      )}
      {error && errores.length === 0 && !paginaInexistente && (
        <Alert severity="error">No pudimos cargar las alertas. Intenta nuevamente.</Alert>
      )}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando alertas" />
        </Box>
      )}
      {data && (
        <Paper>
          <TablaAlertas
            alertas={data.results}
            total={data.count}
            pagina={pagina}
            puedeGestionar={tienePermiso(usuario, PERMISOS.gestionarAlertas)}
            alCambiarPagina={irAPagina}
            alGestionar={(alerta) => {
              setYaGestionada(false);
              setEnGestion(alerta);
            }}
          />
        </Paper>
      )}
      {enGestion && (
        <DialogoGestionar
          key={enGestion.id}
          alerta={enGestion}
          alCerrar={() => setEnGestion(null)}
          alYaGestionada={() => {
            setEnGestion(null);
            setYaGestionada(true);
          }}
        />
      )}
    </Box>
  );
}
