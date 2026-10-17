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
  descargarDocumentoBackoffice,
  listarDocumentosBackoffice,
  obtenerTramiteBackoffice,
  regenerarDocumento,
  subirDocumentoFirmado,
} from "../../../api/tramites";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { guardarArchivo } from "../../../lib/descargar";
import { formatearFecha, formatearFechaHora, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { ArchivoDocumento, Documento, TramiteBackoffice } from "../../../types/tramites";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { etiquetaStaff, tituloEvento } from "../../tramites/estados";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";

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
  // A passed start date waits for the client, not for the executive.
  const esperaAlCliente = tramite.detalle_pendiente.startsWith("La fecha de inicio ya pasó");

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
          {faltaInformacion && !esperaAlCliente && tienePermiso(usuario, PERMISOS.gestionarTramites) && (
            <Box sx={{ mt: 1.5 }}>
              <Button size="small" variant="outlined" disabled={regenerar.isPending} onClick={() => regenerar.mutate()}>
                Generar el documento de nuevo
              </Button>
              <Typography sx={{ fontSize: 12, mt: 0.75 }}>
                Úsalo después de completar en el panel de administración los datos que faltan.
              </Typography>
            </Box>
          )}
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
        <Typography component="span" sx={{ color: tokens.inkSoft, fontSize: 13 }}>
          {tramite.cliente.codigo} · RUT {tramite.cliente.rut}
        </Typography>

        {contrato && (
          <>
            <SectionHeading texto="Contrato" />
            <Typography sx={{ fontSize: 13.5 }}>
              {contrato.folio} ({contrato.estado}) · {contrato.servicio}
              {contrato.precio ? ` · ${formatearPesos(Number(contrato.precio))} ${contrato.ciclo_pago.toLowerCase()}` : ""}
            </Typography>
            <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
              {contrato.sucursal ? `${contrato.sucursal.nombre}: ${contrato.sucursal.direccion}` : "—"} ·{" "}
              {formatearFecha(contrato.fecha_inicio)} al {formatearFecha(contrato.fecha_vencimiento)}
            </Typography>
            <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
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
            <Typography component="span" sx={{ fontSize: 13, color: tokens.inkSoft }}>
              {formatearPesos(Number(tramite.venta.total))} · {tramite.venta.estado.replace("_", " ")}
            </Typography>
          </>
        )}
      </Paper>

      {tienePermiso(usuario, PERMISOS.verDocumentos) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <SectionHeading texto="Documentos" primera />
          {documentos.isPending && <CircularProgress size={22} aria-label="Cargando documentos" />}
          {documentos.data?.length === 0 && (
            <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>Aún no hay documentos.</Typography>
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
                <TableCell sx={{ whiteSpace: "pre-line", color: tokens.inkSoft }}>{evento.detalle || "—"}</TableCell>
                <TableCell>{evento.usuario ?? "Sistema"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
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
    <Box sx={{ py: 1.5, borderBottom: `1px solid ${tokens.border}` }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>
          Versión {documento.version} · {documento.plantilla}
        </Typography>
        <EstadoPill
          etiqueta={ESTADO_DOCUMENTO[documento.estado]}
          tono={documento.estado === "firmado" ? "completo" : documento.estado === "generado" ? "progreso" : "espera"}
        />
        <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>{formatearFechaHora(documento.generado_en)}</Typography>
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
      <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, fontFamily: "monospace", wordBreak: "break-all" }}>
        SHA-256 PDF {documento.sha256_pdf}
        {documento.sha256_firmado && ` · firmado ${documento.sha256_firmado}`}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft, mt: 0.5 }}>
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
                  ? "La fecha de inicio ya pasó: el cliente debe elegir una nueva antes de firmar."
                  : "Este documento ya no espera una firma.")}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
