import type { TonoEstado } from "../../../components/EstadoPill";

const DIAS_URGENTE = 7;
const DIAS_PROXIMO = 30;

/** What the chip says. The days always come from the backend, never the browser's clock. */
export function etiquetaDias(dias: number, renovacionAutomatica: boolean): string {
  if (dias < 0) return renovacionAutomatica ? "Término inicial cumplido" : "Vencido";
  if (dias === 0) return "Vence hoy";
  return dias === 1 ? "1 día" : `${dias} días`;
}

export function tonoDias(dias: number, renovacionAutomatica: boolean): TonoEstado {
  // ASSUMPTION: pending validation with Easy Office. The rolling term of an
  // auto-renewing contract is not modelled, so past its stored expiry it is not
  // known to have lapsed.
  if (dias < 0) return renovacionAutomatica ? "neutro" : "alerta";
  if (dias <= DIAS_URGENTE) return "alerta";
  return dias <= DIAS_PROXIMO ? "espera" : "progreso";
}
