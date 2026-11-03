/** Shapes of /api/auditoria/ (backend README, "Registro de auditoría"). */

export type AccionAuditoria =
  | "crear"
  | "modificar"
  | "eliminar"
  | "inicio_sesion"
  | "cierre_sesion"
  | "inicio_sesion_fallido"
  | "descarga_documento"
  | "acceso_documento_identidad"
  | "reenvio_firma"
  | "cancelacion_firma"
  | "reintento_firma";

export type OrigenAuditoria = "api" | "portal" | "admin" | "sistema";

export type ValoresAuditoria = Record<string, unknown> | null;

export interface EntradaAuditoria {
  id: number;
  fecha_hora: string;
  usuario: number | null;
  usuario_nombre: string | null;
  origen: OrigenAuditoria;
  accion: AccionAuditoria;
  entidad: string;
  entidad_nombre: string;
  registro_id: number | null;
  registro_nombre: string | null;
  valor_anterior: ValoresAuditoria;
  valor_nuevo: ValoresAuditoria;
  direccion_ip: string | null;
}
