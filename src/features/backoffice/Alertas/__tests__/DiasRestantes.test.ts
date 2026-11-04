import { describe, expect, it } from "vitest";

import { etiquetaDias, tonoDias } from "../dias";

describe("tonoDias", () => {
  it.each([
    [31, false, "progreso"],
    [30, false, "espera"],
    [8, false, "espera"],
    [7, false, "alerta"],
    [0, false, "alerta"],
    [-1, false, "alerta"],
    [-1, true, "neutro"],
  ])("%i days, auto-renewing %s: %s", (dias, renueva, esperado) => {
    expect(tonoDias(dias, renueva)).toBe(esperado);
  });
});

describe("etiquetaDias", () => {
  it.each([
    [30, false, "30 días"],
    [2, false, "2 días"],
    [1, false, "1 día"],
    [0, false, "Vence hoy"],
    [-1, false, "Vencido"],
    [-1, true, "Término inicial cumplido"],
    [10, true, "10 días"],
  ])("%i days, auto-renewing %s: %s", (dias, renueva, esperado) => {
    expect(etiquetaDias(dias, renueva)).toBe(esperado);
  });
});
