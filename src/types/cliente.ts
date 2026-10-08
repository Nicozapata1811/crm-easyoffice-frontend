/**
 * Client records as served by GET/POST/PATCH /api/clientes/. Keys mirror the
 * backend contract documented in its README.
 */

export type TipoCliente = "persona" | "empresa";

export interface DatosPersona {
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
}

export interface DatosEmpresa {
  rut: string;
  razon_social: string;
  nombre_fantasia: string;
  giro: string;
  email: string;
  telefono: string;
}

export interface RepresentanteDeEmpresa {
  id: number;
  rut: string;
  nombre: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  activo: boolean;
}

export interface ClienteResumen {
  id: number;
  folio: string;
  tipo: TipoCliente;
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  created_at: string;
}

export interface FichaCliente {
  id: number;
  folio: string;
  tipo: TipoCliente;
  activo: boolean;
  created_at: string;
  updated_at: string;
  persona: DatosPersona | null;
  empresa: DatosEmpresa | null;
  representantes: RepresentanteDeEmpresa[];
}

export type NuevoCliente =
  | { tipo: "persona"; persona: DatosPersona }
  | { tipo: "empresa"; empresa: DatosEmpresa };

export interface CambiosCliente {
  activo?: boolean;
  persona?: Partial<DatosPersona>;
  empresa?: Partial<DatosEmpresa>;
}

export interface FiltrosClientes {
  buscar?: string;
  tipo?: TipoCliente;
  pagina?: number;
}

export interface Pagina<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
