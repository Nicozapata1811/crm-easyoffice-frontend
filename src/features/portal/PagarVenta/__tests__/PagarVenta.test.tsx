/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarMediosPago, obtenerVenta } from "../../../../api/portal";
import { pagar } from "../../Pago/checkout";
import { MEDIOS, ORDEN_FLOW, VENTA } from "../../Pago/__tests__/fixtures";
import { PagarVenta } from "../PagarVenta";

vi.mock("../../../../api/portal", () => ({ listarMediosPago: vi.fn(), obtenerVenta: vi.fn() }));
vi.mock("../../Pago/checkout", async (original) => ({ ...(await original()), pagar: vi.fn() }));

function renderPagar() {
  const router = createMemoryRouter(
    [
      { path: "/mis-compras/:ventaId/pagar", element: <PagarVenta /> },
      { path: "/mis-compras", element: <p>Mis compras</p> },
    ],
    { initialEntries: [`/mis-compras/${VENTA.id}/pagar`] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("PagarVenta", () => {
  beforeEach(() => {
    vi.mocked(listarMediosPago).mockResolvedValue(MEDIOS);
    vi.mocked(pagar).mockReset();
  });

  it("pays a pending sale with the chosen method", async () => {
    vi.mocked(obtenerVenta).mockResolvedValue({
      ...VENTA,
      items: [
        {
          servicio: "domicilio-tributario",
          nombre: "Domicilio tributario",
          precio_unitario: "18400",
          cantidad: 1,
          subtotal: "18400",
        },
      ],
    });
    vi.mocked(pagar).mockResolvedValue(ORDEN_FLOW);
    const user = userEvent.setup();
    renderPagar();

    await user.click(await screen.findByRole("radio", { name: /Flow/ }));
    await user.click(screen.getByRole("button", { name: "Pagar" }));

    expect(screen.getByText("VEN-000009")).toBeInTheDocument();
    expect(pagar).toHaveBeenCalledWith(VENTA.id, "flow", expect.any(Object));
  });

  it("sends a sale that is no longer pending back to the list", async () => {
    vi.mocked(obtenerVenta).mockResolvedValue({ ...VENTA, estado: "pagada" });

    const router = renderPagar();

    expect(await screen.findByText("Mis compras")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/mis-compras");
  });
});
