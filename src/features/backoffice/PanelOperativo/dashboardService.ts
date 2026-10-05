import type { IndicadoresPanel, Periodo } from "../../../types/panel";
import { diasDelPeriodo } from "./periodos";

export interface DashboardService {
  getIndicators(periodo: Periodo): Promise<IndicadoresPanel>;
}

/** Example prices, not confirmed by Easy Office. */
const SERVICIOS = [
  { servicio: "Domicilio tributario", precio: 45_000, porMes: 22 },
  { servicio: "Declaración jurada", precio: 18_000, porMes: 12 },
  { servicio: "Contrato de arriendo", precio: 60_000, porMes: 7 },
];

const EJECUTIVOS = [
  { ejecutivo: "Ejecutivo/a de ejemplo 1", participacion: 0.45 },
  { ejecutivo: "Ejecutivo/a de ejemplo 2", participacion: 0.35 },
  { ejecutivo: "Ejecutivo/a de ejemplo 3", participacion: 0.2 },
];

/** Deterministic noise in [0.8, 1.2) so a period always shows the same figures. */
function variacion(semilla: string): number {
  let hash = 0;
  for (const caracter of semilla) hash = (hash * 31 + caracter.charCodeAt(0)) >>> 0;
  return 0.8 + (hash % 1000) / 2500;
}

function repartir(total: number, participaciones: number[]): number[] {
  const partes = participaciones.map((p) => Math.floor(total * p));
  partes[partes.length - 1] += total - partes.reduce((suma, parte) => suma + parte, 0);
  return partes;
}

export const mockDashboardService: DashboardService = {
  async getIndicators(periodo) {
    const meses = diasDelPeriodo(periodo) / 30;
    const clave = `${periodo.desde}:${periodo.hasta}`;

    const porServicio = SERVICIOS.map(({ servicio, precio, porMes }) => {
      const cantidad = Math.max(1, Math.round(porMes * meses * variacion(clave + servicio)));
      return { servicio, cantidad, monto: cantidad * precio };
    });
    const total = porServicio.reduce((suma, { monto }) => suma + monto, 0);
    const cantidadTotal = porServicio.reduce((suma, { cantidad }) => suma + cantidad, 0);
    const participaciones = EJECUTIVOS.map(({ participacion }) => participacion);
    const montos = repartir(total, participaciones);
    const cantidades = repartir(cantidadTotal, participaciones);

    return {
      periodo,
      clientes: { total: 148, nuevos: Math.round(14 * meses * variacion(clave)) },
      // ASSUMPTION: pending validation with Easy Office. HU-42 proposes 60, 30,
      // 15 and 7 days of notice; the dashboard counts the 30-day window.
      servicios: { activos: 96, por_vencer: 7, vencidos: 4, dias_aviso: 30 },
      ventas: {
        moneda: "CLP",
        total,
        por_servicio: porServicio,
        por_ejecutivo: EJECUTIVOS.map(({ ejecutivo }, i) => ({
          ejecutivo,
          monto: montos[i],
          cantidad: cantidades[i],
        })),
      },
      tramites_pendientes: 18,
      documentos_pendientes_firma: 6,
    };
  },
};

// Swap for an api.get to /panel/indicadores/ once the backend exposes it.
export const dashboardService: DashboardService = mockDashboardService;
