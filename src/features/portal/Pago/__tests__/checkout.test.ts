/** All data here is synthetic. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { obtenerOrden, pagarVenta } from "../../../../api/portal";
import { cargarScript } from "../../../../lib/cargarScript";
import { esperarOrdenLista, PagoNoDisponibleError, pagar } from "../checkout";
import { ORDEN, ORDEN_FLOW, ORDEN_LISTA } from "./fixtures";

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

describe("pagar", () => {
  afterEach(() => {
    delete window.KLAP_FLEX;
    vi.restoreAllMocks();
    vi.mocked(cargarScript).mockReset();
  });

  it("opens Klap's modal with the provider's order id", async () => {
    const init = vi.fn();
    vi.mocked(pagarVenta).mockResolvedValue(ORDEN);
    vi.mocked(obtenerOrden).mockResolvedValue(ORDEN_LISTA);
    vi.mocked(cargarScript).mockImplementation(async () => {
      window.KLAP_FLEX = { init };
    });
    const alTerminar = vi.fn();
    const alCancelar = vi.fn();

    await pagar(ORDEN.venta, "klap", { alTerminar, alCancelar });

    expect(pagarVenta).toHaveBeenCalledWith(ORDEN.venta, "klap");

    expect(cargarScript).toHaveBeenCalledWith(ORDEN.checkout_script_url);
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "KLAP-41", useModal: true }),
    );
    init.mock.calls[0][0].callbackFunction({ status: "ok" });
    expect(alTerminar).toHaveBeenCalledWith(ORDEN_LISTA);
    init.mock.calls[0][0].closeModalFunction();
    expect(alCancelar).toHaveBeenCalledWith(ORDEN_LISTA);
  });

  it("refuses when the backend offers no checkout", async () => {
    vi.mocked(pagarVenta).mockResolvedValue(ORDEN);
    vi.mocked(obtenerOrden).mockResolvedValue({ ...ORDEN_LISTA, checkout_script_url: null });

    await expect(
      pagar(ORDEN.venta, "klap", { alTerminar: vi.fn(), alCancelar: vi.fn() }),
    ).rejects.toBeInstanceOf(PagoNoDisponibleError);
  });

  it("sends the browser to Flow's page", async () => {
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign });
    vi.mocked(pagarVenta).mockResolvedValue({ ...ORDEN, proveedor: "flow" });
    vi.mocked(obtenerOrden).mockResolvedValue(ORDEN_FLOW);

    await pagar(ORDEN.venta, "flow", { alTerminar: vi.fn(), alCancelar: vi.fn() });

    expect(pagarVenta).toHaveBeenCalledWith(ORDEN.venta, "flow");
    expect(assign).toHaveBeenCalledWith(ORDEN_FLOW.redirect_url);
    expect(cargarScript).not.toHaveBeenCalled();
  });
});
