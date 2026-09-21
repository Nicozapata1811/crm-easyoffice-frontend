/**
 * Placeholder data for the portal screens.
 *
 * Every value here is invented. No real client, company, RUT or address
 * belongs in this repository, which is public.
 *
 * None of it is wired to the API: the backend exposes no trámite endpoints
 * yet. This module exists so the screens can be built and validated with the
 * counterpart, and it is deleted once the endpoints land.
 *
 * ASSUMPTION: pending validation with Easy Office. Services, prices, states
 * and timeline steps all come from the prototype and none of them is
 * confirmed.
 */

import type { TonoEstado } from "../../components/EstadoPill";

export const CLIENTE_DEMO = {
  nombre: "Constructora Ríos Ltda.",
  iniciales: "CR",
  rut: "76245891-8",
  representante: "Marcela Ríos Fuentes",
};

export interface ServicioDemo {
  id: string;
  nombre: string;
  descripcion: string;
  disponible: boolean;
  metaEtiqueta: string;
  metaValor: string;
  ruta?: string;
}

export const SERVICIOS_DEMO: ServicioDemo[] = [
  {
    id: "domicilio-tributario",
    nombre: "Domicilio tributario",
    descripcion: "Formaliza o cambia el domicilio tributario de tu empresa ante el SII.",
    disponible: true,
    metaEtiqueta: "Tiempo estimado",
    metaValor: "< 10 min",
    ruta: "/tramites/domicilio-tributario/nuevo",
  },
  {
    id: "inicio-actividades",
    nombre: "Inicio de actividades",
    descripcion: "Formulario configurado para declarar inicio de actividades comerciales.",
    disponible: true,
    metaEtiqueta: "Tiempo estimado",
    metaValor: "~15 min",
  },
  {
    id: "poder-simple",
    nombre: "Poder simple notarial",
    descripcion: "Genera un poder simple con firma electrónica avanzada de las partes.",
    disponible: true,
    metaEtiqueta: "Tiempo estimado",
    metaValor: "~8 min",
  },
  {
    id: "renovacion-patente",
    nombre: "Renovación de patente",
    descripcion: "Se incorporará al motor configurable en una próxima etapa.",
    disponible: false,
    metaEtiqueta: "Estado",
    metaValor: "Fuera del MVP",
  },
  {
    id: "constitucion-empresa",
    nombre: "Constitución de empresa",
    descripcion: "Requiere siempre revisión de un ejecutivo Easy Office.",
    disponible: false,
    metaEtiqueta: "Estado",
    metaValor: "Con intervención humana",
  },
];

export interface TramiteDemo {
  folio: string;
  tramite: string;
  iniciado: string;
  estado: string;
  tono: TonoEstado;
  documento: string;
  documentoDisponible: boolean;
}

export const TRAMITES_DEMO: TramiteDemo[] = [
  {
    folio: "N° 0148",
    tramite: "Domicilio tributario",
    iniciado: "8 sep 2026",
    estado: "Pendiente de firma",
    tono: "progreso",
    documento: "Disponible al firmar",
    documentoDisponible: false,
  },
  {
    folio: "N° 0141",
    tramite: "Inicio de actividades",
    iniciado: "2 sep 2026",
    estado: "Falta pago",
    tono: "espera",
    documento: "Disponible al pagar",
    documentoDisponible: false,
  },
  {
    folio: "N° 0119",
    tramite: "Poder simple notarial",
    iniciado: "24 ago 2026",
    estado: "Completado",
    tono: "completo",
    documento: "Descargar PDF",
    documentoDisponible: true,
  },
  {
    folio: "N° 0098",
    tramite: "Domicilio tributario",
    iniciado: "10 ago 2026",
    estado: "Completado",
    tono: "completo",
    documento: "Descargar PDF",
    documentoDisponible: true,
  },
];

export const LINEA_TIEMPO_DEMO = [
  { titulo: "Documento generado", meta: "8 sep · 09:14", estado: "done" as const },
  { titulo: "Pago confirmado", meta: "8 sep · 09:16 · Webpay Plus", estado: "done" as const },
  {
    titulo: "Enviado al proveedor de firma",
    meta: "8 sep · 09:17 · esperando firmante",
    estado: "current" as const,
  },
  {
    titulo: "Documento firmado y verificado",
    meta: "El hash SHA-256 se genera al firmar",
    estado: "pending" as const,
  },
];

/** Example figures only. Pricing is not confirmed by Easy Office. */
export const COBROS_DEMO = [
  { concepto: "Domicilio tributario", monto: 14900 },
  { concepto: "Firma electrónica avanzada", monto: 3500 },
];

export function formatearPesos(monto: number): string {
  return `$${monto.toLocaleString("es-CL")}`;
}
