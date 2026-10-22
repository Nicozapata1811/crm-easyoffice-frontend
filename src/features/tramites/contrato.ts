import type { ContratoTramite, Tramite } from "../../types/tramites";

/** The warehouse a contract's lines are located at, if any (PLT-02). */
export function bodegaDe(contrato: ContratoTramite) {
  return contrato.servicios.find((linea) => linea.inmueble?.tipo === "bodega")?.inmueble ?? null;
}

/** Whether the case's contract authorises a warehouse rather than a domicile. */
export function esBodega(tramite: Tramite): boolean {
  return tramite.contrato !== null && bodegaDe(tramite.contrato) !== null;
}
