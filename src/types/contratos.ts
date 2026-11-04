/** Shapes of /api/contratos/ and /api/alertas-vencimiento/ (backend README). */

export type EstadoContrato = "borrador" | "vigente" | "terminado" | "anulado";

export interface ClienteContrato {
  id: number;
  codigo: string;
  nombre: string;
}

export interface LineaContrato {
  orden: number;
  servicio: string;
  nombre: string;
}

export interface Contrato {
  id: number;
  folio: string;
  estado: EstadoContrato;
  cliente: ClienteContrato;
  fecha_inicio: string;
  duracion_meses: number;
  fecha_vencimiento: string;
  renovacion_automatica: boolean;
  ejecutivo_responsable: number | null;
  ejecutivo_responsable_nombre: string | null;
  /** Days to the stored expiry, negative once past. Null unless `vigente`. */
  dias_restantes: number | null;
  servicios: LineaContrato[];
}

export interface Ejecutivo {
  id: number;
  nombre: string;
}

export type EstadoAlerta = "pendiente" | "gestionada";

export interface AlertaVencimiento {
  id: number;
  contrato: number;
  folio: string;
  renovacion_automatica: boolean;
  cliente: ClienteContrato;
  servicios: string[];
  ejecutivo_responsable: Ejecutivo | null;
  umbral_dias: number;
  fecha_vencimiento: string;
  /** Negative once past. */
  dias_restantes: number;
  estado: EstadoAlerta;
  created_at: string;
  gestionada_por_nombre: string | null;
  gestionada_en: string | null;
  nota: string;
}

export interface ResumenAlertas {
  pendientes: number;
  umbrales: number[];
}
