/**
 * Validation shared by the request forms: the contracting company, its legal
 * representative, the personería and the notice contact (section A of the
 * service contracts, PLT-01 and PLT-02). Each form adds its own choices.
 *
 * The point is that a bad document never gets generated, so submission is
 * blocked while any field is missing or inconsistent. The backend validates
 * again and its answer is the authoritative one.
 */

import { z } from "zod";

import { isValidRut, normalizeRut } from "../../../lib/rut";
import type { DatosContratante, SolicitudContratante } from "../../../types/tramites";

const RUT_INVALIDO = "Revisa el RUT: el dígito verificador no calza.";

export const requerido = (mensaje: string, max = 255) =>
  z.string().trim().min(1, mensaje).max(max, "Es demasiado largo.");

const rut = z.string().trim().refine(isValidRut, RUT_INVALIDO);

/** The contracting party's fields; ``hoy`` bounds the personería date. */
export function camposContratante(hoy: string) {
  return {
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
        .refine((fecha) => fecha <= hoy, "La fecha no puede ser futura."),
      sitio_o_notaria: requerido("Indica el sitio o la notaría."),
    }),
    email_aviso: z.string().trim().pipe(z.email("Revisa el correo.")),
    movil_aviso: z
      .string()
      .transform((valor) => valor.replace(/\s/g, ""))
      .pipe(z.string().regex(/^9\d{8}$/, "Ingresa 9 dígitos, comenzando con 9.")),
  };
}

const contratante = z.object(camposContratante(""));

export type ContratanteEntrada = z.input<typeof contratante>;
type ContratanteForm = z.output<typeof contratante>;

/** The form's starting values from the client's records, and a saved contract. */
export function contratanteInicial(
  datos: DatosContratante,
  contacto?: { email_aviso: string; movil_aviso: string },
): ContratanteEntrada {
  return {
    empresa: { ...datos.empresa },
    representante: { ...datos.representante },
    personeria: {
      fecha_instrumento: datos.personeria.fecha_instrumento ?? "",
      sitio_o_notaria: datos.personeria.sitio_o_notaria,
    },
    email_aviso: contacto?.email_aviso ?? datos.contacto.email_aviso,
    movil_aviso: contacto?.movil_aviso ?? datos.contacto.movil_aviso,
  };
}

/** The validated party as the API expects it. */
export function aContratante(form: ContratanteForm): SolicitudContratante {
  return {
    empresa: { ...form.empresa, rut: normalizeRut(form.empresa.rut) },
    representante: { ...form.representante, rut: normalizeRut(form.representante.rut) },
    personeria: form.personeria,
    email_aviso: form.email_aviso,
    movil_aviso: form.movil_aviso,
  };
}
