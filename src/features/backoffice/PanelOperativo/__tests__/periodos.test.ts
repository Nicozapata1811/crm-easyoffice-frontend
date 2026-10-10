import { describe, expect, it } from "vitest";

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
