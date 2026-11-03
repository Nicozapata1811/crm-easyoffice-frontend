import { formatearFechaHoraChile } from "../../../lib/formato";
import type { EntradaAuditoria, ValoresAuditoria } from "../../../types/auditoria";

export interface LineaDetalle {
  campo: string;
  texto: string;
}

export interface DetalleCambios {
  titulo: string;
  lineas: LineaDetalle[];
}

const SIN_VALOR = "—";
// The triggers store timestamps as UTC text; a plain date has no time to move.
const FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "(vacío)";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "object") return JSON.stringify(valor);
  if (typeof valor === "string" && FECHA_HORA.test(valor)) return formatearFechaHoraChile(valor);
  return String(valor);
}

/** The API has no field labels: `razon_social` reads "Razon social". */
function nombreCampo(clave: string): string {
  const texto = clave.replaceAll("_", " ");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const ordenar = (lineas: LineaDetalle[]) =>
  lineas.sort((a, b) => a.campo.localeCompare(b.campo, "es"));

function valores(datos: ValoresAuditoria): LineaDetalle[] {
  return ordenar(
    Object.entries(datos ?? {}).map(([clave, valor]) => ({
      campo: nombreCampo(clave),
      texto: formatearValor(valor),
    })),
  );
}

/**
 * A change lists both sides. Adding or removing a role fills only one of them,
 * so a side without the field reads as a dash, not as an empty value.
 */
function diferencias(antes: ValoresAuditoria, despues: ValoresAuditoria): LineaDetalle[] {
  const previo = antes ?? {};
  const nuevo = despues ?? {};
  const lado = (datos: Record<string, unknown>, clave: string) =>
    clave in datos ? formatearValor(datos[clave]) : SIN_VALOR;
  return ordenar(
    [...new Set([...Object.keys(previo), ...Object.keys(nuevo)])].map((clave) => ({
      campo: nombreCampo(clave),
      texto: `${lado(previo, clave)} → ${lado(nuevo, clave)}`,
    })),
  );
}

export function detalleDe({ accion, valor_anterior, valor_nuevo }: EntradaAuditoria): DetalleCambios {
  switch (accion) {
    case "crear":
      return { titulo: "Valores nuevos", lineas: valores(valor_nuevo) };
    case "eliminar":
      return { titulo: "Valores anteriores", lineas: valores(valor_anterior) };
    case "modificar":
      return { titulo: "Cambios", lineas: diferencias(valor_anterior, valor_nuevo) };
    default:
      return { titulo: "Datos registrados", lineas: valores(valor_nuevo) };
  }
}
