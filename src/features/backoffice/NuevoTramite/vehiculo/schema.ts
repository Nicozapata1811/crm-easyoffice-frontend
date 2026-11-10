/**
 * Validation of the vehicle lease (PLT-03): the client company and its
 * signer (section A, without the notice contact: there is no contract to
 * carry it), the vehicle's owner, the vehicle and the lease terms. The
 * backend validates again and its answer is the authoritative one.
 */

import { z } from "zod";

import { isValidRut, normalizeRut } from "../../../../lib/rut";
import type { FormularioTramite, SolicitudVehiculo, TramiteBackoffice } from "../../../../types/tramites";
import { camposContratante, requerido } from "../../../tramites/formulario/schema";

// ASSUMPTION: pending validation with Easy Office. Chilean plates: cars
// AA1111 and BBBB11; motorcycles AA111 and BBB11.
const PATENTE = /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2}|[A-Z]{3}\d{2}|[A-Z]{2}\d{3})$/;
const MAX_MONTO = 999_999_999;

export function normalizarPatente(valor: string): string {
  return valor.replace(/[\s.\-·]/g, "").toUpperCase();
}

const correoOpcional = z
  .string()
  .trim()
  .pipe(z.union([z.literal(""), z.email("Revisa el correo.")]));

const entero = (mensaje: string, minimo: number, maximo: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, mensaje)
    .refine((valor) => Number(valor) >= minimo && Number(valor) <= maximo, mensaje);

export const persona = z.object({
  rut: z.string().trim().refine(isValidRut, "Revisa el RUT: el dígito verificador no calza."),
  nombres: requerido("Faltan los nombres.", 100),
  apellido_paterno: requerido("Falta el apellido paterno.", 100),
  apellido_materno: z.string().trim().max(100, "Es demasiado largo."),
  domicilio: requerido("Falta el domicilio."),
  comuna: requerido("Falta la comuna.", 100),
  email: correoOpcional,
});

export function crearVehiculoSchema(hoy: string) {
  const { empresa, representante, personeria } = camposContratante(hoy);
  const anioMaximo = Number(hoy.slice(0, 4)) + 1;
  return z
    .object({
      empresa,
      representante: representante.extend({ email: correoOpcional }),
      personeria,
      arrendador: persona,
      domicilio_empresa: requerido("Falta el domicilio de la empresa."),
      comuna: requerido("Falta la comuna.", 100),
      fecha: z
        .string()
        .min(1, "Indica la fecha del documento.")
        .refine((fecha) => fecha <= hoy, "La fecha del documento no puede ser futura."),
      vehiculo: z.object({
        marca: requerido("Falta la marca.", 60),
        modelo: requerido("Falta el modelo.", 60),
        anio: entero(`Indica el año, entre 1900 y ${anioMaximo}.`, 1900, anioMaximo),
        patente: z
          .string()
          .transform(normalizarPatente)
          .pipe(z.string().regex(PATENTE, "Escribe una patente chilena, por ejemplo BBDF12 o AB1234.")),
        color: requerido("Falta el color.", 40),
        vin: z
          .string()
          .trim()
          .toUpperCase()
          .regex(/^[A-Z0-9]{5,17}$/, "Escribe el VIN o número de chasis: 5 a 17 letras y números."),
      }),
      plazo_meses: entero("Indica el plazo en meses, entre 1 y 99.", 1, 99),
      fecha_inicio: z.string().min(1, "Indica desde cuándo rige el arriendo."),
      renta: entero("Indica la renta mensual, en pesos y sin puntos.", 1, MAX_MONTO),
      dia_pago: entero("Indica un día entre 1 y 28.", 1, 28),
      medio_pago: z.enum(["transferencia", "otro"]),
      medio_pago_otro: z.string().trim().max(100, "Es demasiado largo."),
    })
    .superRefine((datos, ctx) => {
      if (datos.medio_pago === "otro" && datos.medio_pago_otro === "") {
        ctx.addIssue({ code: "custom", path: ["medio_pago_otro"], message: "Escribe el medio de pago." });
      }
    });
}

export type VehiculoEntrada = z.input<ReturnType<typeof crearVehiculoSchema>>;
export type VehiculoForm = z.output<ReturnType<typeof crearVehiculoSchema>>;

const PERSONA_VACIA = {
  rut: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  domicilio: "",
  comuna: "",
  email: "",
};

/** The form's starting values: the case being edited, or the client's records. */
export function valoresIniciales(formulario: FormularioTramite, tramite?: TramiteBackoffice): VehiculoEntrada {
  const guardado = tramite?.formulario;
  if (guardado) {
    return {
      ...guardado,
      representante: { ...guardado.representante, email: guardado.representante.email ?? "" },
      personeria: {
        fecha_instrumento: guardado.personeria.fecha_instrumento ?? "",
        sitio_o_notaria: guardado.personeria.sitio_o_notaria,
      },
      arrendador: { ...PERSONA_VACIA, ...guardado.arrendador },
      vehiculo: { ...guardado.vehiculo, anio: String(guardado.vehiculo.anio) },
      plazo_meses: String(guardado.plazo_meses),
      renta: String(guardado.renta),
      dia_pago: String(guardado.dia_pago),
    };
  }
  const datos = formulario.datos!;
  const representante = datos.representante as typeof datos.representante & { email?: string };
  return {
    empresa: { ...datos.empresa },
    representante: { ...representante, email: representante.email ?? "" },
    personeria: {
      fecha_instrumento: datos.personeria.fecha_instrumento ?? "",
      sitio_o_notaria: datos.personeria.sitio_o_notaria,
    },
    arrendador: { ...PERSONA_VACIA },
    domicilio_empresa: "",
    comuna: "",
    fecha: formulario.fecha_min,
    vehiculo: { marca: "", modelo: "", anio: "", patente: "", color: "", vin: "" },
    plazo_meses: "12",
    fecha_inicio: formulario.fecha_min,
    renta: "",
    dia_pago: "5",
    medio_pago: "transferencia",
    medio_pago_otro: "",
  };
}

/** The validated form as the API expects it. */
export function aSolicitudVehiculo(form: VehiculoForm): SolicitudVehiculo {
  return {
    empresa: { ...form.empresa, rut: normalizeRut(form.empresa.rut) },
    representante: { ...form.representante, rut: normalizeRut(form.representante.rut) },
    personeria: form.personeria,
    arrendador: { ...form.arrendador, rut: normalizeRut(form.arrendador.rut) },
    domicilio_empresa: form.domicilio_empresa,
    comuna: form.comuna,
    fecha: form.fecha,
    vehiculo: { ...form.vehiculo, anio: Number(form.vehiculo.anio) },
    plazo_meses: Number(form.plazo_meses),
    fecha_inicio: form.fecha_inicio,
    renta: Number(form.renta),
    dia_pago: Number(form.dia_pago),
    medio_pago: form.medio_pago,
    medio_pago_otro: form.medio_pago === "otro" ? form.medio_pago_otro : "",
  };
}
