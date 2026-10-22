/**
 * Cases and their documents as /api/portal/tramites/ and /api/tramites/
 * return them. States follow RN-42: iniciado → pendiente (with a reason) →
 * completado.
 */

import type { EstadoVenta, ItemVenta } from "./ventas";

export type EstadoTramite = "iniciado" | "pendiente" | "completado";

export type CodigoMotivo = "falta_informacion" | "revision_borrador" | "pago" | "firma";

/** What the portal asks the client to do next. */
export type AccionCliente = "revisar_borrador" | "pagar" | "nueva_fecha" | null;

export interface MotivoPendiente {
  codigo: CodigoMotivo;
  nombre: string;
  texto_cliente: string;
}

/** A plan in which the domicile is sold (GET …/domicilio/formulario/). */
export interface PlanDomicilio {
  codigo: string;
  nombre: string;
  duracion_meses: number;
  ciclo_pago: string;
  precio: string;
  precio_incluye_iva: boolean;
  precio_confirmado: boolean;
  firma_incluida: boolean;
  /** Charged on top when the plan does not include the signature. */
  precio_firma: string | null;
}

/** An Easy Office branch the domicile can be set at. Its address is fixed. */
export interface SucursalDomicilio {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
}

export interface EmpresaContratante {
  rut: string;
  razon_social: string;
  giro: string;
}

export interface RepresentanteContratante {
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  domicilio: string;
  comuna: string;
  region: string;
}

/** What the client's own records hold; blanks where they hold nothing. */
export interface DatosContratante {
  empresa: EmpresaContratante;
  representante: RepresentanteContratante;
  personeria: { fecha_instrumento: string | null; sitio_o_notaria: string };
  contacto: { email_aviso: string; movil_aviso: string };
}

export interface FormularioDomicilio {
  disponible: boolean;
  motivo_no_disponible: string;
  fecha_min: string;
  fecha_max: string;
  planes: PlanDomicilio[];
  sucursales: SucursalDomicilio[];
  datos: DatosContratante | null;
}

/** The contracting party of a service contract (section A of PLT-01 and PLT-02). */
export interface SolicitudContratante {
  empresa: EmpresaContratante;
  representante: RepresentanteContratante;
  personeria: { fecha_instrumento: string; sitio_o_notaria: string };
  email_aviso: string;
  movil_aviso: string;
}

/** The domicile request as the portal sends it. */
export interface SolicitudDomicilio extends SolicitudContratante {
  plan: string;
  sucursal: number;
  fecha_inicio: string;
}

/** A case type an executive can start (GET /api/tramites/tipos/). */
export interface TipoTramiteIniciable {
  codigo: string;
  nombre: string;
}

/** A property a request can name: a branch office or a warehouse. */
export interface InmuebleFormulario {
  id: number;
  tipo: "oficina" | "bodega";
  codigo: string | null;
  nombre: string;
  direccion: string;
  comuna: string;
  region: string;
}

/** A service the case type's contract holds, as the catalogue lists it. */
export interface LineaFormulario {
  servicio: string;
  nombre: string;
  /** Null when the service has no list price: the agreed one is typed. */
  precio_base: string | null;
  precio_confirmado: boolean;
  ciclo_pago_default: string | null;
  /** The property role the line is located at: "sucursal", "bodega". */
  inmueble: string;
}

/** What the backoffice request form offers (GET /api/tramites/formulario/). */
export interface FormularioTramite {
  disponible: boolean;
  /** What is missing, for staff. */
  problemas: string[];
  fecha_min: string;
  fecha_max: string;
  planes: PlanDomicilio[];
  duraciones: number[];
  duracion_por_defecto: number | null;
  inmuebles: Record<string, InmuebleFormulario[]>;
  lineas: LineaFormulario[];
  ciclos_pago: { codigo: string; nombre: string }[];
  datos: DatosContratante | null;
}

/** A line's choices when the type is not sold by plans. */
export interface LineaElegida {
  servicio: string;
  ciclo_pago: string | null;
  precio: string | null;
}

