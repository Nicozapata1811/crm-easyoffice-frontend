/** All data here is synthetic. */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatearFecha } from "../../../../lib/formato";
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

function indicadores(periodo: Periodo, cambios: Partial<IndicadoresPanel> = {}): IndicadoresPanel {
  return {
    periodo,
    fecha_referencia: periodo.hasta,
    clientes: { total: 40, nuevos: 5 },
    servicios: { activos: 96, por_vencer: 7, vencidos: 4, dias_aviso: 30 },
    ventas: {
      moneda: "CLP",
      total: 90_000,
      por_servicio: [{ servicio: "Domicilio tributario", monto: 90_000, cantidad: 2 }],
      por_ejecutivo: [
        { ejecutivo: "Ejecutiva de Prueba", monto: 50_000, cantidad: 1 },
        { ejecutivo: "En línea (sin ejecutivo)", monto: 40_000, cantidad: 1 },
      ],
    },
    tramites_pendientes: 18,
    tramites_pendientes_por_motivo: [
      { motivo: "firma", nombre: "Firma pendiente", cantidad: 6 },
      { motivo: "pago", nombre: "Pago pendiente", cantidad: 12 },
    ],
    documentos_pendientes_firma: 6,
    datos_de_ejemplo: [],
    ...cambios,
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
      indicadores(periodo),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows every RF-14 indicator", async () => {
    renderPanel();

    for (const indicador of INDICADORES_RF14) {
      expect(await screen.findByRole("region", { name: indicador })).toBeInTheDocument();
    }
  });

  it("shows no example labels", async () => {
    renderPanel();

    await screen.findByRole("region", { name: "Ventas totales" });
    expect(screen.queryByText(/ejemplo/i)).not.toBeInTheDocument();
  });

  it("dates the point-in-time figures", async () => {
    renderPanel();

    const vencidos = await screen.findByRole("region", { name: "Servicios vencidos" });
    const hasta = resolverPeriodo("mes-actual").hasta;
    expect(within(vencidos).getByText(`Al ${formatearFecha(hasta)}`)).toBeInTheDocument();
  });

  it("breaks pending cases down by reason", async () => {
    renderPanel();

    const tramites = await screen.findByRole("region", { name: "Trámites pendientes" });
    const motivos = within(tramites).getByRole("list", { name: "Pendientes por motivo" });
    const filas = within(motivos).getAllByRole("listitem");
    expect(filas.map((fila) => fila.textContent)).toEqual(["Firma pendiente6", "Pago pendiente12"]);
  });

  it("shows the online sales group and the note on backoffice contracts", async () => {
    renderPanel();

    const porEjecutivo = await screen.findByRole("region", { name: "Ventas por ejecutivo" });
    expect(within(porEjecutivo).getByText("En línea (sin ejecutivo)")).toBeInTheDocument();
    expect(screen.getByText(/Solo ventas pagadas en línea/)).toBeInTheDocument();
  });

  it("shows an empty period without breaking", async () => {
    vi.mocked(dashboardService.getIndicators).mockImplementation(async (periodo) =>
      indicadores(periodo, {
        servicios: { activos: 0, por_vencer: 0, vencidos: 0, dias_aviso: 30 },
        ventas: { moneda: "CLP", total: 0, por_servicio: [], por_ejecutivo: [] },
        tramites_pendientes: 0,
        tramites_pendientes_por_motivo: [],
        documentos_pendientes_firma: 0,
      }),
    );
    renderPanel();

    for (const titulo of ["Ventas por servicio", "Ventas por ejecutivo"]) {
      const desglose = await screen.findByRole("region", { name: titulo });
      expect(within(desglose).getByText("Sin ventas en el período.")).toBeInTheDocument();
    }
    const tramites = screen.getByRole("region", { name: "Trámites pendientes" });
    expect(within(tramites).queryByRole("list")).not.toBeInTheDocument();
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
