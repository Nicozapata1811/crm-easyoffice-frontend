import type { EstadoOrden } from "../../../types/ventas";

export const ETIQUETA_ORDEN: Record<EstadoOrden, string> = {
  creando: "Creando",
  pendiente: "Pendiente",
  pagada: "Pagada",
  rechazada: "Rechazada",
  expirada: "Expirada",
  cancelada: "Cancelada",
  reembolsada: "Reembolsada",
  error: "Error",
};
