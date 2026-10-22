/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../api/client";
import {
  crearTramitePortal,
  editarTramitePortal,
  obtenerFormularioPortal,
  obtenerTramite,
} from "../../../../api/tramites";
import { renderEn } from "../../../backoffice/Clientes/__tests__/renderConSesion";
import { FORMULARIO_PORTAL_BODEGA, TRAMITE, TRAMITE_BODEGA } from "../../../tramites/__tests__/fixtures";
import { EditarSolicitud, NuevaSolicitud } from "../Solicitudes";

vi.mock("../../../../api/tramites", () => ({
  obtenerFormularioPortal: vi.fn(),
  obtenerFormularioDomicilio: vi.fn(),
  obtenerTramite: vi.fn(),
  crearTramitePortal: vi.fn(),
  editarTramitePortal: vi.fn(),
  crearDomicilio: vi.fn(),
  editarDomicilio: vi.fn(),
}));

const TRAMITE_PORTAL = {
  ...TRAMITE,
  id: 9,
  tipo: "Bodega virtual",
  tipo_codigo: "bodega",
  datos: { plan: "semestral", sucursal: 1, bodega: 10, fecha_inicio: "2026-10-20" },
  contrato: TRAMITE_BODEGA.contrato,
};

function renderNueva() {
  return renderEn("/tramites/bodega/nuevo", [
    { path: "/tramites/:tipo/nuevo", element: <NuevaSolicitud /> },
    { path: "/tramites/:tramiteId/documento", element: <p>Borrador</p> },
  ]);
}

async function elegir(user: ReturnType<typeof userEvent.setup>, plan: RegExp) {
  await user.click(await screen.findByRole("radio", { name: /Bodega de Ejemplo Costa/ }));
  await user.click(screen.getByRole("radio", { name: plan }));
  await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));
}

describe("FormularioTramitePortal (bodega)", () => {
  beforeEach(() => {
    vi.mocked(obtenerFormularioPortal).mockResolvedValue(FORMULARIO_PORTAL_BODEGA);
    vi.mocked(crearTramitePortal).mockReset().mockResolvedValue(TRAMITE_PORTAL);
  });

  it("pre-fills the company and offers the three plans with the signature included", async () => {
    renderNueva();

    expect(await screen.findByRole("heading", { name: "Bodega virtual" })).toBeInTheDocument();
    expect(obtenerFormularioPortal).toHaveBeenCalledWith("bodega", expect.anything());
    expect(screen.getByLabelText("Razón social")).toHaveValue("Comercial Ficticia del Sur SpA");
    for (const nombre of ["Plan anual", "Plan semestral", "Plan trimestral"]) {
      expect(screen.getByRole("radio", { name: new RegExp(`${nombre} · \\$59\\.990`) })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/Incluye la firma electrónica avanzada/)).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /La Florida/ })).toBeChecked();
  });

  it("needs a plan and a warehouse before generating anything", async () => {
    const user = userEvent.setup();
    renderNueva();
    await screen.findByLabelText("Razón social");

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("Elige un plan.")).toBeInTheDocument();
    expect(screen.getByText("Elige una bodega.")).toBeInTheDocument();
    expect(crearTramitePortal).not.toHaveBeenCalled();
  });

  it.each([
    ["anual", /Plan anual/],
    ["semestral", /Plan semestral/],
    ["trimestral", /Plan trimestral/],
  ])("files the request with the %s plan and goes to the draft", async (plan, nombre) => {
    const user = userEvent.setup();
    const router = renderNueva();

    await elegir(user, nombre);

    expect(crearTramitePortal).toHaveBeenCalledWith(
      "bodega",
      expect.objectContaining({ plan, sucursal: 1, bodega: 10, fecha_inicio: "2026-10-16" }),
    );
    expect(router.state.location.pathname).toBe("/tramites/9/documento");
  });

  it("shows the backend's answer on its field", async () => {
    vi.mocked(crearTramitePortal).mockRejectedValue(
      new ApiError(400, { bodega: ["This warehouse is not available for that date."] }, "rejected"),
    );
    const user = userEvent.setup();
    renderNueva();

    await elegir(user, /Plan anual/);

    expect(await screen.findByText("This warehouse is not available for that date.")).toBeInTheDocument();
  });

  it("tells a client who cannot buy it why, plainly", async () => {
    vi.mocked(obtenerFormularioPortal).mockResolvedValue({
      ...FORMULARIO_PORTAL_BODEGA,
      disponible: false,
      motivo_no_disponible: "El trámite «Bodega virtual» en línea es para empresas.",
      datos: null,
    });
    renderNueva();

    expect(await screen.findByText(/en línea es para empresas/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Razón social")).not.toBeInTheDocument();
  });

  it("edits a request of its type with its saved choices", async () => {
    vi.mocked(obtenerTramite).mockResolvedValue(TRAMITE_PORTAL);
    vi.mocked(editarTramitePortal).mockResolvedValue(TRAMITE_PORTAL);
    const user = userEvent.setup();
    renderEn("/tramites/9/editar", [
      { path: "/tramites/:tramiteId/editar", element: <EditarSolicitud /> },
      { path: "/tramites/:tramiteId/documento", element: <p>Borrador</p> },
    ]);

    expect(await screen.findByRole("radio", { name: /Plan semestral/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Bodega de Ejemplo Costa/ })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(editarTramitePortal).toHaveBeenCalledWith(9, expect.objectContaining({ plan: "semestral", bodega: 10 }));
  });
});
