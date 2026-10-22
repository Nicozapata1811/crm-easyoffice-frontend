/**
 * Validation for a request the client files in the portal for a type sold
 * by plan (the bodega, PLT-02): the contracting party (shared with the
 * domicile form), the plan, one property per role the type's lines name,
 * and the start date. Built from what the backend's form offers.
 */

import { z } from "zod";

import type { FormularioPortal, SolicitudPortal, Tramite } from "../../../types/tramites";
import { ROLES, rolesDe } from "../../tramites/formulario/roles";
import { aContratante, camposContratante, contratanteInicial } from "../../tramites/formulario/schema";

export function crearSolicitudSchema(formulario: FormularioPortal) {
  return z.object({
    ...camposContratante(formulario.fecha_min),
    plan: z.string().min(1, "Elige un plan."),
    inmuebles: z.object(
      Object.fromEntries(
        rolesDe(formulario.inmuebles).map((rol) => [rol, z.string().min(1, ROLES[rol]?.elegir ?? "Elige uno.")]),
      ),
    ),
    fecha_inicio: z
      .string()
      .min(1, "Elige la fecha de inicio.")
      .refine(
        (fecha) => fecha >= formulario.fecha_min && fecha <= formulario.fecha_max,
        "La fecha de inicio debe estar entre hoy y los próximos 30 días.",
      ),
  });
}

export type SolicitudEntrada = z.input<ReturnType<typeof crearSolicitudSchema>>;
export type SolicitudForm = z.output<ReturnType<typeof crearSolicitudSchema>>;

/** Starting values: the client's records, or the request being edited. */
export function valoresIniciales(formulario: FormularioPortal, tramite?: Tramite): SolicitudEntrada {
  const datos = tramite?.datos ?? {};
  const unicoPlan = formulario.planes.length === 1 ? formulario.planes[0].codigo : "";
  return {
    ...contratanteInicial(formulario.datos!, tramite?.contrato ?? undefined),
    plan: datos.plan ?? unicoPlan,
    inmuebles: Object.fromEntries(
      rolesDe(formulario.inmuebles).map((rol) => {
        const guardado = datos[rol as "sucursal" | "bodega"];
        const opciones = formulario.inmuebles[rol];
        return [rol, guardado ? String(guardado) : opciones.length === 1 ? String(opciones[0].id) : ""];
      }),
    ),
    fecha_inicio: datos.fecha_inicio ?? formulario.fecha_min,
  };
}

/** The validated form as the API expects it: one property id per role. */
export function aSolicitudPortal(form: SolicitudForm): SolicitudPortal {
  return {
    ...aContratante(form),
    ...Object.fromEntries(Object.entries(form.inmuebles).map(([rol, id]) => [rol, Number(id)])),
    plan: form.plan,
    fecha_inicio: form.fecha_inicio,
  };
}
