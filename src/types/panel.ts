/**
 * Indicators of the operational dashboard (RF-14). Keys mirror the
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

/** Cases pending for one reason (RF-47). */
export interface PendientesPorMotivo {
  motivo: string;
  nombre: string;
  cantidad: number;
}

export interface IndicadoresPanel {
  periodo: Periodo;
  /** Day the point-in-time figures are read at: `hasta`, or today if later. */
  fecha_referencia: string;
  clientes: { total: number; nuevos: number };
  /** Counted per contract (folio), at `fecha_referencia`. */
  servicios: { activos: number; por_vencer: number; vencidos: number; dias_aviso: number };
  ventas: {
    moneda: "CLP";
    total: number;
    por_servicio: VentaPorServicio[];
    por_ejecutivo: VentaPorEjecutivo[];
  };
  tramites_pendientes: number;
  tramites_pendientes_por_motivo: PendientesPorMotivo[];
  documentos_pendientes_firma: number;
  /** @deprecated Always empty: every figure is real. Removed in the next release. */
  datos_de_ejemplo: string[];
}
