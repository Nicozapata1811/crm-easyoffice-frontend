import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dashboardService } from "../dashboardService";
import { PanelOperativo } from "../PanelOperativo";
import { resolverPeriodo } from "../periodos";

const INDICADORES_RF14 = [
  "Total de clientes",
  "Clientes nuevos",
  "Servicios activos",
  "Servicios por vencer",
  "Servicios vencidos",
  "Ventas totales",
  "Ventas por servicio",
  "Ventas por ejecutivo",
  "Trámites pendientes",
  "Documentos pendientes de firma",
];

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <PanelOperativo />
    </QueryClientProvider>,
  );
}

describe("PanelOperativo", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows every RF-14 indicator", async () => {
    renderPanel();

    for (const indicador of INDICADORES_RF14) {
      expect(await screen.findByRole("region", { name: indicador })).toBeInTheDocument();
    }
  });

  it("marks amounts as example values", async () => {
    renderPanel();

    const ventas = await screen.findByRole("region", { name: "Ventas totales" });
    expect(within(ventas).getByText(/Valor de ejemplo/)).toBeInTheDocument();
  });

  it("asks for the indicators of the selected period", async () => {
    const getIndicators = vi.spyOn(dashboardService, "getIndicators");
    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("combobox", { name: "Período" }));
    await user.click(screen.getByRole("option", { name: "Últimos 90 días" }));

    await vi.waitFor(() =>
      expect(getIndicators).toHaveBeenLastCalledWith(resolverPeriodo("ultimos-90")),
    );
  });
});
