/** All data here is synthetic. */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { obtenerHistorial } from "../../../../api/auditoria";
import { ApiError } from "../../../../api/client";
import { renderEn } from "../../Clientes/__tests__/renderConSesion";
import { HistorialRegistro } from "../HistorialRegistro";
import { ADMINISTRADOR, EJECUTIVO, MODIFICACION, pagina } from "./fixtures";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/auditoria", async (original) => ({
  ...(await original<typeof import("../../../../api/auditoria")>()),
  obtenerHistorial: vi.fn(),
}));

function renderHistorial() {
  return renderEn("/backoffice/clientes/9", [
    {
      path: "/backoffice/clientes/:clienteId",
      element: (
        <>
          <p>Ficha</p>
          <HistorialRegistro entidad="clientes.cliente" registroId={9} bajada="Incluye su empresa." />
        </>
      ),
    },
    { path: "/backoffice/auditoria", element: <p>Pantalla de auditoría</p> },
  ]);
}

describe("HistorialRegistro", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);
    vi.mocked(obtenerHistorial).mockReset();
    vi.mocked(obtenerHistorial).mockResolvedValue(pagina([MODIFICACION]));
  });

  it("shows the record's history with the permission", async () => {
    renderHistorial();

    const seccion = await screen.findByRole("region", { name: "Registro de auditoría" });
    expect(await within(seccion).findByText("Administración Demo")).toBeInTheDocument();
    expect(within(seccion).getByText("Incluye su empresa.")).toBeInTheDocument();
    expect(obtenerHistorial).toHaveBeenCalledWith("clientes.cliente", 9, 1, expect.anything());
  });

  it("shows nothing and asks nothing without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);

    renderHistorial();

    await waitFor(() => expect(getSesion).toHaveBeenCalled());
    await screen.findByText("Ficha");
    expect(screen.queryByRole("region", { name: "Registro de auditoría" })).not.toBeInTheDocument();
    expect(obtenerHistorial).not.toHaveBeenCalled();
  });

  it("shows the no-permission view on a 403", async () => {
    vi.mocked(obtenerHistorial).mockRejectedValue(new ApiError(403, {}, "refused"));

    renderHistorial();

    expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
    expect(obtenerHistorial).toHaveBeenCalledTimes(1);
  });

  it("asks the API for the next page", async () => {
    vi.mocked(obtenerHistorial).mockResolvedValue(pagina([MODIFICACION], 30));
    const user = userEvent.setup();
    renderHistorial();

    await user.click(await screen.findByRole("button", { name: /next page|página siguiente/i }));

    await waitFor(() =>
      expect(obtenerHistorial).toHaveBeenLastCalledWith("clientes.cliente", 9, 2, expect.anything()),
    );
  });

  it("opens the detail and leads to the log for that record", async () => {
    const user = userEvent.setup();
    const memoria = renderHistorial();

    await user.click(await screen.findByRole("button", { name: "Ver detalle" }));
    await user.click(await screen.findByRole("link", { name: "Ver solo este registro" }));

    expect(await screen.findByText("Pantalla de auditoría")).toBeInTheDocument();
    expect(memoria.state.location.search).toBe("?entidad=clientes.empresa&registro_id=7");
  });
});
