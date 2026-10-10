/** Sales and payments as GET /api/portal/* and /api/ventas/ return them. */

export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_base: string;
  precio_confirmado: boolean;
}

export interface ItemVenta {
  servicio: string;
  nombre: string;
  precio_unitario: string;
  cantidad: number;
  subtotal: string;
}

export type EstadoVenta = "pendiente_pago" | "pagada" | "reembolsada" | "anulada";

export type EstadoOrden =
  | "creando"
  | "pendiente"
  | "pagada"
  | "rechazada"
  | "expirada"
  | "cancelada"
  | "reembolsada"
  | "error";

export interface OrdenPago {
  id: number;
  venta: number;
  proveedor: string;
  id_externo: string | null;
  monto: string;
  estado: EstadoOrden;
  checkout_script_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: number;
  tipo: "venta" | "reembolso";
  id_externo: string | null;
  monto: string;
  medio: string;
  marca: string;
  tipo_tarjeta: string;
  ultimos_digitos: string;
  cuotas: number | null;
  billetera: string;
  pagado_en: string;
}

export interface Venta {
  id: number;
  folio: string;
  estado: EstadoVenta;
  total: string;
  pagada_en: string | null;
  created_at: string;
  items: ItemVenta[];
  ultima_orden: OrdenPago | null;
}

export interface VentaBackoffice extends Omit<Venta, "ultima_orden"> {
  cliente: { id: number; folio: string; nombre: string };
  ordenes: (OrdenPago & { detalle_error: string; pagos: Pago[] })[];
}
