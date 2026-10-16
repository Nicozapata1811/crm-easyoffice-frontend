import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  cambiarFechaInicio,
  descargarDocumento,
  listarDocumentos,
  obtenerFormularioDomicilio,
  obtenerTramite,
} from "../../../api/tramites";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { guardarArchivo } from "../../../lib/descargar";
import { formatearFecha, formatearFechaHora } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { Tramite } from "../../../types/tramites";
import { etiquetaCliente, tituloEvento } from "../../tramites/estados";
import { erroresDeCampo } from "../../tramites/errores";

const CONSULTAR_CADA_MS = 4000;

/** Where the client's case stands, what it waits for, and its history (HU-28). */
export function EstadoTramite() {
  const id = Number(useParams().tramiteId);
  const tramite = useQuery({
    queryKey: ["portal", "tramites", id],
    queryFn: ({ signal }) => obtenerTramite(id, signal),
    refetchInterval: (query) => (query.state.data?.estado === "iniciado" ? CONSULTAR_CADA_MS : false),
  });
  const documentos = useQuery({
    queryKey: ["portal", "tramites", id, "documentos", tramite.data?.eventos.length],
    queryFn: ({ signal }) => listarDocumentos(id, signal),
    enabled: tramite.data !== undefined,
  });

  if (tramite.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando el trámite" />
      </Box>
    );
  }
  if (tramite.isError) {
    return <Alert severity="error">No encontramos este trámite.</Alert>;
  }

  const datos = tramite.data;
  const { etiqueta, tono } = etiquetaCliente(datos);
  const vigente = documentos.data?.find((documento) => documento.estado !== "reemplazado");
  const contrato = datos.contrato;

  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <PageHeading
        titulo={`Trámite ${datos.folio}`}
        bajada={`${datos.tipo}${contrato ? ` · contrato ${contrato.folio}` : ""}`}
      />

      <Paper sx={{ p: 3, mb: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Typography variant="h2">{etiqueta}</Typography>
          <EstadoPill etiqueta={datos.estado === "completado" ? "Completado" : "En curso"} tono={tono} />
        </Box>
        <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
          {datos.estado === "completado"
            ? "Tu contrato está firmado y vigente."
            : datos.estado === "iniciado"
              ? "Estamos generando el borrador de tu contrato."
              : datos.motivo?.texto_cliente}
        </Typography>
        <Acciones tramite={datos} />
      </Paper>

      <Paper sx={{ p: 3.25, mb: 2.5 }}>
        <SectionHeading texto="Línea de tiempo" primera />
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
          {datos.eventos.map((evento, indice) => {
            const ultimo = indice === datos.eventos.length - 1;
            return (
              <Box component="li" key={`${evento.fecha}-${indice}`} sx={{ display: "flex", gap: 2, pb: ultimo ? 0 : 2.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    mt: 0.5,
                    borderRadius: "50%",
                    flex: "none",
                    bgcolor: ultimo && datos.estado !== "completado" ? tokens.gold : tokens.success,
                  }}
                />
                <Box>
                  <Typography sx={{ fontSize: 13.8, fontWeight: 600 }}>
                    {tituloEvento(evento.estado_nuevo, evento.motivo_nuevo, indice === 0)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>
                    {formatearFechaHora(evento.fecha)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {contrato && (
        <Paper sx={{ p: 3.25, mb: 2.5 }}>
          <SectionHeading texto="Contrato" primera />
          <Typography sx={{ fontSize: 13 }}>
            {contrato.servicio} en {contrato.sucursal?.direccion ?? "—"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
            Vigencia: {formatearFecha(contrato.fecha_inicio)} al {formatearFecha(contrato.fecha_vencimiento)}
          </Typography>
        </Paper>
      )}

      {vigente && (
        <Paper sx={{ p: 3.25 }}>
          <SectionHeading texto="Firmantes" primera />
          {vigente.firmantes.map((firmante) => (
            <Box
              key={firmante.orden}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25, fontSize: 13 }}
            >
              <span>
                {firmante.nombre} —{" "}
                {firmante.rol === "cliente_representante" ? "Representante legal" : "Propietario de la oficina"}
              </span>
              <EstadoPill
                etiqueta={firmante.firmado_en ? "Firmado" : "Pendiente"}
                tono={firmante.firmado_en ? "completo" : "progreso"}
              />
            </Box>
          ))}
          {vigente.tiene_firmado && <DescargaFirmado tramiteId={datos.id} documentoId={vigente.id} />}
        </Paper>
      )}
    </Box>
  );
}

function Acciones({ tramite }: { tramite: Tramite }) {
  if (tramite.accion_cliente === "revisar_borrador") {
    return (
      <Button variant="contained" sx={{ mt: 2 }} component={RouterLink} to={`/tramites/${tramite.id}/documento`}>
        Revisar el borrador
      </Button>
    );
  }
  if (tramite.accion_cliente === "pagar") {
    return (
      <Button variant="contained" sx={{ mt: 2 }} component={RouterLink} to={`/tramites/${tramite.id}/pago`}>
        Ir al pago
      </Button>
    );
  }
  if (tramite.accion_cliente === "nueva_fecha") {
    return <NuevaFecha tramite={tramite} />;
  }
  return null;
}

/** After payment the chosen start date passed: the client picks a new one. */
function NuevaFecha({ tramite }: { tramite: Tramite }) {
  const queryClient = useQueryClient();
  const limites = useQuery({
    queryKey: ["portal", "tramites", "formulario-domicilio"],
    queryFn: ({ signal }) => obtenerFormularioDomicilio(signal),
  });
  const [fecha, setFecha] = useState("");
  const cambiar = useMutation({
    mutationFn: () => cambiarFechaInicio(tramite.id, fecha),
    onSuccess: (actualizado) => queryClient.setQueryData(["portal", "tramites", tramite.id], actualizado),
  });
  const errorFecha = erroresDeCampo(cambiar.error).find(([ruta]) => ruta === "fecha_inicio")?.[1];

  return (
    <Box
      component="form"
      sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 2, flexWrap: "wrap" }}
      onSubmit={(event) => {
        event.preventDefault();
        cambiar.mutate();
      }}
    >
      <TextField
        type="date"
        size="small"
        label="Nueva fecha de inicio"
        value={fecha}
        onChange={(event) => setFecha(event.target.value)}
        error={Boolean(errorFecha)}
        helperText={errorFecha ?? " "}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: limites.data?.fecha_min, max: limites.data?.fecha_max },
        }}
      />
      <Button type="submit" variant="contained" disabled={!fecha || cambiar.isPending}>
        Guardar fecha
      </Button>
      {cambiar.isError && !errorFecha && (
        <Alert severity="error" sx={{ width: "100%" }}>
          No pudimos guardar la fecha. Intenta nuevamente.
        </Alert>
      )}
    </Box>
  );
}

function DescargaFirmado({ tramiteId, documentoId }: { tramiteId: number; documentoId: number }) {
  const descarga = useMutation({
    mutationFn: () => descargarDocumento(tramiteId, documentoId, "firmado"),
    onSuccess: ({ blob, nombreArchivo }) => guardarArchivo(blob, nombreArchivo ?? "contrato-firmado.pdf"),
  });
  return (
    <Button variant="contained" sx={{ mt: 2 }} disabled={descarga.isPending} onClick={() => descarga.mutate()}>
      Descargar contrato firmado
    </Button>
  );
}