/**
 * A request an executive files or edits (POST/PUT /api/tramites/). A type
 * sold by plan sends ``plan``; otherwise the term and each line's choices.
 */
export interface SolicitudTramite extends SolicitudContratante {
  fecha_inicio: string;
  plan?: string;
  duracion_meses?: number;
  sucursal?: number;
  bodega?: number;
  lineas?: LineaElegida[];
}

/** What a portal request form offers (GET /api/portal/tramites/formulario/). */
export interface FormularioPortal {
  nombre: string;
  disponible: boolean;
  /** A plain reason for the client; never the staff detail. */
  motivo_no_disponible: string;
  fecha_min: string;
  fecha_max: string;
  planes: PlanDomicilio[];
  inmuebles: Record<string, InmuebleFormulario[]>;
  datos: DatosContratante | null;
}

/** A request the client files in the portal for a type sold by plan (PLT-02). */
export interface SolicitudPortal extends SolicitudContratante {
  plan: string;
  fecha_inicio: string;
  sucursal?: number;
  bodega?: number;
}

export interface NuevaSolicitudTramite extends SolicitudTramite {
  tipo: string;
  cliente: number;
}

export interface ContratoTramite {
  folio: string;
  estado: "borrador" | "vigente" | "terminado" | "anulado";
  fecha_inicio: string;
  fecha_vencimiento: string;
  duracion_meses: number;
  email_aviso: string;
  movil_aviso: string;
  servicio: string;
  precio: string | null;
  ciclo_pago: string;
  sucursal: { id: number; nombre: string; direccion: string } | null;
  /** Every line; the keys above repeat the first one. */
  servicios: {
    nombre: string;
    precio: string;
    ciclo_pago: string;
    inmueble: { id: number; tipo: "oficina" | "bodega"; nombre: string; direccion: string } | null;
  }[];
}

export interface VentaTramite {
  id: number;
  folio: string;
  estado: EstadoVenta;
  total: string;
  items: ItemVenta[];
}

export interface EventoTramite {
  fecha: string;
  estado_nuevo: EstadoTramite;
  motivo_nuevo: CodigoMotivo | "";
}

export interface Tramite {
  id: number;
  folio: string;
  tipo: string;
  tipo_codigo: string;
  estado: EstadoTramite;
  motivo: MotivoPendiente | null;
  accion_cliente: AccionCliente;
  editable: boolean;
  datos: {
    plan?: string;
    sucursal?: number;
    bodega?: number;
    fecha_inicio?: string;
    duracion_meses?: number;
    lineas?: LineaElegida[];
  };
  contrato: ContratoTramite | null;
  venta: VentaTramite | null;
  eventos: EventoTramite[];
  created_at: string;
}

export interface EventoTramiteBackoffice extends EventoTramite {
  estado_anterior: EstadoTramite | "";
  motivo_anterior: CodigoMotivo | "";
  detalle: string;
  usuario: string | null;
}

/** The executive also sees the client, the internal note and who moved it. */
export interface TramiteBackoffice extends Omit<Tramite, "eventos"> {
  cliente: { id: number; codigo: string; nombre: string; rut: string };
  detalle_pendiente: string;
  canal: "portal" | "backoffice";
  eventos: EventoTramiteBackoffice[];
}

export type EstadoDocumento = "generado" | "reemplazado" | "firmado";

export interface Firmante {
  orden: number;
  rol: "cliente_representante" | "autorizante";
  nombre: string;
  firmado_en: string | null;
}

export interface Documento {
  id: number;
  version: number;
  estado: EstadoDocumento;
  plantilla: string;
  generado_en: string;
  sha256_docx: string;
  sha256_pdf: string;
  sha256_firmado: string;
  firmado_en: string | null;
  tiene_firmado: boolean;
  firmantes: Firmante[];
}

export type ArchivoDocumento = "pdf" | "docx" | "firmado";
