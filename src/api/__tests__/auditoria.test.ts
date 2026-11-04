import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarAuditoria, obtenerHistorial } from "../auditoria";
import { api } from "../client";

vi.mock("../client", () => ({ api: { get: vi.fn() } }));

describe("audit API", () => {
  beforeEach(() => vi.mocked(api.get).mockReset());

  it("sends each filter under the API's parameter name, and the page as page", () => {
    void listarAuditoria({
      entidad: "clientes.cliente",
      registro_id: "7",
      usuario: "3",
      accion: "modificar",
      origen: "portal",
      desde: "2026-10-01",
      hasta: "2026-10-31",
      pagina: 2,
    });

    expect(api.get).toHaveBeenCalledWith(
      "/auditoria/?entidad=clientes.cliente&registro_id=7&usuario=3&accion=modificar&origen=portal&desde=2026-10-01&hasta=2026-10-31&page=2",
      undefined,
    );
  });

  it("sends no empty parameter, and no page for the first one", () => {
    void listarAuditoria({ entidad: "", accion: "crear", pagina: 1 });
    expect(api.get).toHaveBeenLastCalledWith("/auditoria/?accion=crear", undefined);

    void listarAuditoria({ pagina: 1 });
    expect(api.get).toHaveBeenLastCalledWith("/auditoria/", undefined);
  });

  it("asks for a record's history", () => {
    void obtenerHistorial("tramites.tramite", 7, 1);
    expect(api.get).toHaveBeenLastCalledWith(
      "/auditoria/historial/?entidad=tramites.tramite&registro_id=7",
      undefined,
    );

    void obtenerHistorial("tramites.tramite", 7, 3);
    expect(api.get).toHaveBeenLastCalledWith(
      "/auditoria/historial/?entidad=tramites.tramite&registro_id=7&page=3",
      undefined,
    );
  });
});
