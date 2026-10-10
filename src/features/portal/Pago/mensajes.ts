import { ApiError } from "../../../api/client";
import { PagoNoDisponibleError } from "./checkout";

export function mensajeDePago(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "Esta compra ya no está pendiente de pago.";
  }
  if (error instanceof PagoNoDisponibleError) {
    return "No pudimos iniciar el pago. Intenta nuevamente en unos minutos.";
  }
  return "No pudimos conectar con el servidor. Intenta nuevamente.";
}
