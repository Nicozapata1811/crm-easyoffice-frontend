import { describe, expect, it } from "vitest";

import { catalogoSchema } from "../catalogo";
import { RESPUESTA_CATALOGO } from "./catalogoFixture";

describe("catalogoSchema", () => {
  it("parses the backend response into camelCase fields", () => {
    const [servicio] = catalogoSchema.parse(RESPUESTA_CATALOGO).servicios;

    expect(servicio.slug).toBe("domicilio-tributario");
    expect(servicio.planes.map((plan) => plan.slug)).toEqual(["anual", "semestral"]);
    expect(servicio.planes[0].precioConfirmado).toBe(false);
  });

  it("rejects a response that does not match the contract", () => {
    const result = catalogoSchema.safeParse({ servicios: [{ slug: "x" }] });

    expect(result.success).toBe(false);
  });
});
