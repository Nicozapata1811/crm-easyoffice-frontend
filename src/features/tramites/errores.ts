import { ApiError } from "../../api/client";

/**
 * The backend's field errors as (dotted path, message) pairs, e.g.
 * `{"representante": {"rut": ["…"]}}` → `["representante.rut", "…"]`.
 */
export function erroresDeCampo(error: unknown): [string, string][] {
  if (!(error instanceof ApiError) || error.status !== 400) return [];
  const pares: [string, string][] = [];
  const recorrer = (valor: unknown, ruta: string) => {
    if (Array.isArray(valor)) {
      if (valor.length > 0 && typeof valor[0] === "string") pares.push([ruta, valor[0]]);
    } else if (valor && typeof valor === "object") {
      for (const [clave, hijo] of Object.entries(valor)) {
        recorrer(hijo, ruta ? `${ruta}.${clave}` : clave);
      }
    }
  };
  recorrer(error.detail, "");
  return pares;
}

/** The `codigo` of a 409 answer (no_disponible, fecha_inicio_vencida, …). */
export function codigoDeConflicto(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const detalle = error.detail as { codigo?: string } | null;
  return detalle?.codigo ?? "conflicto";
}
