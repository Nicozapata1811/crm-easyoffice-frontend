import type { TonoEstado } from "../../../components/EstadoPill";
import type { EstadoOrden, EstadoVenta } from "../../../types/ventas";

export const ORDEN_ABIERTA: EstadoOrden[] = ["creando", "pendiente"];

/**
 * ASSUMPTION: pending validation with Easy Office. A finished sale that is not
 * a problem (refunded, cancelled) reads grey, not as an alert.
 */
export const ESTADO_VENTA: Record<EstadoVenta, { etiqueta: string; tono: TonoEstado }> = {
  pendiente_pago: { etiqueta: "Pendiente de pago", tono: "espera" },
  pagada: { etiqueta: "Pagada", tono: "completo" },
  reembolsada: { etiqueta: "Reembolsada", tono: "neutro" },
  anulada: { etiqueta: "Anulada", tono: "neutro" },
};

export type ResultadoPago =
  | "resultado"
  | "aprobado"
  | "rechazado"
  | "cancelado"
  | "expirado"
  | "reembolsado"
  | "error";

/** The page for each final order state; open orders stay where they are. */
export const RESULTADO_POR_ESTADO: Partial<Record<EstadoOrden, ResultadoPago>> = {
  pagada: "aprobado",
  rechazada: "rechazado",
  cancelada: "cancelado",
  expirada: "expirado",
  reembolsada: "reembolsado",
  error: "error",
};

export const rutaPago = (ordenId: number, resultado: ResultadoPago) =>
  `/pagos/${ordenId}/${resultado}`;
