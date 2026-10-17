import { describe, expect, it } from "vitest";

import { ApiError } from "../../../api/client";
import { codigoDeConflicto, erroresDeCampo } from "../errores";
import { etiquetaCliente, etiquetaStaff } from "../estados";

describe("etiquetas de estado", () => {
  it("names each state for the client and for staff", () => {
    expect(etiquetaCliente({ estado: "iniciado", motivo: null }).etiqueta).toBe("Generando documento");
    expect(etiquetaCliente({ estado: "completado", motivo: null }).tono).toBe("completo");
    const pendiente = { estado: "pendiente" as const, motivo: { codigo: "falta_informacion" as const } };
    expect(etiquetaCliente(pendiente).etiqueta).toBe("En revisión");
    expect(etiquetaStaff(pendiente).etiqueta).toBe("Falta información");
  });
});

describe("errores de la API", () => {
  it("flattens nested field errors into dotted paths", () => {
    const error = new ApiError(400, { representante: { rut: ["Mal RUT."] }, plan: ["Sin plan."] }, "x");

    expect(erroresDeCampo(error)).toEqual([
      ["representante.rut", "Mal RUT."],
      ["plan", "Sin plan."],
    ]);
  });

  it("reads the code of a conflict", () => {
    expect(codigoDeConflicto(new ApiError(409, { codigo: "fecha_inicio_vencida" }, "x"))).toBe(
      "fecha_inicio_vencida",
    );
    expect(codigoDeConflicto(new ApiError(400, {}, "x"))).toBeNull();
  });
});
