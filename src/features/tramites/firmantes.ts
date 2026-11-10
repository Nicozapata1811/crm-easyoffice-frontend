import type { TonoEstado } from "../../components/EstadoPill";
import type { EstadoFirmante, EstadoSolicitudFirma, Firmante, Tramite } from "../../types/tramites";
import { esBodega } from "./contrato";

const ESTADOS: Record<EstadoFirmante, { etiqueta: string; tono: TonoEstado }> = {
  pendiente: { etiqueta: "Pendiente", tono: "progreso" },
  firmado: { etiqueta: "Firmado", tono: "completo" },
  rechazado: { etiqueta: "Rechazó", tono: "alerta" },
};

export function estadoFirmante(firmante: Firmante) {
  return ESTADOS[firmante.estado];
}

// The parties of the documents Easy Office is not a party to (PLT-03 …).
const PARTES: Partial<Record<Firmante["rol"], string>> = {
  arrendador: "Arrendador",
  arrendatario: "Arrendatario",
  accionista: "Accionista",
};

/** Who a signer is in the contract, in the client's words. */
export function rolFirmante(firmante: Firmante, tramite: Tramite): string {
  if (firmante.rol === "cliente_representante") return "Representante legal";
  if (firmante.rol === "representante_emisor") return "Easy Office";
  const parte = PARTES[firmante.rol];
  if (parte) return parte;
  return esBodega(tramite) ? "Propietario de la bodega" : "Propietario de la oficina";
}

export const ESTADO_SOLICITUD: Record<EstadoSolicitudFirma, string> = {
  creando: "Enviando al proveedor",
  enviada: "En firma",
  completada: "Completada",
  rechazada: "Rechazada",
  expirada: "Expirada",
  cancelada: "Cancelada",
  error: "Con error",
};
