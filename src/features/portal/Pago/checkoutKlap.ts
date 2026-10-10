import { obtenerOrden, pagarVenta } from "../../../api/portal";
import { cargarScript } from "../../../lib/cargarScript";
import type { OrdenPago } from "../../../types/ventas";

export const INTERVALO_MS = 1000;
export const LIMITE_MS = 20_000;

export class PagoNoDisponibleError extends Error {}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Poll until the backend has created the order at the provider. */
export async function esperarOrdenLista(ordenId: number): Promise<OrdenPago> {
  const limite = Date.now() + LIMITE_MS;
  for (;;) {
    const orden = await obtenerOrden(ordenId);
    if (orden.estado === "pendiente" && orden.id_externo) return orden;
    if (orden.estado !== "creando") {
      throw new PagoNoDisponibleError(`La orden quedó en estado ${orden.estado}.`);
    }
    if (Date.now() > limite) {
      throw new PagoNoDisponibleError("El proveedor de pago no respondió a tiempo.");
    }
    await esperar(INTERVALO_MS);
  }
}

export interface AlCerrarCheckout {
  /** Klap reports the payment finished, approved or not. */
  alTerminar: (orden: OrdenPago) => void;
  /** The client closed the modal. */
  alCancelar: (orden: OrdenPago) => void;
}

/**
 * Start (or resume) paying a sale and open Klap's checkout modal.
 *
 * Either callback only decides where to go next; the backend's order state,
 * not the modal's report, decides whether the sale was paid.
 */
export async function pagarConKlap(
  ventaId: number,
  { alTerminar, alCancelar }: AlCerrarCheckout,
): Promise<OrdenPago> {
  const orden = await esperarOrdenLista((await pagarVenta(ventaId)).id);
  if (!orden.checkout_script_url || !orden.id_externo) {
    throw new PagoNoDisponibleError("El pago en línea no está habilitado.");
  }
  await cargarScript(orden.checkout_script_url);
  if (!window.KLAP_FLEX) throw new PagoNoDisponibleError("No se pudo abrir el pago.");

  window.KLAP_FLEX.init({
    orderId: orden.id_externo,
    useModal: true,
    callbackFunction: () => alTerminar(orden),
    closeModalFunction: () => alCancelar(orden),
  });
  return orden;
}
