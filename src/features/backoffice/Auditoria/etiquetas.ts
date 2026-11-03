import type { AccionAuditoria, EntradaAuditoria, OrigenAuditoria } from "../../../types/auditoria";
import type { OpcionFiltro } from "./entidades";

const ETIQUETA_ACCION: Record<AccionAuditoria, string> = {
  crear: "Creación",
  modificar: "Modificación",
  eliminar: "Eliminación",
  inicio_sesion: "Inicio de sesión",
  cierre_sesion: "Cierre de sesión",
  inicio_sesion_fallido: "Inicio de sesión fallido",
  descarga_documento: "Descarga de documento",
  acceso_documento_identidad: "Acceso a documento de identidad",
  reenvio_firma: "Reenvío del enlace de firma",
  cancelacion_firma: "Cancelación de la firma",
  reintento_firma: "Reintento de la firma",
};

const ETIQUETA_ORIGEN: Record<OrigenAuditoria, string> = {
  api: "Backoffice",
  portal: "Portal del cliente",
  admin: "Panel de administración",
  sistema: "Sistema",
};

const aOpciones = (etiquetas: Record<string, string>): OpcionFiltro[] =>
  Object.entries(etiquetas).map(([valor, etiqueta]) => ({ valor, etiqueta }));

export const OPCIONES_ACCION = aOpciones(ETIQUETA_ACCION);
export const OPCIONES_ORIGEN = aOpciones(ETIQUETA_ORIGEN);

// A value the backend adds later reads raw rather than blank.
export const etiquetaAccion = (accion: string) =>
  ETIQUETA_ACCION[accion as AccionAuditoria] ?? accion;

export const etiquetaOrigen = (origen: string) =>
  ETIQUETA_ORIGEN[origen as OrigenAuditoria] ?? origen;

/**
 * Who acted. Without a user the system did, except on a failed sign-in: the
 * backend leaves it empty because who tried is unknown.
 */
export function etiquetaUsuario({ usuario_nombre, accion }: EntradaAuditoria): string {
  if (usuario_nombre) return usuario_nombre;
  return accion === "inicio_sesion_fallido" ? "Sin identificar" : "Sistema";
}
