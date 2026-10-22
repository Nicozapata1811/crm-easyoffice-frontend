/** All data here is synthetic. */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../api/client";
import { listarClientes } from "../../../../api/clientes";
import {
  crearTramiteBackoffice,
  editarTramiteBackoffice,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
} from "../../../../api/tramites";
import { FORMULARIO_BODEGA, TRAMITE_BODEGA } from "../../../tramites/__tests__/fixtures";
import { renderEn } from "../../Clientes/__tests__/renderConSesion";
import { NuevoTramite } from "../NuevoTramite";

vi.mock("../../../../api/clientes", () => ({ listarClientes: vi.fn() }));
vi.mock("../../../../api/tramites", () => ({
  obtenerFormularioTramite: vi.fn(),
  obtenerTramiteBackoffice: vi.fn(),
  crearTramiteBackoffice: vi.fn(),
  editarTramiteBackoffice: vi.fn(),
}));

const EMPRESA = {
  id: 41,
  folio: "CLI-000041",
  tipo: "empresa" as const,
  rut: "76543210-3",
  nombre: "Comercial Ficticia del Sur SpA",
  email: "contacto@empresa-ficticia.example",
  telefono: "",
  activo: true,
  created_at: "2026-10-01T10:00:00-03:00",
};

function renderNuevo() {
  return renderEn("/backoffice/tramites/nuevo/bodega", [
    { path: "/backoffice/tramites/nuevo/:tipo", element: <NuevoTramite /> },
    { path: "/backoffice/tramites/:tramiteId/editar", element: <NuevoTramite /> },
    { path: "/backoffice/tramites/:tramiteId", element: <p>Detalle</p> },
  ]);
}

async function elegirEmpresa(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /Comercial Ficticia del Sur SpA/ }));
  return screen.findByLabelText("Razón social");
}

describe("NuevoTramite", () => {
  beforeEach(() => {
    vi.mocked(listarClientes).mockResolvedValue({ count: 1, next: null, previous: null, results: [EMPRESA] });
    vi.mocked(obtenerFormularioTramite).mockResolvedValue(FORMULARIO_BODEGA);
    vi.mocked(crearTramiteBackoffice).mockReset();
  });

  it("searches only companies, then pre-fills the form from the client's records", async () => {
    const user = userEvent.setup();
    renderNuevo();

    expect(await elegirEmpresa(user)).toHaveValue("Comercial Ficticia del Sur SpA");
    expect(listarClientes).toHaveBeenCalledWith(expect.objectContaining({ tipo: "empresa" }), expect.anything());
    expect(obtenerFormularioTramite).toHaveBeenCalledWith("bodega", 41, expect.anything());
    expect(screen.getByLabelText("RUT del representante")).toHaveValue("12345678-5");
    expect(screen.getByRole("radio", { name: /La Florida/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Bodega de Ejemplo Costa/ })).not.toBeChecked();
    expect(screen.getByText(/Precio de lista \$59\.990 \(referencial\)/)).toBeInTheDocument();
  });

  it("needs a warehouse and the agreed price before generating anything", async () => {
    const user = userEvent.setup();
    renderNuevo();
    await elegirEmpresa(user);

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("Elige una bodega.")).toBeInTheDocument();
    expect(screen.getByText("Indica el precio acordado, en pesos y sin puntos.")).toBeInTheDocument();
    expect(crearTramiteBackoffice).not.toHaveBeenCalled();
  });

  it("sends the request with one property per role and each line's choices", async () => {
    vi.mocked(crearTramiteBackoffice).mockResolvedValue(TRAMITE_BODEGA);
    const user = userEvent.setup();
    const router = renderNuevo();
    await elegirEmpresa(user);

    await user.click(screen.getByRole("radio", { name: /Bodega de Ejemplo Costa/ }));
    await user.click(screen.getAllByLabelText("Ciclo de pago")[1]);
    await user.click(within(await screen.findByRole("listbox")).getByText("Mensual"));
    await user.type(screen.getByLabelText("Precio acordado"), "20000");
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(crearTramiteBackoffice).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "bodega",
        cliente: 41,
        sucursal: 1,
        bodega: 10,
        duracion_meses: 12,
        fecha_inicio: "2026-10-16",
        lineas: [
          { servicio: "domicilio-tributario", ciclo_pago: "anual", precio: null },
          { servicio: "bodega", ciclo_pago: "mensual", precio: "20000" },
        ],
      }),
    );
    expect(router.state.location.pathname).toBe("/backoffice/tramites/8");
  });

  it("shows the backend's answer on its field", async () => {
    vi.mocked(crearTramiteBackoffice).mockRejectedValue(
      new ApiError(400, { bodega: ["This warehouse is not available for that date."] }, "Bad Request"),
    );
    const user = userEvent.setup();
    renderNuevo();
    await elegirEmpresa(user);
    await user.click(screen.getByRole("radio", { name: /Bodega de Ejemplo Costa/ }));
    await user.click(screen.getAllByLabelText("Ciclo de pago")[1]);
    await user.click(within(await screen.findByRole("listbox")).getByText("Mensual"));
    await user.type(screen.getByLabelText("Precio acordado"), "20000");

    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("This warehouse is not available for that date.")).toBeInTheDocument();
  });

  it("tells staff what is missing when the case cannot start", async () => {
    vi.mocked(obtenerFormularioTramite).mockResolvedValue({
      ...FORMULARIO_BODEGA,
      disponible: false,
      problemas: ["Ningún inmueble para «bodega» tiene completos los datos del contrato."],
    });
    const user = userEvent.setup();
    renderNuevo();

    await user.click(await screen.findByRole("button", { name: /Comercial Ficticia del Sur SpA/ }));

    expect(await screen.findByText(/Ningún inmueble para «bodega»/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Razón social")).not.toBeInTheDocument();
  });

  it("edits a request with its saved choices", async () => {
    vi.mocked(obtenerTramiteBackoffice).mockResolvedValue(TRAMITE_BODEGA);
    vi.mocked(editarTramiteBackoffice).mockResolvedValue(TRAMITE_BODEGA);
    const user = userEvent.setup();
    renderEn("/backoffice/tramites/8/editar", [
      { path: "/backoffice/tramites/:tramiteId/editar", element: <NuevoTramite /> },
      { path: "/backoffice/tramites/:tramiteId", element: <p>Detalle</p> },
    ]);

    expect(await screen.findByRole("radio", { name: /Bodega de Ejemplo Costa/ })).toBeChecked();
    expect(screen.getByLabelText("Precio acordado")).toHaveValue("20000");
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(editarTramiteBackoffice).toHaveBeenCalledWith(
      8,
      expect.objectContaining({ bodega: 10, duracion_meses: 6 }),
    );
  });
});
