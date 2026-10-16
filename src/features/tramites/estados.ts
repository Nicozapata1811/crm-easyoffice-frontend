/**
 * How a case's state reads, for the client and for staff (RN-42).
 *
 * ASSUMPTION: pending validation with Easy Office. The wording is ours; the
 * reasons (TA-13) are not a closed list yet.
 */

import type { TonoEstado } from "../../components/EstadoPill";
import type { CodigoMotivo, EstadoTramite } from "../../types/tramites";

interface Situacion {
  estado: EstadoTramite;
  motivo: { codigo: CodigoMotivo } | null;
}

interface Etiqueta {
  etiqueta: string;
  tono: TonoEstado;
}

const PENDIENTE_CLIENTE: Record<CodigoMotivo, Etiqueta> = {
  revision_borrador: { etiqueta: "Revisa el borrador", tono: "espera" },
  pago: { etiqueta: "Falta el pago", tono: "espera" },
  firma: { etiqueta: "En firma", tono: "progreso" },
  falta_informacion: { etiqueta: "En revisión", tono: "espera" },
};

const PENDIENTE_STAFF: Record<CodigoMotivo, Etiqueta> = {
  ...PENDIENTE_CLIENTE,
  revision_borrador: { etiqueta: "Revisión del borrador", tono: "espera" },
  falta_informacion: { etiqueta: "Falta información", tono: "espera" },
};

function etiquetar(situacion: Situacion, pendientes: Record<CodigoMotivo, Etiqueta>): Etiqueta {
  if (situacion.estado === "completado") return { etiqueta: "Completado", tono: "completo" };
  if (situacion.estado === "iniciado") return { etiqueta: "Generando documento", tono: "progreso" };
  return situacion.motivo
    ? pendientes[situacion.motivo.codigo]
    : { etiqueta: "Pendiente", tono: "espera" };
}

export const etiquetaCliente = (situacion: Situacion) => etiquetar(situacion, PENDIENTE_CLIENTE);

export const etiquetaStaff = (situacion: Situacion) => etiquetar(situacion, PENDIENTE_STAFF);

/** One step of a case's history, as the timeline shows it. */
export function tituloEvento(estado: EstadoTramite, motivo: CodigoMotivo | "", primero = true): string {
  if (estado === "iniciado") {
    return primero
      ? "Solicitud recibida, generando el documento"
      : "Datos actualizados, generando el documento de nuevo";
  }
  if (estado === "completado") return "Contrato firmado";
  switch (motivo) {
    case "revision_borrador":
      return "Borrador listo para revisar";
    case "pago":
      return "Borrador confirmado, falta el pago";
    case "firma":
      return "Pago recibido, contrato en firma";
    case "falta_informacion":
      return "En revisión por Easy Office";
    default:
      return "Pendiente";
  }
}

export const MOTIVOS: { codigo: CodigoMotivo; nombre: string }[] = [
  { codigo: "revision_borrador", nombre: "Revisión del borrador" },
  { codigo: "pago", nombre: "Pago" },
  { codigo: "firma", nombre: "Firma" },
  { codigo: "falta_informacion", nombre: "Falta información" },
];
