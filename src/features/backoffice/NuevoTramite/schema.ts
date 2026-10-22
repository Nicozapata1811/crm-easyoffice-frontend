/**
 * Validation for a request an executive files for a client (PLT-02): the
 * contracting party (shared with the domicile form), one property per role
 * the case type's lines name, the term, and each line's cycle and, without a
 * list price, its agreed price. Built from what the backend's form offers.
 */

import { z } from "zod";

import type { FormularioTramite, SolicitudTramite, TramiteBackoffice } from "../../../types/tramites";
import { aContratante, camposContratante, contratanteInicial } from "../../tramites/formulario/schema";

/** How the form names each property role. */
export const ROLES: Record<string, { titulo: string; elegir: string; ayuda: string }> = {
  sucursal: {
    titulo: "Sucursal de Easy Office",
    elegir: "Elige una sucursal.",
    ayuda: "El domicilio tributario queda en esta sucursal, que también encabeza el folio.",
  },
  bodega: {
    titulo: "Bodega",
    elegir: "Elige una bodega.",
    ayuda: "La bodega que su dueño autoriza a usar. Solo aparecen las que tienen completos sus datos.",
  },
};

export function rolesDe(formulario: FormularioTramite): string[] {
  return [...new Set(formulario.lineas.map((linea) => linea.inmueble))];
}

export function crearTramiteSchema(formulario: FormularioTramite) {
  const roles = rolesDe(formulario);
  return z.object({
    ...camposContratante(formulario.fecha_min),
    inmuebles: z.object(
      Object.fromEntries(roles.map((rol) => [rol, z.string().min(1, ROLES[rol]?.elegir ?? "Elige uno.")])),
    ),
    duracion_meses: z.string().min(1, "Elige la duración."),
    fecha_inicio: z
      .string()
      .min(1, "Elige la fecha de inicio.")
      .refine(
        (fecha) => fecha >= formulario.fecha_min && fecha <= formulario.fecha_max,
        "La fecha de inicio debe estar entre hoy y los próximos 30 días.",
      ),
    lineas: z
      .array(
        z.object({
          servicio: z.string(),
          ciclo_pago: z.string().min(1, "Elige el ciclo de pago."),
          precio: z.string().trim(),
        }),
      )
      .superRefine((lineas, ctx) => {
        lineas.forEach((linea, indice) => {
          const sinPrecioDeLista = formulario.lineas[indice]?.precio_base === null;
          if (sinPrecioDeLista && !/^[1-9]\d*$/.test(linea.precio)) {
            ctx.addIssue({
              code: "custom",
              path: [indice, "precio"],
              message: "Indica el precio acordado, en pesos y sin puntos.",
            });
          }
        });
      }),
  });
}

export type TramiteEntrada = z.input<ReturnType<typeof crearTramiteSchema>>;
export type TramiteForm = z.output<ReturnType<typeof crearTramiteSchema>>;

/** The form's starting values: the client's records, or the case being edited. */
export function valoresIniciales(formulario: FormularioTramite, tramite?: TramiteBackoffice): TramiteEntrada {
  const contrato = tramite?.contrato ?? undefined;
  const datos = tramite?.datos ?? {};
  const elegidas = new Map((datos.lineas ?? []).map((linea) => [linea.servicio, linea]));
  return {
    ...contratanteInicial(formulario.datos!, contrato),
    inmuebles: Object.fromEntries(
      rolesDe(formulario).map((rol) => {
        const guardado = datos[rol as "sucursal" | "bodega"];
        const opciones = formulario.inmuebles[rol] ?? [];
        const unico = opciones.length === 1 ? String(opciones[0].id) : "";
        return [rol, guardado ? String(guardado) : unico];
      }),
    ),
    duracion_meses: String(datos.duracion_meses ?? formulario.duracion_por_defecto ?? ""),
    fecha_inicio: datos.fecha_inicio ?? formulario.fecha_min,
    lineas: formulario.lineas.map((linea) => ({
      servicio: linea.servicio,
      ciclo_pago: elegidas.get(linea.servicio)?.ciclo_pago ?? linea.ciclo_pago_default ?? "",
      precio: elegidas.get(linea.servicio)?.precio ?? "",
    })),
  };
}

/** The validated form as the API expects it. */
export function aSolicitudTramite(form: TramiteForm, formulario: FormularioTramite): SolicitudTramite {
  return {
    ...aContratante(form),
    ...Object.fromEntries(Object.entries(form.inmuebles).map(([rol, id]) => [rol, Number(id)])),
    duracion_meses: Number(form.duracion_meses),
    fecha_inicio: form.fecha_inicio,
    lineas: form.lineas.map((linea, indice) => ({
      servicio: linea.servicio,
      ciclo_pago: linea.ciclo_pago,
      precio: formulario.lineas[indice]?.precio_base === null ? linea.precio : null,
    })),
  };
}
