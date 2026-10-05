import { describe, expect, it } from "vitest";

import { mockDashboardService } from "../dashboardService";
import { diasDelPeriodo, resolverPeriodo } from "../periodos";

const HOY = new Date(2026, 8, 30);

describe("resolverPeriodo", () => {
  it.each([
    ["mes-actual", "2026-09-01", "2026-09-30"],
    ["mes-anterior", "2026-08-01", "2026-08-31"],
    ["ultimos-90", "2026-07-03", "2026-09-30"],
    ["anio-actual", "2026-01-01", "2026-09-30"],
  ] as const)("%s covers %s to %s", (id, desde, hasta) => {
    expect(resolverPeriodo(id, HOY)).toEqual({ desde, hasta });
  });

  it("counts both ends of the range", () => {
    expect(diasDelPeriodo(resolverPeriodo("ultimos-90", HOY))).toBe(90);
  });
});

describe("mockDashboardService", () => {
  const mes = resolverPeriodo("mes-actual", HOY);
  const anio = resolverPeriodo("anio-actual", HOY);

  it("keeps the sales breakdowns consistent with the total", async () => {
    const { ventas } = await mockDashboardService.getIndicators(mes);

    const sumaServicios = ventas.por_servicio.reduce((suma, v) => suma + v.monto, 0);
    const sumaEjecutivos = ventas.por_ejecutivo.reduce((suma, v) => suma + v.monto, 0);
    expect(sumaServicios).toBe(ventas.total);
    expect(sumaEjecutivos).toBe(ventas.total);
  });

  it("returns the same figures for the same period", async () => {
    expect(await mockDashboardService.getIndicators(mes)).toEqual(
      await mockDashboardService.getIndicators(mes),
    );
  });

  it("scales sales with the length of the period", async () => {
    const delMes = await mockDashboardService.getIndicators(mes);
    const delAnio = await mockDashboardService.getIndicators(anio);

    expect(delAnio.ventas.total).toBeGreaterThan(delMes.ventas.total);
    expect(delAnio.periodo).toEqual(anio);
  });
});
