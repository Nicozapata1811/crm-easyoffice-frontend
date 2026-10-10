import { descargarIndicadores, obtenerIndicadores } from "../../../api/panel";
import { guardarArchivo } from "../../../lib/descargar";
import type { IndicadoresPanel, Periodo } from "../../../types/panel";

export interface DashboardService {
  getIndicators(periodo: Periodo, signal?: AbortSignal): Promise<IndicadoresPanel>;
  exportIndicators(periodo: Periodo): Promise<void>;
}

export const dashboardService: DashboardService = {
  getIndicators: obtenerIndicadores,

  async exportIndicators(periodo) {
    const { blob, nombreArchivo } = await descargarIndicadores(periodo);
    guardarArchivo(blob, nombreArchivo ?? `panel-operativo_${periodo.desde}_${periodo.hasta}.xlsx`);
  },
};
