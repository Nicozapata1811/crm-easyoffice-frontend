const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
const entero = new Intl.NumberFormat("es-CL");
const fecha = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatearPesos = (monto: number) => clp.format(monto);

export const formatearEntero = (valor: number) => entero.format(valor);

/** Formats a YYYY-MM-DD date without shifting it through UTC. */
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return fecha.format(new Date(anio, mes - 1, dia));
}
