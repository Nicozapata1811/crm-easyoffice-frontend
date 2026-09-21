/** All data here is synthetic. */

import { describe, expect, it } from "vitest";

import { domicilioSchema } from "../schema";

const VALIDO = {
  rutEmpresa: "76245891-8",
  razonSocial: "Constructora Demo Ltda.",
  representanteLegal: "Nombre Apellido",
  direccion: "Av. Ejemplo 100, oficina 1",
  comuna: "San Bernardo",
  rolDeAvaluo: "4021-15",
};

describe("domicilioSchema", () => {
  it("accepts a complete, consistent form", () => {
    expect(domicilioSchema.safeParse(VALIDO).success).toBe(true);
  });

  it.each([
    ["rutEmpresa", "76245891-3"],
    ["rolDeAvaluo", "4021-15a"],
    ["direccion", ""],
    ["razonSocial", ""],
  ])("blocks submission when %s is wrong", (campo, valor) => {
    const result = domicilioSchema.safeParse({ ...VALIDO, [campo]: valor });
    expect(result.success).toBe(false);
  });

  it("reports the rol de avalúo format in the message", () => {
    const result = domicilioSchema.safeParse({ ...VALIDO, rolDeAvaluo: "4021-15a" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("0000-00");
    }
  });
});
