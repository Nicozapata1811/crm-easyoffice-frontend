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

const fechaHora = new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" });

export const formatearFechaHora = (iso: string) => fechaHora.format(new Date(iso));

const fechaHoraChile = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "medium",
  hourCycle: "h23",
  timeZone: "America/Santiago",
});

/** Chile's time wherever the browser is, on a 24-hour clock with seconds: the audit log's "when". */
export const formatearFechaHoraChile = (iso: string) => fechaHoraChile.format(new Date(iso));
