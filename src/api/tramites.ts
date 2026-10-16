import type { Pagina } from "../types/cliente";
import type {
  ArchivoDocumento,
  Documento,
  EstadoTramite,
  FormularioDomicilio,
  SolicitudDomicilio,
  Tramite,
  TramiteBackoffice,
} from "../types/tramites";
import { api } from "./client";

// --- Portal (the client's own cases) ----------------------------------------

export function obtenerFormularioDomicilio(signal?: AbortSignal): Promise<FormularioDomicilio> {
  return api.get("/portal/tramites/domicilio/formulario/", signal);
}

export function crearDomicilio(solicitud: SolicitudDomicilio): Promise<Tramite> {
  return api.post("/portal/tramites/domicilio/", solicitud);
}

export function editarDomicilio(tramiteId: number, solicitud: SolicitudDomicilio): Promise<Tramite> {
  return api.put(`/portal/tramites/${tramiteId}/domicilio/`, solicitud);
}

export function cambiarFechaInicio(tramiteId: number, fechaInicio: string): Promise<Tramite> {
  return api.post(`/portal/tramites/${tramiteId}/fecha-inicio/`, { fecha_inicio: fechaInicio });
}

export function confirmarTramite(tramiteId: number): Promise<Tramite> {
  return api.post(`/portal/tramites/${tramiteId}/confirmar/`);
}

export function listarTramites(signal?: AbortSignal): Promise<Pagina<Tramite>> {
  return api.get("/portal/tramites/", signal);
}

export function obtenerTramite(tramiteId: number, signal?: AbortSignal): Promise<Tramite> {
  return api.get(`/portal/tramites/${tramiteId}/`, signal);
}

export function listarDocumentos(tramiteId: number, signal?: AbortSignal): Promise<Documento[]> {
  return api.get(`/portal/tramites/${tramiteId}/documentos/`, signal);
}

export function descargarDocumento(tramiteId: number, documentoId: number, tipo: ArchivoDocumento) {
  return api.descargar(`/portal/tramites/${tramiteId}/documentos/${documentoId}/${tipo}/`);
}

// --- Backoffice ---------------------------------------------------------------

export interface FiltrosTramites {
  buscar?: string;
  estado?: EstadoTramite | "";
  motivo?: string;
  pagina?: number;
}

export function listarTramitesBackoffice(
  { buscar, estado, motivo, pagina }: FiltrosTramites,
  signal?: AbortSignal,
): Promise<Pagina<TramiteBackoffice>> {
  const params = new URLSearchParams();
  if (buscar) params.set("buscar", buscar);
  if (estado) params.set("estado", estado);
  if (motivo) params.set("motivo", motivo);
  if (pagina && pagina > 1) params.set("page", String(pagina));
  const query = params.toString();
  return api.get(`/tramites/${query ? `?${query}` : ""}`, signal);
}

export function obtenerTramiteBackoffice(tramiteId: number, signal?: AbortSignal): Promise<TramiteBackoffice> {
  return api.get(`/tramites/${tramiteId}/`, signal);
}

export function regenerarDocumento(tramiteId: number): Promise<TramiteBackoffice> {
  return api.post(`/tramites/${tramiteId}/regenerar/`);
}

export function listarDocumentosBackoffice(tramiteId: number, signal?: AbortSignal): Promise<Documento[]> {
  return api.get(`/tramites/${tramiteId}/documentos/`, signal);
}

export function descargarDocumentoBackoffice(
  tramiteId: number,
  documentoId: number,
  tipo: ArchivoDocumento,
) {
  return api.descargar(`/tramites/${tramiteId}/documentos/${documentoId}/${tipo}/`);
}

export function subirDocumentoFirmado(tramiteId: number, documentoId: number, archivo: File): Promise<Documento> {
  const formulario = new FormData();
  formulario.append("archivo", archivo);
  return api.enviarFormulario(`/tramites/${tramiteId}/documentos/${documentoId}/firmado/subir/`, formulario);
}
