/**
 * Validation for the tax domicile form: the fields of PLT-01 the client
 * supplies (section A). Easy Office's branch, its address and rol de avalúo
 * are never typed: the client picks a branch.
 *
 * The point of this form is that a bad document never gets generated, so
 * submission is blocked while any field is missing or inconsistent. The
 * backend validates again and its answer is the authoritative one.
 */

import { z } from "zod";

import { isValidRut, normalizeRut } from "../../../lib/rut";
import type { SolicitudDomicilio } from "../../../types/tramites";

const RUT_INVALIDO = "Revisa el RUT: el dígito verificador no calza.";

const requerido = (mensaje: string, max = 255) =>
  z.string().trim().min(1, mensaje).max(max, "Es demasiado largo.");

const rut = z.string().trim().refine(isValidRut, RUT_INVALIDO);

export interface LimitesFecha {
  /** Today, in the backend's calendar (YYYY-MM-DD). */
  fechaMin: string;
  fechaMax: string;
}

export function crearDomicilioSchema({ fechaMin, fechaMax }: LimitesFecha) {
  return z.object({
    empresa: z.object({
      rut,
      razon_social: requerido("Falta la razón social."),
      giro: requerido("Falta el giro principal."),
    }),
    representante: z.object({
      rut,
      nombres: requerido("Faltan los nombres.", 100),
      apellido_paterno: requerido("Falta el apellido paterno.", 100),
      apellido_materno: z.string().trim().max(100, "Es demasiado largo."),
      domicilio: requerido("Falta el domicilio particular."),
      comuna: requerido("Falta la comuna.", 100),
      region: requerido("Elige la región.", 100),
    }),
    personeria: z.object({
      fecha_instrumento: z
        .string()
        .min(1, "Indica la fecha de la escritura o del estatuto.")
        .refine((fecha) => fecha <= fechaMin, "La fecha no puede ser futura."),
      sitio_o_notaria: requerido("Indica el sitio o la notaría."),
    }),
    email_aviso: z.string().trim().pipe(z.email("Revisa el correo.")),
    movil_aviso: z
      .string()
      .transform((valor) => valor.replace(/\s/g, ""))
      .pipe(z.string().regex(/^9\d{8}$/, "Ingresa 9 dígitos, comenzando con 9.")),
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
    empresa: { ...form.empresa, rut: normalizeRut(form.empresa.rut) },
    representante: { ...form.representante, rut: normalizeRut(form.representante.rut) },
    personeria: form.personeria,
    email_aviso: form.email_aviso,
    movil_aviso: form.movil_aviso,
    plan: form.plan,
    sucursal: Number(form.sucursal),
    fecha_inicio: form.fecha_inicio,
  };
}
