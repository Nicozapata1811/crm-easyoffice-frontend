/**
 * How the request forms name each property role a case type's lines are
 * located at (the backend's `inmuebles.services.ROLES`).
 */
export const ROLES: Record<string, { titulo: string; elegir: string; ayuda: string; ayudaCliente: string }> = {
  sucursal: {
    titulo: "Sucursal de Easy Office",
    elegir: "Elige una sucursal.",
    ayuda: "El domicilio tributario queda en esta sucursal, que también encabeza el folio.",
    ayudaCliente: "Tu domicilio tributario queda en la dirección de la sucursal que elijas.",
  },
  bodega: {
    titulo: "Bodega",
    elegir: "Elige una bodega.",
    ayuda: "La bodega que su dueño autoriza a usar. Solo aparecen las que tienen completos sus datos.",
    // ASSUMPTION: pending validation with Easy Office. The client picks the
    // warehouse, as they pick a branch for the domicile.
    ayudaCliente: "La bodega que su dueño autoriza a usar a tu empresa.",
  },
};

export function rolesDe(inmuebles: Record<string, unknown>): string[] {
  return Object.keys(inmuebles);
}
