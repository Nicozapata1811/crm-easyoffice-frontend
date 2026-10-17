/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cambiarFechaInicio,
  listarDocumentos,
  listarTramites,
  obtenerFormularioDomicilio,
  obtenerTramite,
} from "../../../../api/tramites";
import { renderEn } from "../../../backoffice/Clientes/__tests__/renderConSesion";
import { DOCUMENTO, FORMULARIO, TRAMITE } from "../../../tramites/__tests__/fixtures";
import { MisTramites } from "../../MisTramites/MisTramites";
import { EstadoTramite } from "../EstadoTramite";

vi.mock("../../../../api/tramites", () => ({
  obtenerTramite: vi.fn(),
  listarDocumentos: vi.fn(),
  listarTramites: vi.fn(),
  obtenerFormularioDomicilio: vi.fn(),
  cambiarFechaInicio: vi.fn(),
  descargarDocumento: vi.fn(),
}));

const COMPLETADO = {
  ...TRAMITE,
  estado: "completado" as const,
  motivo: null,
  accion_cliente: null,
  editable: false,
};

function renderEstado() {
  return renderEn("/tramites/7", [{ path: "/tramites/:tramiteId", element: <EstadoTramite /> }]);
}

describe("EstadoTramite", () => {
  beforeEach(() => {
    vi.mocked(obtenerTramite).mockResolvedValue(TRAMITE);
    vi.mocked(listarDocumentos).mockResolvedValue([DOCUMENTO]);
    vi.mocked(obtenerFormularioDomicilio).mockResolvedValue(FORMULARIO);
  });

  it("shows the real state, its reason and the history", async () => {
    renderEstado();

    expect(await screen.findByText("Revisa el borrador")).toBeInTheDocument();
    expect(screen.getByText(/confírmalo para continuar/)).toBeInTheDocument();
    expect(screen.getByText("Borrador listo para revisar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Revisar el borrador" })).toHaveAttribute("href", "/tramites/7/documento");
    expect(await screen.findByText(/Camila Andrea Ejemplo Prueba/)).toBeInTheDocument();
  });

  it("offers the signed contract once completed", async () => {
    vi.mocked(obtenerTramite).mockResolvedValue(COMPLETADO);
    vi.mocked(listarDocumentos).mockResolvedValue([
      { ...DOCUMENTO, estado: "firmado", tiene_firmado: true },
    ]);
    renderEstado();

    expect(await screen.findByRole("button", { name: "Descargar contrato firmado" })).toBeInTheDocument();
  });

  it("asks for a new start date when the chosen one passed", async () => {
    vi.mocked(obtenerTramite).mockResolvedValue({
      ...TRAMITE,
      motivo: { codigo: "falta_informacion", nombre: "Falta información", texto_cliente: "Elige una nueva fecha." },
      accion_cliente: "nueva_fecha",
    });
    vi.mocked(cambiarFechaInicio).mockResolvedValue(TRAMITE);
    const user = userEvent.setup();
    renderEstado();

    const fecha = await screen.findByLabelText("Nueva fecha de inicio");
    await user.type(fecha, "2026-10-25");
    await user.click(screen.getByRole("button", { name: "Guardar fecha" }));

    expect(cambiarFechaInicio).toHaveBeenCalledWith(7, "2026-10-25");
  });
});

describe("MisTramites", () => {
  it("lists the client's cases from the API", async () => {
    vi.mocked(listarTramites).mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [TRAMITE, { ...COMPLETADO, id: 8, folio: "TRA-000008" }],
    });
    const user = userEvent.setup();
    renderEn("/mis-tramites", [{ path: "/mis-tramites", element: <MisTramites /> }]);

    expect(await screen.findByText("TRA-000007")).toBeInTheDocument();
    expect(screen.getByText("TRA-000008")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Completados" }));
    expect(screen.queryByText("TRA-000007")).not.toBeInTheDocument();
  });
});
