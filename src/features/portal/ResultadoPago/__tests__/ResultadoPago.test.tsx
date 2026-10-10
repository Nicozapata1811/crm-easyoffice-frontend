/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { obtenerOrden } from "../../../../api/portal";
import type { EstadoOrden } from "../../../../types/ventas";
import { pagarConKlap } from "../../Pago/checkoutKlap";
import { ORDEN_LISTA } from "../../Pago/__tests__/fixtures";
import { ResultadoPago } from "../ResultadoPago";

vi.mock("../../../../api/portal", () => ({ obtenerOrden: vi.fn() }));
vi.mock("../../Pago/checkoutKlap", async (original) => ({
  ...(await original()),
  pagarConKlap: vi.fn(),
}));

function renderResultado() {
  const router = createMemoryRouter(
    [{ path: "/pagos/:ordenId/resultado", element: <ResultadoPago /> }],
    { initialEntries: [`/pagos/${ORDEN_LISTA.id}/resultado`] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function conEstado(estado: EstadoOrden) {
  vi.mocked(obtenerOrden).mockResolvedValue({ ...ORDEN_LISTA, estado });
}

describe("ResultadoPago", () => {
  beforeEach(() => vi.mocked(pagarConKlap).mockReset());

  it("confirms a paid order without offering to pay again", async () => {
    conEstado("pagada");
    renderResultado();

    expect(await screen.findByText("Pago confirmado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Intentar de nuevo/ })).not.toBeInTheDocument();
  });

  it("offers a retry on the same sale after a rejection", async () => {
    conEstado("rechazada");
    const user = userEvent.setup();
    renderResultado();

    await user.click(await screen.findByRole("button", { name: "Intentar de nuevo" }));

    expect(pagarConKlap).toHaveBeenCalledWith(ORDEN_LISTA.venta, expect.any(Function));
  });

  it("waits for the backend while the order is pending", async () => {
    conEstado("pendiente");
    renderResultado();

    expect(await screen.findByText("Estamos confirmando tu pago")).toBeInTheDocument();
    expect(screen.getByLabelText("Esperando confirmación")).toBeInTheDocument();
  });
});
