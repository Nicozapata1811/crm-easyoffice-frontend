/** All data here is synthetic. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { obtenerOrden, pagarVenta } from "../../../../api/portal";
import { cargarScript } from "../../../../lib/cargarScript";
import { esperarOrdenLista, PagoNoDisponibleError, pagarConKlap } from "../checkoutKlap";
import { ORDEN, ORDEN_LISTA } from "./fixtures";

vi.mock("../../../../api/portal", () => ({ obtenerOrden: vi.fn(), pagarVenta: vi.fn() }));
vi.mock("../../../../lib/cargarScript", () => ({ cargarScript: vi.fn() }));

describe("esperarOrdenLista", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("polls until the provider has the order", async () => {
    vi.mocked(obtenerOrden)
      .mockResolvedValueOnce(ORDEN)
      .mockResolvedValueOnce(ORDEN)
      .mockResolvedValueOnce(ORDEN_LISTA);

    const lista = esperarOrdenLista(ORDEN.id);
    await vi.runAllTimersAsync();

    await expect(lista).resolves.toEqual(ORDEN_LISTA);
    expect(obtenerOrden).toHaveBeenCalledTimes(3);
  });

  it("stops when the order fails", async () => {
    vi.mocked(obtenerOrden).mockResolvedValue({ ...ORDEN, estado: "error" });

    await expect(esperarOrdenLista(ORDEN.id)).rejects.toBeInstanceOf(PagoNoDisponibleError);
  });

  it("gives up after the time limit", async () => {
    vi.mocked(obtenerOrden).mockResolvedValue(ORDEN);

    const lista = expect(esperarOrdenLista(ORDEN.id)).rejects.toBeInstanceOf(PagoNoDisponibleError);
    await vi.runAllTimersAsync();
    await lista;
  });
});

describe("pagarConKlap", () => {
  afterEach(() => {
    delete window.KLAP_FLEX;
  });

  it("opens Klap's modal with the provider's order id", async () => {
    const init = vi.fn();
    vi.mocked(pagarVenta).mockResolvedValue(ORDEN);
    vi.mocked(obtenerOrden).mockResolvedValue(ORDEN_LISTA);
    vi.mocked(cargarScript).mockImplementation(async () => {
      window.KLAP_FLEX = { init };
    });
    const alTerminar = vi.fn();

    await pagarConKlap(ORDEN.venta, alTerminar);

    expect(cargarScript).toHaveBeenCalledWith(ORDEN.checkout_script_url);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "KLAP-41", useModal: true }),
    );
    init.mock.calls[0][0].closeModalFunction();
    expect(alTerminar).toHaveBeenCalledWith(ORDEN_LISTA);
  });

  it("refuses when the backend offers no checkout", async () => {
    vi.mocked(pagarVenta).mockResolvedValue(ORDEN);
    vi.mocked(obtenerOrden).mockResolvedValue({ ...ORDEN_LISTA, checkout_script_url: null });

    await expect(pagarConKlap(ORDEN.venta, vi.fn())).rejects.toBeInstanceOf(PagoNoDisponibleError);
  });
});
