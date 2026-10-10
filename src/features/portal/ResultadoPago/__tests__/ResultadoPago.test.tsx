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

function renderResultado(resultado = "resultado") {
  const router = createMemoryRouter(
    [{ path: "/pagos/:ordenId/:resultado", element: <ResultadoPago /> }],
    { initialEntries: [`/pagos/${ORDEN_LISTA.id}/${resultado}`] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

function conEstado(estado: EstadoOrden) {
  vi.mocked(obtenerOrden).mockResolvedValue({ ...ORDEN_LISTA, estado });
}

describe("ResultadoPago", () => {
  beforeEach(() => vi.mocked(pagarConKlap).mockReset());

  it.each([
    ["pagada", "aprobado", "Pago confirmado"],
    ["rechazada", "rechazado", "El pago fue rechazado"],
    ["cancelada", "cancelado", "Cancelaste el pago"],
    ["expirada", "expirado", "El plazo para pagar venció"],
    ["reembolsada", "reembolsado", "El pago fue devuelto"],
    ["error", "error", "No pudimos completar el pago"],
  ] as const)("sends a %s order to /%s", async (estado, ruta, titulo) => {
    conEstado(estado);

    const router = renderResultado();

    expect(await screen.findByText(titulo)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/pagos/${ORDEN_LISTA.id}/${ruta}`);
  });

  it("corrects a cancel page when the backend says it was paid", async () => {
    conEstado("pagada");

    const router = renderResultado("cancelado");

    expect(await screen.findByText("Pago confirmado")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/pagos/${ORDEN_LISTA.id}/aprobado`);
    expect(screen.queryByRole("button", { name: /Intentar|Pagar/ })).not.toBeInTheDocument();
  });

  it("shows a cancelled checkout while the order is still open", async () => {
    conEstado("pendiente");
    const user = userEvent.setup();

    renderResultado("cancelado");
    await user.click(await screen.findByRole("button", { name: "Pagar ahora" }));

    expect(screen.getByText("Cancelaste el pago")).toBeInTheDocument();
    expect(pagarConKlap).toHaveBeenCalledWith(ORDEN_LISTA.venta, expect.any(Object));
  });

  it("waits for the backend while the order is pending", async () => {
    conEstado("pendiente");

    renderResultado();

    expect(await screen.findByText("Estamos confirmando tu pago")).toBeInTheDocument();
    expect(screen.getByLabelText("Esperando confirmación")).toBeInTheDocument();
  });
});
