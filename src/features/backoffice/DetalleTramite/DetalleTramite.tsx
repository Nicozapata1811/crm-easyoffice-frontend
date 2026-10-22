import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  cambiarFechaInicioBackoffice,
  confirmarTramiteBackoffice,
  descargarDocumentoBackoffice,
  listarDocumentosBackoffice,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
  regenerarDocumento,
  subirDocumentoFirmado,
} from "../../../api/tramites";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { guardarArchivo } from "../../../lib/descargar";
import { formatearFecha, formatearFechaHora, formatearPesos } from "../../../lib/formato";
import type { ArchivoDocumento, Documento, TramiteBackoffice } from "../../../types/tramites";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { etiquetaStaff, tituloEvento } from "../../tramites/estados";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { FormularioNuevaFecha } from "../../tramites/FormularioNuevaFecha";
import { VisorPdf } from "../../tramites/VisorPdf";

const NUEVA_FECHA = "La fecha de inicio ya pasó";

const ESTADO_DOCUMENTO: Record<Documento["estado"], string> = {
  generado: "Vigente",
  reemplazado: "Reemplazado",
  firmado: "Firmado",
};

/** A case with its pending reason, history and documents (HU-11, HU-61). */
export function DetalleTramite() {
  const id = Number(useParams().tramiteId);
  const tramite = useQuery({
    queryKey: ["tramites", id],
    queryFn: ({ signal }) => obtenerTramiteBackoffice(id, signal),
    refetchInterval: (query) => (query.state.data?.estado === "iniciado" ? 3000 : false),
  });

  if (tramite.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="Cargando trámite" />
      </Box>
    );
  }
  if (tramite.isError) return <Alert severity="error">No encontramos este trámite.</Alert>;
  return <Detalle tramite={tramite.data} />;
}

