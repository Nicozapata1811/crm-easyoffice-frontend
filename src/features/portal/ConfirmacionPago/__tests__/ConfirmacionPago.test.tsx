/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { crearVenta, listarMediosPago, listarServicios } from "../../../../api/portal";
import { pagar } from "../../Pago/checkout";
import { MEDIOS, ORDEN_LISTA, SERVICIOS, VENTA } from "../../Pago/__tests__/fixtures";
import { ConfirmacionPago } from "../ConfirmacionPago";

vi.mock("../../../../api/portal", () => ({
  crearVenta: vi.fn(),
  listarMediosPago: vi.fn(),
  listarServicios: vi.fn(),
}));
vi.mock("../../Pago/checkout", async (original) => ({
  ...(await original()),
  pagar: vi.fn(),
}));

function renderPago() {
  const router = createMemoryRouter(
    [
      { path: "/tramites/:tramiteId/pago", element: <ConfirmacionPago /> },
      { path: "/pagos/:ordenId/:resultado", element: <p>Resultado</p> },
    ],
    { initialEntries: ["/tramites/domicilio-tributario/pago"] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("ConfirmacionPago", () => {
  beforeEach(() => {
    vi.mocked(listarServicios).mockResolvedValue(SERVICIOS);
    vi.mocked(crearVenta).mockResolvedValue(VENTA);
    vi.mocked(listarMediosPago).mockResolvedValue(MEDIOS);
    vi.mocked(pagar).mockReset();
  });

  it("shows the API's prices, labelled as examples", async () => {
    renderPago();

    expect(await screen.findByText("Domicilio tributario")).toBeInTheDocument();
    expect(screen.getByText(/\$18\.400/)).toBeInTheDocument();
    expect(screen.getByText(/Valores de ejemplo/)).toBeInTheDocument();
  });

  it("records the sale once and opens the checkout", async () => {
    vi.mocked(pagar).mockRejectedValueOnce(new Error("red")).mockResolvedValue(ORDEN_LISTA);
    const user = userEvent.setup();
    renderPago();

    await user.click(await screen.findByRole("button", { name: "Pagar y enviar a firma" }));
    expect(await screen.findByText(/No pudimos conectar/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pagar y enviar a firma" }));

    expect(crearVenta).toHaveBeenCalledTimes(1);
    expect(crearVenta).toHaveBeenCalledWith([
      { servicio: "domicilio-tributario", cantidad: 1 },
      { servicio: "firma-electronica-avanzada", cantidad: 1 },
    ]);
    expect(pagar).toHaveBeenLastCalledWith(VENTA.id, "klap", expect.any(Object));
  });

  it("pays with the method the client picks", async () => {
    vi.mocked(pagar).mockResolvedValue(ORDEN_LISTA);
    const user = userEvent.setup();
    renderPago();

    const flow = await screen.findByRole("radio", { name: /Flow/ });
    expect(screen.getByRole("radio", { name: /Tarjeta/ })).toHaveAttribute("aria-checked", "true");
    await user.click(flow);
    await user.click(screen.getByRole("button", { name: "Pagar y enviar a firma" }));

    expect(flow).toHaveAttribute("aria-checked", "true");
    expect(pagar).toHaveBeenLastCalledWith(VENTA.id, "flow", expect.any(Object));
  });
});
