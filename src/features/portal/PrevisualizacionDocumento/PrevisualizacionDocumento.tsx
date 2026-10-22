import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import {
  confirmarTramite,
  descargarDocumento,
  listarDocumentos,
  obtenerTramite,
} from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { guardarArchivo } from "../../../lib/descargar";
import { formatearFecha, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { Documento, Tramite } from "../../../types/tramites";
import { codigoDeConflicto } from "../../tramites/errores";
import { VisorPdf } from "../../tramites/VisorPdf";

const CONSULTAR_CADA_MS = 2000;

const ROL_FIRMANTE: Record<Documento["firmantes"][number]["rol"], string> = {
  cliente_representante: "Representante legal de tu empresa",
  autorizante: "Propietario de la oficina (autoriza el domicilio)",
};

/** The real generated draft (HU-26) and the client's confirmation (HU-27). */
export function PrevisualizacionDocumento() {
  const id = Number(useParams().tramiteId);
  const tramite = useQuery({
    queryKey: ["portal", "tramites", id],
    queryFn: ({ signal }) => obtenerTramite(id, signal),
    // The document is generated in the background: wait for it.
    refetchInterval: (query) => (query.state.data?.estado === "iniciado" ? CONSULTAR_CADA_MS : false),
  });
  const listo = tramite.data !== undefined && tramite.data.estado !== "iniciado";
  const documentos = useQuery({
    queryKey: ["portal", "tramites", id, "documentos", tramite.data?.eventos.length],
    queryFn: ({ signal }) => listarDocumentos(id, signal),
    enabled: listo,
  });
  const vigente = documentos.data?.find((documento) => documento.estado !== "reemplazado");

  if (tramite.isError) {
    return <Alert severity="error">No encontramos este trámite.</Alert>;
  }
  if (!tramite.data || tramite.data.estado === "iniciado") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 10 }}>
        <CircularProgress aria-label="Generando el borrador" />
        <Typography sx={{ color: tokens.inkSoft }}>Estamos generando el borrador de tu contrato…</Typography>
      </Box>
    );
  }
  if (tramite.data.motivo?.codigo === "falta_informacion") {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo={`Trámite ${tramite.data.folio}`} />
        <Alert severity="info">
          {tramite.data.motivo.texto_cliente}{" "}
          <RouterLink to={`/tramites/${id}`}>Ver el estado del trámite</RouterLink>
        </Alert>
      </Box>
    );
  }
  return <Borrador tramite={tramite.data} documento={vigente} cargando={documentos.isPending} />;
}

function Borrador({
  tramite,
  documento,
  cargando,
}: {
  tramite: Tramite;
  documento?: Documento;
  cargando: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const word = useMutation({
    mutationFn: () => descargarDocumento(tramite.id, documento!.id, "docx"),
    onSuccess: ({ blob, nombreArchivo }) => guardarArchivo(blob, nombreArchivo ?? "contrato.docx"),
  });
  const confirmar = useMutation({
    mutationFn: () => confirmarTramite(tramite.id),
    onSuccess: (actualizado) => {
      queryClient.setQueryData(["portal", "tramites", tramite.id], actualizado);
      navigate(`/tramites/${tramite.id}/pago`);
    },
  });
  const contrato = tramite.contrato;
  const conflicto = codigoDeConflicto(confirmar.error);

  return (
    <>
      <PageHeading
        titulo="Revisa el borrador de tu contrato"
        bajada="Es el documento real que se firmará. Si algo no está bien, edita los datos y lo generamos de nuevo."
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: 3, alignItems: "start" }}>
        <Paper sx={{ p: 1, minHeight: 480 }}>
          <VisorPdf
            clave={["tramite", tramite.id, "documento", documento?.id, "pdf"]}
            obtener={() => descargarDocumento(tramite.id, documento!.id, "pdf")}
            habilitado={documento !== undefined}
            titulo="Borrador del contrato"
            error="No pudimos mostrar el borrador. Descárgalo en Word para revisarlo."
          />
        </Paper>

        <Paper sx={{ p: 2.75 }}>
          <Typography variant="h3" sx={{ fontSize: 14.5, mb: 1.5 }}>
            Resumen
          </Typography>
          {contrato && (
            <Box component="dl" sx={{ m: 0, fontSize: 13, "& dt": { color: tokens.inkSoft, mt: 1.25 }, "& dd": { m: 0 } }}>
              <dt>Contrato</dt>
              <dd>{contrato.folio}</dd>
              <dt>Servicio</dt>
              <dd>
                {contrato.servicio} · {contrato.duracion_meses} meses
              </dd>
              <dt>Domicilio</dt>
              <dd>{contrato.sucursal ? `${contrato.sucursal.nombre}: ${contrato.sucursal.direccion}` : "—"}</dd>
              <dt>Vigencia</dt>
              <dd>
                {formatearFecha(contrato.fecha_inicio)} al {formatearFecha(contrato.fecha_vencimiento)}
              </dd>
              {contrato.precio && (
                <>
                  <dt>Precio del servicio</dt>
                  <dd>
                    {formatearPesos(Number(contrato.precio))}, pago {contrato.ciclo_pago.toLowerCase()}
                  </dd>
                </>
              )}
            </Box>
          )}
          {documento && (
            <>
              <Typography sx={{ fontSize: 13, color: tokens.inkSoft, mt: 2 }}>Firmarán</Typography>
              {documento.firmantes.map((firmante) => (
                <Typography key={firmante.orden} sx={{ fontSize: 13 }}>
                  {firmante.nombre} — {ROL_FIRMANTE[firmante.rol]}
                </Typography>
              ))}
              <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 1.5 }}>
                Versión {documento.version}. El total a pagar aparece en el siguiente paso.
              </Typography>
            </>
          )}
          {cargando && !documento && <CircularProgress size={20} aria-label="Cargando el documento" />}

          {conflicto === "fecha_inicio_vencida" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              La fecha de inicio ya pasó.{" "}
              <RouterLink to={`/tramites/${tramite.id}/editar`}>Elige una nueva</RouterLink>.
            </Alert>
          )}
          {confirmar.isError && conflicto !== "fecha_inicio_vencida" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              No pudimos confirmar el borrador. Intenta nuevamente.
            </Alert>
          )}

          {tramite.accion_cliente === "revisar_borrador" && (
            <>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2.25 }}
                disabled={confirmar.isPending || !documento}
                onClick={() => confirmar.mutate()}
              >
                {confirmar.isPending ? "Confirmando…" : "Los datos están correctos, continuar al pago"}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                component={RouterLink}
                to={`/tramites/${tramite.id}/editar`}
              >
                Editar datos
              </Button>
            </>
          )}
          {tramite.accion_cliente === "pagar" && (
            <Button fullWidth variant="contained" sx={{ mt: 2.25 }} component={RouterLink} to={`/tramites/${tramite.id}/pago`}>
              Ir al pago
            </Button>
          )}
          <Button
            fullWidth
            variant="text"
            sx={{ mt: 1 }}
            disabled={!documento || word.isPending}
            onClick={() => word.mutate()}
          >
            Descargar en Word
          </Button>
        </Paper>
      </Box>
    </>
  );
}
