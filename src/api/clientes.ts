import type {
  CambiosCliente,
  ClienteResumen,
  FichaCliente,
  FiltrosClientes,
  NuevoCliente,
  Pagina,
} from "../types/cliente";
import { api } from "./client";

export const TAMANO_PAGINA_CLIENTES = 25;

export function listarClientes(
  { buscar, tipo, pagina }: FiltrosClientes,
  signal?: AbortSignal,
): Promise<Pagina<ClienteResumen>> {
  const params = new URLSearchParams();
  if (buscar) params.set("buscar", buscar);
  if (tipo) params.set("tipo", tipo);
  if (pagina && pagina > 1) params.set("page", String(pagina));
  const query = params.toString();
  return api.get(`/clientes/${query ? `?${query}` : ""}`, signal);
}

export function obtenerCliente(id: number, signal?: AbortSignal): Promise<FichaCliente> {
  return api.get(`/clientes/${id}/`, signal);
}

export function crearCliente(datos: NuevoCliente): Promise<FichaCliente> {
  return api.post("/clientes/", datos);
}

export function actualizarCliente(id: number, cambios: CambiosCliente): Promise<FichaCliente> {
  return api.patch(`/clientes/${id}/`, cambios);
}
