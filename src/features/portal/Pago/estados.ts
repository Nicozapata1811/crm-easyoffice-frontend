import type { TonoEstado } from "../../../components/EstadoPill";
import type { EstadoOrden, EstadoVenta } from "../../../types/ventas";

export const ORDEN_ABIERTA: EstadoOrden[] = ["creando", "pendiente"];

export const ESTADO_VENTA: Record<EstadoVenta, { etiqueta: string; tono: TonoEstado }> = {
  pendiente_pago: { etiqueta: "Pendiente de pago", tono: "espera" },
  pagada: { etiqueta: "Pagada", tono: "completo" },
  reembolsada: { etiqueta: "Reembolsada", tono: "progreso" },
  anulada: { etiqueta: "Anulada", tono: "progreso" },
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
