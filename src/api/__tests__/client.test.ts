import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, descargar } from "../client";

function responder(response: Response) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("descargar", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns the file and the name the server gives it", async () => {
    responder(
      new Response("contenido", {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="panel-operativo_2026-09-01_2026-09-30.xlsx"',
        },
      }),
    );

    const { blob, nombreArchivo } = await descargar("/panel/indicadores/exportar/");

    expect(nombreArchivo).toBe("panel-operativo_2026-09-01_2026-09-30.xlsx");
    expect(await blob.text()).toBe("contenido");
    expect(fetch).toHaveBeenCalledWith(
      "/api/panel/indicadores/exportar/",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("raises an ApiError when the server refuses", async () => {
    responder(
      new Response(JSON.stringify({ detail: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(descargar("/panel/indicadores/exportar/")).rejects.toBeInstanceOf(ApiError);
  });
});
