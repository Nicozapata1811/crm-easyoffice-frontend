import type { TonoEstado } from "../../../components/EstadoPill";
import type { EstadoOrden, EstadoVenta } from "../../../types/ventas";

export const ORDEN_ABIERTA: EstadoOrden[] = ["creando", "pendiente"];

export const ESTADO_VENTA: Record<EstadoVenta, { etiqueta: string; tono: TonoEstado }> = {
  pendiente_pago: { etiqueta: "Pendiente de pago", tono: "espera" },
  pagada: { etiqueta: "Pagada", tono: "completo" },
  reembolsada: { etiqueta: "Reembolsada", tono: "progreso" },
  anulada: { etiqueta: "Anulada", tono: "progreso" },
};
