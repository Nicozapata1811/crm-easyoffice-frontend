/**
 * Service and plan catalogue: GET /api/catalogo/.
 *
 * The response is parsed, not trusted, so a ServicioSlug or PlanSlug can only
 * come from the backend's catalogue.
 */

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { api } from "./client";

const planSchema = z
  .object({
    slug: z.string().brand<"PlanSlug">(),
    nombre: z.string(),
    meses: z.number().int(),
    precio: z.number().int(),
    moneda: z.string(),
    precio_confirmado: z.boolean(),
    enlace: z.string(),
  })
  .transform(({ precio_confirmado, ...plan }) => ({
    ...plan,
    precioConfirmado: precio_confirmado,
  }));

const servicioSchema = z.object({
  slug: z.string().brand<"ServicioSlug">(),
  nombre: z.string(),
  planes: z.array(planSchema),
});

export const catalogoSchema = z.object({
  servicios: z.array(servicioSchema),
});

export type Catalogo = z.output<typeof catalogoSchema>;
export type Servicio = Catalogo["servicios"][number];
export type Plan = Servicio["planes"][number];
export type ServicioSlug = Servicio["slug"];
export type PlanSlug = Plan["slug"];

export async function fetchCatalogo(signal?: AbortSignal): Promise<Catalogo> {
  return catalogoSchema.parse(await api.get<unknown>("/catalogo/", signal));
}

export function useCatalogo() {
  return useQuery({
    queryKey: ["catalogo"],
    queryFn: ({ signal }) => fetchCatalogo(signal),
    staleTime: 5 * 60 * 1000,
  });
}
