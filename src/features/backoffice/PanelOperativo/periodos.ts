import type { Periodo } from "../../../types/panel";

export type PeriodoId = "mes-actual" | "mes-anterior" | "ultimos-90" | "anio-actual";

export const PERIODOS: { id: PeriodoId; etiqueta: string }[] = [
  { id: "mes-actual", etiqueta: "Este mes" },
  { id: "mes-anterior", etiqueta: "Mes anterior" },
  { id: "ultimos-90", etiqueta: "Últimos 90 días" },
  { id: "anio-actual", etiqueta: "Este año" },
];

/** Local calendar date; toISOString would shift it to UTC. */
export function aFechaIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function resolverPeriodo(id: PeriodoId, hoy: Date = new Date()): Periodo {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const rangos: Record<PeriodoId, [Date, Date]> = {
    "mes-actual": [new Date(anio, mes, 1), hoy],
    "mes-anterior": [new Date(anio, mes - 1, 1), new Date(anio, mes, 0)],
    "ultimos-90": [new Date(anio, mes, hoy.getDate() - 89), hoy],
    "anio-actual": [new Date(anio, 0, 1), hoy],
  };
  const [desde, hasta] = rangos[id];
  return { desde: aFechaIso(desde), hasta: aFechaIso(hasta) };
}

export function diasDelPeriodo({ desde, hasta }: Periodo): number {
  const dia = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / dia) + 1;
}
