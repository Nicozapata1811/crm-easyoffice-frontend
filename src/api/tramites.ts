import type { Pagina } from "../types/cliente";
import type {
  ArchivoDocumento,
  Documento,
  EstadoTramite,
  FormularioDomicilio,
  FormularioPortal,
  FormularioTramite,
  NuevaSolicitudTramite,
  SolicitudDomicilio,
  SolicitudPortal,
  SolicitudTramite,
  TipoTramiteIniciable,
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

/** The form of any type sold online by plan (the bodega, PLT-02). */
export function obtenerFormularioPortal(tipo: string, signal?: AbortSignal): Promise<FormularioPortal> {
  const params = new URLSearchParams({ tipo });
  return api.get(`/portal/tramites/formulario/?${params.toString()}`, signal);
}

export function crearTramitePortal(tipo: string, solicitud: SolicitudPortal): Promise<Tramite> {
  return api.post("/portal/tramites/", { ...solicitud, tipo });
}

export function editarTramitePortal(tramiteId: number, solicitud: SolicitudPortal): Promise<Tramite> {
  return api.put(`/portal/tramites/${tramiteId}/`, solicitud);
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

// --- Backoffice: cases an executive starts for a client (PLT-02) -------------

export function listarTiposIniciables(signal?: AbortSignal): Promise<TipoTramiteIniciable[]> {
  return api.get("/tramites/tipos/?canal=backoffice", signal);
}

export function obtenerFormularioTramite(
  tipo: string,
  clienteId: number,
  signal?: AbortSignal,
): Promise<FormularioTramite> {
  const params = new URLSearchParams({ tipo, cliente: String(clienteId) });
  return api.get(`/tramites/formulario/?${params.toString()}`, signal);
}

export function crearTramiteBackoffice(solicitud: NuevaSolicitudTramite): Promise<TramiteBackoffice> {
  return api.post("/tramites/", solicitud);
}

export function editarTramiteBackoffice(
  tramiteId: number,
  solicitud: SolicitudTramite,
): Promise<TramiteBackoffice> {
  return api.put(`/tramites/${tramiteId}/`, solicitud);
}

export function confirmarTramiteBackoffice(tramiteId: number): Promise<TramiteBackoffice> {
  return api.post(`/tramites/${tramiteId}/confirmar/`);
}

export function cambiarFechaInicioBackoffice(tramiteId: number, fechaInicio: string): Promise<TramiteBackoffice> {
  return api.post(`/tramites/${tramiteId}/fecha-inicio/`, { fecha_inicio: fechaInicio });
}
