/** All data here is synthetic. */

import type { OrdenPago, Servicio, Venta } from "../../../../types/ventas";

export const ORDEN: OrdenPago = {
  id: 41,
  venta: 9,
  proveedor: "klap",
  id_externo: null,
  monto: "18400",
  estado: "creando",
  checkout_script_url: "https://klap.invalid/checkout.js",
  created_at: "2026-10-10T12:00:00Z",
  updated_at: "2026-10-10T12:00:00Z",
};

export const ORDEN_LISTA: OrdenPago = { ...ORDEN, estado: "pendiente", id_externo: "KLAP-41" };

export const SERVICIOS: Servicio[] = [
  {
    id: 1,
    codigo: "domicilio-tributario",
    nombre: "Domicilio tributario",
    descripcion: "",
    precio_base: "14900",
    precio_confirmado: false,
  },
  {
    id: 2,
    codigo: "firma-electronica-avanzada",
    nombre: "Firma electrónica avanzada",
    descripcion: "",
    precio_base: "3500",
    precio_confirmado: false,
  },
];

export const VENTA: Venta = {
  id: 9,
  folio: "VEN-000009",
  estado: "pendiente_pago",
  total: "18400",
  pagada_en: null,
  created_at: "2026-10-10T12:00:00Z",
  items: [],
  ultima_orden: null,
};
