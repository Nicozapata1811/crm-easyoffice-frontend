/**
 * Indicators of the operational dashboard (RF-14). Keys mirror the planned
 * GET /api/panel/indicadores/ payload documented in both READMEs.
 */

/** Inclusive date range, as YYYY-MM-DD. */
export interface Periodo {
  desde: string;
  hasta: string;
}

export interface VentaPorServicio {
  servicio: string;
  monto: number;
  cantidad: number;
}

export interface VentaPorEjecutivo {
  ejecutivo: string;
  monto: number;
  cantidad: number;
}

export interface IndicadoresPanel {
  periodo: Periodo;
  clientes: { total: number; nuevos: number };
  servicios: { activos: number; por_vencer: number; vencidos: number; dias_aviso: number };
  ventas: {
    moneda: "CLP";
    total: number;
    por_servicio: VentaPorServicio[];
    por_ejecutivo: VentaPorEjecutivo[];
  };
  tramites_pendientes: number;
  documentos_pendientes_firma: number;
}
