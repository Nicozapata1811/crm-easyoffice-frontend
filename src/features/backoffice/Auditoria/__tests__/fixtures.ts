/** All data here is synthetic. */

import type { UsuarioSesion } from "../../../../types/sesion";
import type { EntradaAuditoria } from "../../../../types/auditoria";
import type { Pagina } from "../../../../types/cliente";

export const ADMINISTRADOR: UsuarioSesion = {
  id: 1,
  email: "admin@example.test",
  name: "Administración Demo",
  tipo: "staff",
  cliente: null,
  rol: "Administrador",
  permisos: ["core.consultar_auditoria", "clientes.view_cliente", "tramites.view_tramite"],
};

export const EJECUTIVO: UsuarioSesion = {
  ...ADMINISTRADOR,
  id: 2,
  email: "ejecutivo@example.test",
  name: "Ejecutivo Demo",
  rol: "Ejecutivo",
  permisos: ["clientes.view_cliente", "tramites.view_tramite"],
};

export const MODIFICACION: EntradaAuditoria = {
  id: 30,
  fecha_hora: "2026-01-15T15:30:05Z",
  usuario: 1,
  usuario_nombre: "Administración Demo",
  origen: "api",
  accion: "modificar",
  entidad: "clientes.empresa",
  entidad_nombre: "empresa",
  registro_id: 7,
  registro_nombre: "Transportes Austral de Ejemplo SpA",
  valor_anterior: { razon_social: "Transportes Antiguos SpA", giro: "" },
  valor_nuevo: { razon_social: "Transportes Austral de Ejemplo SpA", giro: "Transporte de carga" },
  direccion_ip: "192.0.2.10",
};

export const CREACION: EntradaAuditoria = {
  ...MODIFICACION,
  id: 29,
  accion: "crear",
  valor_anterior: null,
  valor_nuevo: { razon_social: "Transportes Antiguos SpA", activo: true },
};

export const ELIMINACION: EntradaAuditoria = {
  ...MODIFICACION,
  id: 28,
  accion: "eliminar",
  valor_anterior: { razon_social: "Transportes Antiguos SpA" },
  valor_nuevo: null,
};

/** How the backend stores a role being added: a change with only one side. */
export const ROL_AGREGADO: EntradaAuditoria = {
  ...MODIFICACION,
  id: 27,
  entidad: "users.user",
  entidad_nombre: "user",
  registro_id: 2,
  registro_nombre: "ejecutivo@example.test",
  valor_anterior: null,
  valor_nuevo: { rol: "Ejecutivo" },
};

export const DEL_SISTEMA: EntradaAuditoria = {
  ...MODIFICACION,
  id: 26,
  usuario: null,
  usuario_nombre: null,
  origen: "sistema",
  entidad: "ventas.venta",
  entidad_nombre: "venta",
  registro_id: 4,
  registro_nombre: "VEN-000004",
  valor_anterior: { estado: "pendiente" },
  valor_nuevo: { estado: "pagada" },
  direccion_ip: null,
};

export const INGRESO_FALLIDO: EntradaAuditoria = {
  ...MODIFICACION,
  id: 25,
  usuario: null,
  usuario_nombre: null,
  accion: "inicio_sesion_fallido",
  entidad: "users.user",
  entidad_nombre: "user",
  registro_id: null,
  registro_nombre: null,
  valor_anterior: null,
  valor_nuevo: { email: "alguien@example.test" },
};

export const CIERRE_SESION: EntradaAuditoria = {
  ...MODIFICACION,
  id: 24,
  accion: "cierre_sesion",
  entidad: "users.user",
  entidad_nombre: "user",
  registro_id: 1,
  registro_nombre: "admin@example.test",
  valor_anterior: null,
  valor_nuevo: null,
};

export function pagina(results: EntradaAuditoria[], count = results.length): Pagina<EntradaAuditoria> {
  return { count, next: null, previous: null, results };
}
