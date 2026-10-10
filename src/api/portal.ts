import type { Pagina } from "../types/cliente";
import type { UsuarioSesion } from "../types/sesion";
import type { OrdenPago, Servicio, Venta } from "../types/ventas";
import { api } from "./client";
import { clearCsrfToken } from "./csrf";

export interface DatosRegistro {
  tipo: "persona" | "empresa";
  rut: string;
  email: string;
  password: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  razon_social?: string;
}

export async function registrar(datos: DatosRegistro): Promise<UsuarioSesion> {
  const usuario = await api.post<UsuarioSesion>("/portal/registro/", datos);
  // Django rotates the CSRF token when the session starts.
  clearCsrfToken();
  return usuario;
}

export function listarServicios(signal?: AbortSignal): Promise<Servicio[]> {
  return api.get("/portal/servicios/", signal);
}

export function crearVenta(items: { servicio: string; cantidad: number }[]): Promise<Venta> {
  return api.post("/portal/ventas/", { items });
}

export function listarVentas(signal?: AbortSignal): Promise<Pagina<Venta>> {
  return api.get("/portal/ventas/", signal);
}

export function pagarVenta(ventaId: number): Promise<OrdenPago> {
  return api.post(`/portal/ventas/${ventaId}/pagar/`);
}

export function obtenerOrden(ordenId: number, signal?: AbortSignal): Promise<OrdenPago> {
  return api.get(`/portal/ordenes/${ordenId}/`, signal);
}
