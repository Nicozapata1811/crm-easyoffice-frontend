/**
 * Validation for the client form. The backend validates again, including
 * whether the RUT already belongs to another client.
 */

import { z } from "zod";

import { isValidRut } from "../../../lib/rut";

const rut = z
  .string()
  .trim()
  .min(1, "Ingresa el RUT.")
  .refine(isValidRut, "Revisa el RUT: el dígito verificador no calza.");

const requerido = (mensaje: string, maximo: number) =>
  z.string().trim().min(1, mensaje).max(maximo, `Máximo ${maximo} caracteres.`);

const opcional = (maximo: number) => z.string().trim().max(maximo, `Máximo ${maximo} caracteres.`);

const email = z
  .string()
  .trim()
  .refine((valor) => valor === "" || z.email().safeParse(valor).success, "Ingresa un correo válido.");

export const personaSchema = z.object({
  rut,
  nombres: requerido("Ingresa los nombres.", 100),
  apellido_paterno: requerido("Ingresa el apellido paterno.", 100),
  apellido_materno: opcional(100),
  email,
  telefono: opcional(20),
});

export const empresaSchema = z.object({
  rut,
  razon_social: requerido("Ingresa la razón social.", 255),
  nombre_fantasia: opcional(255),
  giro: opcional(255),
  email,
  telefono: opcional(20),
});
