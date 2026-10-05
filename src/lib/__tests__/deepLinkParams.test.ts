import { describe, expect, it } from "vitest";

import { catalogoSchema } from "../../api/catalogo";
import { RESPUESTA_CATALOGO } from "../../api/__tests__/catalogoFixture";
import { parseDeepLinkParams } from "../deepLinkParams";

const PLANES = catalogoSchema.parse(RESPUESTA_CATALOGO).servicios[0].planes;

function parse(query: string) {
  return parseDeepLinkParams(new URLSearchParams(query), PLANES);
}

describe("parseDeepLinkParams: plan", () => {
  it("resolves a known plan to the catalogue entry", () => {
    const { plan } = parse("plan=anual");

    expect(plan.kind).toBe("valid");
    if (plan.kind === "valid") {
      expect(plan.value.slug).toBe("anual");
      expect(plan.value.meses).toBe(12);
    }
  });

  it("matches case-insensitively and ignores surrounding spaces", () => {
    expect(parse("plan=%20Semestral%20").plan.kind).toBe("valid");
  });

  it("reports a plan missing from the catalogue as invalid", () => {
    expect(parse("plan=trimestral").plan).toEqual({ kind: "invalid", raw: "trimestral" });
  });

  it.each(["", "plan=", "plan=%20%20", "origen=sitio"])(
    "reports %j as absent",
    (query) => {
      expect(parse(query).plan).toEqual({ kind: "absent" });
    },
  );

  it("treats every plan as invalid while the catalogue is not loaded", () => {
    const { plan } = parseDeepLinkParams(new URLSearchParams("plan=anual"), []);

    expect(plan).toEqual({ kind: "invalid", raw: "anual" });
  });
});

describe("parseDeepLinkParams: origen", () => {
  it.each(["sitio", "sitio-popup", "boton_home_2"])("accepts %s", (origen) => {
    expect(parse(`origen=${origen}`).origen).toEqual({ kind: "valid", value: origen });
  });

  it("normalises case", () => {
    expect(parse("origen=Sitio").origen).toEqual({ kind: "valid", value: "sitio" });
  });

  it.each(["<script>", "con espacio", "a".repeat(51)])("rejects %s", (origen) => {
    expect(parse(`origen=${encodeURIComponent(origen)}`).origen.kind).toBe("invalid");
  });

  it("reports a missing origen as absent", () => {
    expect(parse("plan=anual").origen).toEqual({ kind: "absent" });
  });
});
