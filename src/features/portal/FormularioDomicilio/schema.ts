/**
 * Validation for the tax domicile form: the fields of PLT-01 the client
 * supplies (section A, shared in features/tramites/formulario) plus the
 * plan, the branch and the start date. Easy Office's branch, its address
 * and rol de avalúo are never typed: the client picks a branch.
 */

import { z } from "zod";

import type { SolicitudDomicilio } from "../../../types/tramites";
import { aContratante, camposContratante } from "../../tramites/formulario/schema";

export interface LimitesFecha {
  /** Today, in the backend's calendar (YYYY-MM-DD). */
  fechaMin: string;
  fechaMax: string;
}

export function crearDomicilioSchema({ fechaMin, fechaMax }: LimitesFecha) {
  return z.object({
    ...camposContratante(fechaMin),
    plan: z.string().min(1, "Elige un plan."),
    sucursal: z.string().min(1, "Elige una sucursal."),
    fecha_inicio: z
      .string()
      .min(1, "Elige la fecha de inicio.")
      .refine(
        (fecha) => fecha >= fechaMin && fecha <= fechaMax,
        "La fecha de inicio debe estar entre hoy y los próximos 30 días.",
      ),
  });
}

export type DomicilioEntrada = z.input<ReturnType<typeof crearDomicilioSchema>>;
export type DomicilioForm = z.output<ReturnType<typeof crearDomicilioSchema>>;

/** The validated form as the API expects it. */
export function aSolicitud(form: DomicilioForm): SolicitudDomicilio {
  return {
    ...aContratante(form),
    plan: form.plan,
    sucursal: Number(form.sucursal),
    fecha_inicio: form.fecha_inicio,
  };
}
