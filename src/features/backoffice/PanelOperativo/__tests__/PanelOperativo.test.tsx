/** All data here is synthetic. */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IndicadoresPanel, Periodo } from "../../../../types/panel";
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

function indicadores(periodo: Periodo, datosDeEjemplo: string[]): IndicadoresPanel {
  return {
    periodo,
    clientes: { total: 40, nuevos: 5 },
    servicios: { activos: 96, por_vencer: 7, vencidos: 4, dias_aviso: 30 },
    ventas: {
      moneda: "CLP",
      total: 90_000,
      por_servicio: [{ servicio: "Domicilio tributario", monto: 90_000, cantidad: 2 }],
      por_ejecutivo: [{ ejecutivo: "Ejecutivo/a de ejemplo 1", monto: 90_000, cantidad: 2 }],
    },
    tramites_pendientes: 18,
    documentos_pendientes_firma: 6,
    datos_de_ejemplo: datosDeEjemplo,
  };
}

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <PanelOperativo />
    </QueryClientProvider>,
  );
}

describe("PanelOperativo", () => {
  beforeEach(() => {
    vi.spyOn(dashboardService, "getIndicators").mockImplementation(async (periodo) =>
      indicadores(periodo, ["servicios", "ventas"]),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows every RF-14 indicator", async () => {
    renderPanel();

    for (const indicador of INDICADORES_RF14) {
      expect(await screen.findByRole("region", { name: indicador })).toBeInTheDocument();
    }
  });

  it("labels only the indicators the backend flags as example data", async () => {
    renderPanel();

    const ventas = await screen.findByRole("region", { name: "Ventas totales" });
    const clientes = screen.getByRole("region", { name: "Total de clientes" });
    expect(within(ventas).getByText("Valor de ejemplo · en el período")).toBeInTheDocument();
    expect(within(clientes).queryByText(/ejemplo/)).not.toBeInTheDocument();
  });

  it("hides the example notice once every figure is real", async () => {
    vi.mocked(dashboardService.getIndicators).mockImplementation(async (periodo) =>
      indicadores(periodo, []),
    );
    renderPanel();

    await screen.findByRole("region", { name: "Ventas totales" });
    expect(screen.queryByText(/valores de ejemplo/i)).not.toBeInTheDocument();
  });

  it("asks for the indicators of the selected period", async () => {
    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("combobox", { name: "Período" }));
    await user.click(screen.getByRole("option", { name: "Últimos 90 días" }));

    await vi.waitFor(() =>
      expect(dashboardService.getIndicators).toHaveBeenLastCalledWith(
        resolverPeriodo("ultimos-90"),
        expect.any(AbortSignal),
      ),
    );
  });

  it("exports the selected period to Excel", async () => {
    const exportar = vi.spyOn(dashboardService, "exportIndicators").mockResolvedValue();
    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Exportar a Excel" }));

    expect(exportar).toHaveBeenCalledWith(resolverPeriodo("mes-actual"));
  });

  it("tells the user when the export fails", async () => {
    vi.spyOn(dashboardService, "exportIndicators").mockRejectedValue(new Error("500"));
    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Exportar a Excel" }));

    expect(await screen.findByText(/No pudimos generar el archivo Excel/)).toBeInTheDocument();
  });
});
