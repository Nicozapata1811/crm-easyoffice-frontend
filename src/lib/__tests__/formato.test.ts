import { describe, expect, it } from "vitest";

import { formatearFechaHoraChile } from "../formato";

describe("formatearFechaHoraChile", () => {
  it("uses Chile's summer time, three hours behind UTC", () => {
    expect(formatearFechaHoraChile("2026-01-15T15:30:05Z")).toMatch(/12:30:05/);
  });

  it("uses Chile's winter time, four hours behind UTC", () => {
    expect(formatearFechaHoraChile("2026-07-15T15:30:05Z")).toMatch(/11:30:05/);
  });

  it("moves to the previous day when Chile is still there", () => {
    expect(formatearFechaHoraChile("2026-07-15T02:00:00Z")).toMatch(/14.*22:00:00/);
  });
});
