/**
 * Domain types, named in Spanish to match the backend and the counterpart's
 * vocabulary.
 *
 * These cover only what the shell needs. Fields are added as the backend
 * exposes them; nothing here is invented ahead of the API contract.
 *
 * ASSUMPTION: pending validation with Easy Office. The set of estados and the
 * transitions between them are not defined yet, so EstadoTramite is a string
 * alias rather than a union of literals. Narrowing it to real states is a
 * one-line change once RN-001 exists.
 */

export type EstadoTramite = string;

export interface TipoTramite {
  id: string;
  nombre: string;
  descripcion: string;
  requierePago: boolean;
  requiereFirma: boolean;
  dentroDelMvp: boolean;
  requiereGestionHumana: boolean;
}

export interface Empresa {
  id: string;
  rut: string;
  razonSocial: string;
  nombreFantasia: string;
  giro: string;
}

export interface RepresentanteLegal {
  id: string;
  rut: string;
  nombreCompleto: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
}

export interface Oficina {
  id: string;
  nombre: string;
  rolDeAvaluo: string;
  direccionCompleta: string;
  comuna: string;
  region: string;
}

export interface Firmante {
  id: string;
  nombreCompleto: string;
  email: string;
  haFirmado: boolean;
}

export interface Documento {
  id: string;
  nombre: string;
  generadoEn: string;
  firmantes: Firmante[];
}

export interface Tramite {
  id: string;
  tipoTramite: TipoTramite;
  estado: EstadoTramite;
  creadoEn: string;
  actualizadoEn: string;
}
