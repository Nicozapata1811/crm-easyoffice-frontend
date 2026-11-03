import type { FiltrosAuditoria } from "../../../api/auditoria";

const CLAVES = ["entidad", "registro_id", "usuario", "accion", "origen", "desde", "hasta"] as const;

/** The filters with a field that shows their error; any other goes to the screen's alert. */
export const CAMPOS_CON_ERROR = ["entidad", "registro_id", "accion", "origen", "desde", "hasta"];

/** The filters a URL holds. The query is the only place they live. */
export function filtrosDesdeUrl(params: URLSearchParams): FiltrosAuditoria {
  const filtros: FiltrosAuditoria = {
    pagina: Math.max(1, Number(params.get("pagina")) || 1),
  };
  for (const clave of CLAVES) {
    const valor = params.get(clave)?.trim();
    if (valor) filtros[clave] = valor;
  }
  return filtros;
}

export const hayFiltros = (filtros: FiltrosAuditoria) => CLAVES.some((clave) => filtros[clave]);

const RUTA = "/backoffice/auditoria";

export const urlDeRegistro = (entidad: string, registroId: number) =>
  `${RUTA}?${new URLSearchParams({ entidad, registro_id: String(registroId) }).toString()}`;

export const urlDeUsuario = (usuario: number) =>
  `${RUTA}?${new URLSearchParams({ usuario: String(usuario) }).toString()}`;
