/**
 * Where each bookable service starts in the portal, by its `codigo`.
 *
 * The backend knows the services; only the frontend knows its routes. A
 * service the backend marks as bookable but that has no route here is shown
 * as "Próximamente" until its flow is built.
 */
export const RUTA_POR_SERVICIO: Readonly<Record<string, string>> = {
  "domicilio-tributario": "/tramites/domicilio-tributario/nuevo",
  bodega: "/tramites/bodega/nuevo",
};

export function rutaDeServicio(codigo: string): string | undefined {
  return Object.hasOwn(RUTA_POR_SERVICIO, codigo) ? RUTA_POR_SERVICIO[codigo] : undefined;
}
