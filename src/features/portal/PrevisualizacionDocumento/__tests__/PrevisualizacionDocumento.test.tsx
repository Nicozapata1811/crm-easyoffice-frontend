/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../api/client";
import {
  confirmarTramite,
  descargarDocumento,
  listarDocumentos,
  obtenerTramite,
} from "../../../../api/tramites";
import { renderEn } from "../../../backoffice/Clientes/__tests__/renderConSesion";
import { DOCUMENTO, TRAMITE, TRAMITE_A_PAGAR } from "../../../tramites/__tests__/fixtures";
import { PrevisualizacionDocumento } from "../PrevisualizacionDocumento";

vi.mock("../../../../api/tramites", () => ({
  obtenerTramite: vi.fn(),
  listarDocumentos: vi.fn(),
  descargarDocumento: vi.fn(),
  confirmarTramite: vi.fn(),
}));

const crearUrl = URL.createObjectURL;
const revocarUrl = URL.revokeObjectURL;

function renderBorrador() {
  return renderEn("/tramites/7/documento", [
    { path: "/tramites/:tramiteId/documento", element: <PrevisualizacionDocumento /> },
    { path: "/tramites/:tramiteId/pago", element: <p>Pago</p> },
    { path: "/tramites/:tramiteId/editar", element: <p>Editar</p> },
  ]);
}

describe("PrevisualizacionDocumento", () => {
  beforeAll(() => {
    URL.createObjectURL = vi.fn(() => "blob:borrador");
    URL.revokeObjectURL = vi.fn();
  });
  afterAll(() => {
    URL.createObjectURL = crearUrl;
    URL.revokeObjectURL = revocarUrl;
  });
  beforeEach(() => {
    vi.mocked(obtenerTramite).mockResolvedValue(TRAMITE);
    vi.mocked(listarDocumentos).mockResolvedValue([DOCUMENTO]);
    vi.mocked(descargarDocumento).mockResolvedValue({
      blob: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
      nombreArchivo: "LF-0001-2026-v1.pdf",
    });
    vi.mocked(confirmarTramite).mockReset();
  });

  it("waits while the document is generated", async () => {
    vi.mocked(obtenerTramite).mockResolvedValue({ ...TRAMITE, estado: "iniciado", motivo: null });
    renderBorrador();

    expect(await screen.findByText(/Estamos generando el borrador/)).toBeInTheDocument();
    expect(listarDocumentos).not.toHaveBeenCalled();
  });

  it("shows the real generated PDF, its contract and signers", async () => {
    renderBorrador();

    const visor = await screen.findByTitle("Borrador del contrato");
    expect(visor).toHaveAttribute("src", "blob:borrador");
    expect(descargarDocumento).toHaveBeenCalledWith(7, DOCUMENTO.id, "pdf");
    expect(screen.getByText("LF-0001-2026")).toBeInTheDocument();
    expect(screen.getByText(/María José Propietaria Ejemplo/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Constructora Ríos|Declaración de Cambio de Domicilio/);
  });

  it("confirms and goes to payment", async () => {
    vi.mocked(confirmarTramite).mockResolvedValue(TRAMITE_A_PAGAR);
    const user = userEvent.setup();
    const router = renderBorrador();

    await user.click(await screen.findByRole("button", { name: /continuar al pago/ }));

    expect(await screen.findByText("Pago")).toBeInTheDocument();
    expect(confirmarTramite).toHaveBeenCalledWith(7);
    expect(router.state.location.pathname).toBe("/tramites/7/pago");
  });

  it("asks for a new date when the start date passed", async () => {
    vi.mocked(confirmarTramite).mockRejectedValue(
      new ApiError(409, { codigo: "fecha_inicio_vencida", detail: "x" }, "x"),
    );
    const user = userEvent.setup();
    renderBorrador();

    await user.click(await screen.findByRole("button", { name: /continuar al pago/ }));

    expect(await screen.findByText(/La fecha de inicio ya pasó/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Elige una nueva" })).toHaveAttribute("href", "/tramites/7/editar");
  });
});
