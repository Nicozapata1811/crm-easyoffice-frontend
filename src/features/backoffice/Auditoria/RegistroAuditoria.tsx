import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import { useSearchParams } from "react-router-dom";

import { ApiError } from "../../../api/client";
import { PageHeading } from "../../../components/PageHeading";
import { SinAcceso } from "../../../components/SinAcceso";
import { erroresDeCampo } from "../../tramites/errores";
import { FiltrosAuditoria } from "./FiltrosAuditoria";
import { CAMPOS_CON_ERROR, filtrosDesdeUrl } from "./filtrosUrl";
import { TablaAuditoria } from "./TablaAuditoria";
import { useRegistroAuditoria, useSinAcceso } from "./useAuditoria";

/** The audit log with its filters (HU-31, RF-17, UC-13). Read-only by design. */
export function RegistroAuditoria() {
  const [params, setParams] = useSearchParams();
  const filtros = filtrosDesdeUrl(params);
  const pagina = filtros.pagina ?? 1;
  const { data, isPending, error } = useRegistroAuditoria(filtros);
  const sinAcceso = useSinAcceso(error);

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
  const erroresPorCampo = Object.fromEntries(
    errores.filter(([campo]) => CAMPOS_CON_ERROR.includes(campo)),
  );
  const erroresSueltos = errores
    .filter(([campo]) => !CAMPOS_CON_ERROR.includes(campo))
    .map(([, mensaje]) => mensaje);
  const paginaInexistente = error instanceof ApiError && error.status === 404;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      <PageHeading
        titulo="Registro de auditoría"
        bajada="Quién hizo qué, cuándo y desde dónde, en hora de Chile. Este registro no se puede modificar."
      />
      <FiltrosAuditoria
        filtros={filtros}
        errores={erroresPorCampo}
        nombreUsuario={
          data?.results.find((entrada) => String(entrada.usuario) === filtros.usuario)?.usuario_nombre ??
          undefined
        }
        alCambiar={cambiarFiltros}
        alLimpiar={() => setParams(new URLSearchParams(), { replace: true })}
      />

      {errores.length > 0 && (
        <Alert severity="error">
          {erroresSueltos.length > 0
            ? erroresSueltos.join(" ")
            : "Corrige los filtros marcados para ver el registro."}
        </Alert>
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
        <Alert severity="error">No pudimos cargar el registro. Intenta nuevamente.</Alert>
      )}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando registro de auditoría" />
        </Box>
      )}
      {data && (
        <Paper>
          <TablaAuditoria
            etiqueta="Registro de auditoría"
            entradas={data.results}
            total={data.count}
            pagina={pagina}
            alCambiarPagina={irAPagina}
            mensajeVacio="No hay entradas con estos filtros."
          />
        </Paper>
      )}
    </Box>
  );
}
