/**
 * Validation for the tax domicile form.
 *
 * The point of this form is that a bad document never gets generated, so
 * submission is blocked while any field is missing or inconsistent. The
 * backend validates again and its answer is the authoritative one.
 */

import { z } from "zod";

import { isValidRolDeAvaluo } from "../../../lib/rolDeAvaluo";
import { isValidRut } from "../../../lib/rut";

export const domicilioSchema = z.object({
  rutEmpresa: z.string().refine(isValidRut, "Revisa el RUT: el dígito verificador no calza."),
  razonSocial: z.string().min(1, "Falta la razón social."),
  representanteLegal: z.string().min(1, "Falta el representante legal."),
  direccion: z.string().min(1, "Falta la dirección del nuevo domicilio."),
  comuna: z.string().min(1, "Elige una comuna."),
  rolDeAvaluo: z.string().refine(isValidRolDeAvaluo, "Formato esperado: 0000-00"),
});

export type DomicilioForm = z.infer<typeof domicilioSchema>;
