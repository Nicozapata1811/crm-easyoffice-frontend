/** All data here is synthetic. */

import { describe, expect, it } from "vitest";

import { detalleDe } from "../cambios";
import {
  CIERRE_SESION,
  CREACION,
  ELIMINACION,
  INGRESO_FALLIDO,
  MODIFICACION,
  ROL_AGREGADO,
} from "./fixtures";

describe("detalleDe", () => {
  it("shows only the new values of a creation", () => {
    expect(detalleDe(CREACION)).toEqual({
      titulo: "Valores nuevos",
      lineas: [
        { campo: "Activo", texto: "Sí" },
        { campo: "Razon social", texto: "Transportes Antiguos SpA" },
      ],
    });
  });

  it("shows only the old values of a deletion", () => {
    expect(detalleDe(ELIMINACION)).toEqual({
      titulo: "Valores anteriores",
      lineas: [{ campo: "Razon social", texto: "Transportes Antiguos SpA" }],
    });
  });

  it("shows a change field by field, before and after", () => {
    expect(detalleDe(MODIFICACION)).toEqual({
      titulo: "Cambios",
      lineas: [
        { campo: "Giro", texto: "(vacío) → Transporte de carga" },
        { campo: "Razon social", texto: "Transportes Antiguos SpA → Transportes Austral de Ejemplo SpA" },
      ],
    });
  });

  it("marks the missing side of a role added or removed", () => {
    expect(detalleDe(ROL_AGREGADO).lineas).toEqual([{ campo: "Rol", texto: "— → Ejecutivo" }]);
    expect(
      detalleDe({ ...ROL_AGREGADO, valor_anterior: { rol: "Ejecutivo" }, valor_nuevo: null }).lineas,
    ).toEqual([{ campo: "Rol", texto: "Ejecutivo → —" }]);
  });

  it("tells an empty value from a missing one, and prints nested values", () => {
    const { lineas } = detalleDe({
      ...MODIFICACION,
      valor_anterior: { telefono: null, activo: true },
      valor_nuevo: { telefono: "+56 9 0000 0000", activo: false, configuracion: { planes: ["anual"] } },
    });

    expect(lineas).toEqual([
      { campo: "Activo", texto: "Sí → No" },
      { campo: "Configuracion", texto: '— → {"planes":["anual"]}' },
      { campo: "Telefono", texto: "(vacío) → +56 9 0000 0000" },
    ]);
  });

  it("shows a stored timestamp in Chile time and leaves a plain date alone", () => {
    const { lineas } = detalleDe({
      ...CREACION,
      valor_nuevo: { date_joined: "2026-11-03T02:05:39.81021+00:00", vigente_desde: "2026-01-15" },
    });

    expect(lineas[0].campo).toBe("Date joined");
    expect(lineas[0].texto).toMatch(/02-11-2026.*23:05:39/);
    expect(lineas[1]).toEqual({ campo: "Vigente desde", texto: "2026-01-15" });
  });

  it("keeps a masked password masked", () => {
    const { lineas } = detalleDe({
      ...MODIFICACION,
      valor_anterior: { password: "***" },
      valor_nuevo: { password: "***" },
    });

    expect(lineas).toEqual([{ campo: "Password", texto: "*** → ***" }]);
  });

  it("shows what an event recorded, or nothing when it recorded nothing", () => {
    expect(detalleDe(INGRESO_FALLIDO)).toEqual({
      titulo: "Datos registrados",
      lineas: [{ campo: "Email", texto: "alguien@example.test" }],
    });
    expect(detalleDe(CIERRE_SESION).lineas).toEqual([]);
  });
});