function Detalle({ tramite }: { tramite: TramiteBackoffice }) {
  const { data: usuario } = useSesion();
  const queryClient = useQueryClient();
  const documentos = useQuery({
    queryKey: ["tramites", tramite.id, "documentos", tramite.eventos.length],
    queryFn: ({ signal }) => listarDocumentosBackoffice(tramite.id, signal),
    enabled: tienePermiso(usuario, PERMISOS.verDocumentos),
  });
  const regenerar = useMutation({
    mutationFn: () => regenerarDocumento(tramite.id),
    onSuccess: (actualizado) => queryClient.setQueryData(["tramites", tramite.id], actualizado),
  });
  const contrato = tramite.contrato;
  const faltaInformacion = tramite.motivo?.codigo === "falta_informacion";
  const pideNuevaFecha = faltaInformacion && tramite.detalle_pendiente.startsWith(NUEVA_FECHA);
  // The executive moves the cases started in the backoffice; in a portal
  // case a passed start date waits for the client.
  const delBackoffice = tramite.canal === "backoffice";
  const puedeGestionar = tienePermiso(usuario, PERMISOS.gestionarTramites);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <PageHeading titulo={`Trámite ${tramite.folio}`} bajada={`${tramite.tipo} · ${formatearFechaHora(tramite.created_at)}`} />
        <EstadoPill {...etiquetaStaff(tramite)} />
      </Box>

      {tramite.estado === "pendiente" && tramite.motivo && (
        <Alert severity={faltaInformacion ? "warning" : "info"} sx={{ mb: 3, whiteSpace: "pre-line" }}>
          <strong>Pendiente: {tramite.motivo.nombre}.</strong>
          {tramite.detalle_pendiente ? `\n${tramite.detalle_pendiente}` : ""}
          {faltaInformacion && !pideNuevaFecha && puedeGestionar && (
            <Box sx={{ mt: 1.5 }}>
              <Button size="small" variant="outlined" disabled={regenerar.isPending} onClick={() => regenerar.mutate()}>
                Generar el documento de nuevo
              </Button>
              <Typography sx={{ fontSize: 12, mt: 0.75 }}>
                Úsalo después de completar en el panel de administración los datos que faltan.
              </Typography>
            </Box>
          )}
          {pideNuevaFecha && delBackoffice && puedeGestionar && <NuevaFecha tramite={tramite} />}
        </Alert>
      )}
      {regenerar.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          No pudimos pedir el documento de nuevo.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <SectionHeading texto="Cliente" primera />
        <Link component={RouterLink} to={`/backoffice/clientes/${tramite.cliente.id}`}>
          {tramite.cliente.nombre}
        </Link>{" "}
        <Typography component="span" sx={{ color: "text.secondary", fontSize: 13 }}>
          {tramite.cliente.codigo} · RUT {tramite.cliente.rut}
        </Typography>

        {contrato && (
          <>
            <SectionHeading texto="Contrato" />
            <Typography sx={{ fontSize: 13.5 }}>
              {contrato.folio} ({contrato.estado}) · {formatearFecha(contrato.fecha_inicio)} al{" "}
              {formatearFecha(contrato.fecha_vencimiento)}
            </Typography>
            {contrato.servicios.map((linea) => (
              <Typography key={linea.nombre} sx={{ fontSize: 13, color: "text.secondary" }}>
                {linea.nombre} · {formatearPesos(Number(linea.precio))} {linea.ciclo_pago.toLowerCase()}
                {linea.inmueble ? ` · ${linea.inmueble.nombre}: ${linea.inmueble.direccion}` : ""}
              </Typography>
            ))}
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Avisos: {contrato.email_aviso} · +56 {contrato.movil_aviso}
            </Typography>
          </>
        )}
        {tramite.venta && (
          <>
            <SectionHeading texto="Venta" />
            <Link component={RouterLink} to={`/backoffice/ventas/${tramite.venta.id}`}>
              {tramite.venta.folio}
            </Link>{" "}
            <Typography component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
              {formatearPesos(Number(tramite.venta.total))} · {tramite.venta.estado.replace("_", " ")}
            </Typography>
          </>
        )}
      </Paper>

      {delBackoffice && tramite.motivo?.codigo === "revision_borrador" && tienePermiso(usuario, PERMISOS.verDocumentos) && (
        <Borrador
          tramite={tramite}
          documentoId={documentos.data?.find((documento) => documento.estado === "generado")?.id}
          puedeGestionar={puedeGestionar}
        />
      )}

      {tienePermiso(usuario, PERMISOS.verDocumentos) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <SectionHeading texto="Documentos" primera />
          {documentos.isPending && <CircularProgress size={22} aria-label="Cargando documentos" />}
          {documentos.data?.length === 0 && (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Aún no hay documentos.</Typography>
          )}
          {documentos.data?.map((documento) => (
            <FilaDocumento
              key={documento.id}
              tramite={tramite}
              documento={documento}
              puedeSubir={
                tienePermiso(usuario, PERMISOS.subirDocumentoFirmado) &&
                tramite.motivo?.codigo === "firma" &&
                documento.estado === "generado"
              }
            />
          ))}
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <SectionHeading texto="Historial" primera />
        <Table size="small" aria-label="Historial del trámite">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Paso</TableCell>
              <TableCell>Detalle</TableCell>
              <TableCell>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tramite.eventos.map((evento, indice) => (
              <TableRow key={`${evento.fecha}-${indice}`}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearFechaHora(evento.fecha)}</TableCell>
                <TableCell>{tituloEvento(evento.estado_nuevo, evento.motivo_nuevo, indice === 0)}</TableCell>
                <TableCell sx={{ whiteSpace: "pre-line", color: "text.secondary" }}>{evento.detalle || "—"}</TableCell>
                <TableCell>{evento.usuario ?? "Sistema"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

/**
 * A backoffice case's draft: the executive reviews it with the client and
 * records their confirmation (RN-13), or edits the data to generate it again.
 */
function Borrador({
  tramite,
  documentoId,
  puedeGestionar,
}: {
  tramite: TramiteBackoffice;
  documentoId?: number;
  puedeGestionar: boolean;
}) {
  const queryClient = useQueryClient();
  const confirmar = useMutation({
    mutationFn: () => confirmarTramiteBackoffice(tramite.id),
    onSuccess: (actualizado) => queryClient.setQueryData(["tramites", tramite.id], actualizado),
  });
  const conflicto = codigoDeConflicto(confirmar.error);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <SectionHeading texto="Borrador para revisar con el cliente" primera />
      <Box sx={{ border: 1, borderColor: "divider", mb: 2 }}>
        <VisorPdf
          clave={["tramite", tramite.id, "documento", documentoId, "pdf"]}
          obtener={() => descargarDocumentoBackoffice(tramite.id, documentoId!, "pdf")}
          habilitado={documentoId !== undefined}
          titulo="Borrador del contrato"
          error="No pudimos mostrar el borrador. Descárgalo en Word para revisarlo."
        />
      </Box>
      {puedeGestionar && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            disabled={confirmar.isPending || documentoId === undefined}
            onClick={() => confirmar.mutate()}
          >
            {confirmar.isPending ? "Confirmando…" : "El cliente confirmó el borrador"}
          </Button>
          {tramite.editable && (
            <Button variant="outlined" component={RouterLink} to={`/backoffice/tramites/${tramite.id}/editar`}>
              Editar datos
            </Button>
          )}
        </Box>
      )}
      {confirmar.isError && (
        <Alert severity={conflicto ? "warning" : "error"} sx={{ mt: 2 }}>
          {conflicto === "fecha_inicio_vencida"
            ? "La fecha de inicio ya pasó: edita los datos y elige una nueva."
            : "No pudimos confirmar el borrador. Intenta nuevamente."}
        </Alert>
      )}
    </Paper>
  );
}

/** A backoffice case whose start date passed: the executive sets a new one. */
function NuevaFecha({ tramite }: { tramite: TramiteBackoffice }) {
  const queryClient = useQueryClient();
  const limites = useQuery({
    queryKey: ["tramites", "formulario", tramite.tipo_codigo, tramite.cliente.id],
    queryFn: ({ signal }) => obtenerFormularioTramite(tramite.tipo_codigo, tramite.cliente.id, signal),
  });
  return (
    <FormularioNuevaFecha
      fechaMin={limites.data?.fecha_min}
      fechaMax={limites.data?.fecha_max}
      guardar={(fecha) => cambiarFechaInicioBackoffice(tramite.id, fecha)}
      alGuardar={(actualizado: TramiteBackoffice) => queryClient.setQueryData(["tramites", tramite.id], actualizado)}
    />
  );
}

function FilaDocumento({
  tramite,
  documento,
  puedeSubir,
}: {
  tramite: TramiteBackoffice;
  documento: Documento;
  puedeSubir: boolean;
}) {
  const queryClient = useQueryClient();
  const [archivo, setArchivo] = useState<File | null>(null);
  const descargar = useMutation({
    mutationFn: (tipo: ArchivoDocumento) => descargarDocumentoBackoffice(tramite.id, documento.id, tipo),
    onSuccess: ({ blob, nombreArchivo }) => guardarArchivo(blob, nombreArchivo ?? "documento"),
  });
  const subir = useMutation({
    mutationFn: (pdf: File) => subirDocumentoFirmado(tramite.id, documento.id, pdf),
    onSuccess: () => {
      setArchivo(null);
      void queryClient.invalidateQueries({ queryKey: ["tramites", tramite.id] });
    },
  });
  const conflicto = codigoDeConflicto(subir.error);
  const errorArchivo = erroresDeCampo(subir.error)[0]?.[1];

  return (
    <Box sx={{ py: 1.5, borderBottom: 1, borderColor: "divider" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
          Versión {documento.version} · {documento.plantilla}
        </Typography>
        <EstadoPill
          etiqueta={ESTADO_DOCUMENTO[documento.estado]}
          tono={documento.estado === "firmado" ? "completo" : documento.estado === "generado" ? "progreso" : "neutro"}
        />
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{formatearFechaHora(documento.generado_en)}</Typography>
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={() => descargar.mutate("pdf")}>
          PDF
        </Button>
        <Button size="small" onClick={() => descargar.mutate("docx")}>
          Word
        </Button>
        {documento.tiene_firmado && (
          <Button size="small" onClick={() => descargar.mutate("firmado")}>
            Firmado
          </Button>
        )}
      </Box>
      <Typography sx={{ fontSize: 11.5, color: "text.hint", fontFamily: "monospace", wordBreak: "break-all" }}>
        SHA-256 PDF {documento.sha256_pdf}
        {documento.sha256_firmado && ` · firmado ${documento.sha256_firmado}`}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.5 }}>
        Firmantes:{" "}
        {documento.firmantes
          .map((f) => `${f.nombre} (${f.rol === "autorizante" ? "autorizante" : "representante"}${f.firmado_en ? ", firmó" : ""})`)
          .join(" · ")}
      </Typography>

      {puedeSubir && (
        <Box
          component="form"
          sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 1.5 }}
          onSubmit={(event) => {
            event.preventDefault();
            if (archivo) subir.mutate(archivo);
          }}
        >
          <Button variant="outlined" size="small" component="label">
            Elegir PDF firmado
            <input
              hidden
              type="file"
              accept="application/pdf"
              aria-label="PDF firmado"
              onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
            />
          </Button>
          <Typography sx={{ fontSize: 12.5 }}>{archivo?.name ?? "Ningún archivo elegido"}</Typography>
          <Button type="submit" variant="contained" size="small" disabled={!archivo || subir.isPending}>
            Subir PDF firmado
          </Button>
          {(errorArchivo || conflicto) && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {errorArchivo ??
                (conflicto === "fecha_inicio_vencida"
                  ? tramite.canal === "backoffice"
                    ? "La fecha de inicio ya pasó: elige una nueva antes de firmar."
                    : "La fecha de inicio ya pasó: el cliente debe elegir una nueva antes de firmar."
                  : "Este documento ya no espera una firma.")}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
