import { z } from "zod";

import { isValidRut, normalizeRut } from "../../../lib/rut";

const MIN_PASSWORD = 8;

const texto = (maximo: number) => z.string().trim().max(maximo, `Máximo ${maximo} caracteres.`);

export const registroSchema = z
  .object({
    tipo: z.enum(["persona", "empresa"]),
    rut: z
      .string()
      .trim()
      .min(1, "Ingresa el RUT.")
      .refine(isValidRut, "Revisa el RUT: el dígito verificador no calza."),
    nombres: texto(100),
    apellido_paterno: texto(100),
    apellido_materno: texto(100),
    razon_social: texto(255),
    email: z.email("Ingresa un correo válido."),
    password: z.string().min(MIN_PASSWORD, `Usa al menos ${MIN_PASSWORD} caracteres.`),
    confirmacion: z.string(),
  })
  .superRefine((datos, ctx) => {
    const faltan =
      datos.tipo === "persona"
        ? [
            ["nombres", "Ingresa tus nombres."],
            ["apellido_paterno", "Ingresa tu apellido paterno."],
          ]
        : [["razon_social", "Ingresa la razón social."]];
    for (const [campo, mensaje] of faltan) {
      if (!datos[campo as keyof typeof datos]) {
        ctx.addIssue({ code: "custom", path: [campo], message: mensaje });
      }
    }
    if (datos.password !== datos.confirmacion) {
      ctx.addIssue({ code: "custom", path: ["confirmacion"], message: "Las contraseñas no coinciden." });
    }
  });

export type RegistroForm = z.infer<typeof registroSchema>;

/** The request body: only the fields of the chosen type, RUT normalised. */
export function aDatosRegistro(datos: RegistroForm) {
  const comunes = {
    tipo: datos.tipo,
    rut: normalizeRut(datos.rut),
    email: datos.email,
    password: datos.password,
  };
  if (datos.tipo === "empresa") return { ...comunes, razon_social: datos.razon_social };
  return {
    ...comunes,
    nombres: datos.nombres,
    apellido_paterno: datos.apellido_paterno,
    apellido_materno: datos.apellido_materno,
  };
}
