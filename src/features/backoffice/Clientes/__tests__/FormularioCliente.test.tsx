/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { ApiError } from "../../../../api/client";
import { actualizarCliente, crearCliente, obtenerCliente } from "../../../../api/clientes";
import type { FichaCliente } from "../../../../types/cliente";
import { FormularioCliente } from "../FormularioCliente";
import { EJECUTIVO, renderEn } from "./renderConSesion";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/clientes", () => ({
  crearCliente: vi.fn(),
  actualizarCliente: vi.fn(),
  obtenerCliente: vi.fn(),
}));

const FICHA: FichaCliente = {
  id: 7,
  folio: "CLI-000007",
  tipo: "persona",
  activo: true,
  created_at: "2026-10-01T10:00:00-03:00",
  updated_at: "2026-10-01T10:00:00-03:00",
  persona: {
    rut: "12345678-5",
    nombres: "Valentina",
    apellido_paterno: "Fuentes",
    apellido_materno: "",
    email: "valentina@example.test",
    telefono: "",
  },
  empresa: null,
  representantes: [],
};

function renderFormulario(path: string) {
  return renderEn(path, [
    { path: "/backoffice/clientes/nuevo", element: <FormularioCliente /> },
    { path: "/backoffice/clientes/:clienteId/editar", element: <FormularioCliente /> },
    { path: "/backoffice/clientes/:clienteId", element: <p>Ficha guardada</p> },
  ]);
}

describe("FormularioCliente", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);
    vi.mocked(crearCliente).mockReset();
    vi.mocked(actualizarCliente).mockReset();
  });

  it("registers a person with a normalised RUT", async () => {
    vi.mocked(crearCliente).mockResolvedValue(FICHA);
    const router = renderFormulario("/backoffice/clientes/nuevo");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("RUT"), "11.111.112-k");
    await user.type(screen.getByLabelText("Nombres"), "Camila");
    await user.type(screen.getByLabelText("Apellido paterno"), "Rojas");
    await user.click(screen.getByRole("button", { name: "Registrar cliente" }));

    expect(await screen.findByText("Ficha guardada")).toBeInTheDocument();
    expect(crearCliente).toHaveBeenCalledWith({
      tipo: "persona",
      persona: {
        rut: "11111112-K",
        nombres: "Camila",
        apellido_paterno: "Rojas",
        apellido_materno: "",
        email: "",
        telefono: "",
      },
    });
    expect(router.state.location.pathname).toBe("/backoffice/clientes/7");
  });

  it("registers a company", async () => {
    vi.mocked(crearCliente).mockResolvedValue({ ...FICHA, tipo: "empresa" });
    renderFormulario("/backoffice/clientes/nuevo");
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Empresa" }));
    await user.type(screen.getByLabelText("RUT"), "76543210-3");
    await user.type(screen.getByLabelText("Razón social"), "Empresa de Ejemplo SpA");
    await user.click(screen.getByRole("button", { name: "Registrar cliente" }));

    await screen.findByText("Ficha guardada");
    expect(crearCliente).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "empresa",
        empresa: expect.objectContaining({ rut: "76543210-3", razon_social: "Empresa de Ejemplo SpA" }),
      }),
    );
  });

  it("checks the RUT before calling the API", async () => {
    renderFormulario("/backoffice/clientes/nuevo");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("RUT"), "11111112-1");
    await user.click(screen.getByRole("button", { name: "Registrar cliente" }));

    expect(
      await screen.findByText("Revisa el RUT: el dígito verificador no calza."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresa los nombres.")).toBeInTheDocument();
    expect(crearCliente).not.toHaveBeenCalled();
  });

  it("shows a duplicate RUT reported by the backend on the RUT field", async () => {
    vi.mocked(crearCliente).mockRejectedValue(
      new ApiError(400, { persona: { rut: ["A client with this RUT already exists."] } }, "400"),
    );
    renderFormulario("/backoffice/clientes/nuevo");
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("RUT"), "12345678-5");
    await user.type(screen.getByLabelText("Nombres"), "Camila");
    await user.type(screen.getByLabelText("Apellido paterno"), "Rojas");
    await user.click(screen.getByRole("button", { name: "Registrar cliente" }));

    expect(await screen.findByText("Ya existe un cliente con este RUT.")).toBeInTheDocument();
    expect(screen.getByLabelText("RUT")).toHaveAttribute("aria-invalid", "true");
  });

  it("edits a client starting from its current data", async () => {
    vi.mocked(obtenerCliente).mockResolvedValue(FICHA);
    vi.mocked(actualizarCliente).mockResolvedValue(FICHA);
    renderFormulario("/backoffice/clientes/7/editar");
    const user = userEvent.setup();

    const telefono = await screen.findByLabelText("Teléfono (opcional)");
    expect(screen.getByLabelText("Nombres")).toHaveValue("Valentina");
    expect(screen.queryByRole("button", { name: "Empresa" })).not.toBeInTheDocument();

    await user.type(telefono, "+56 9 0000 0009");
    await user.click(screen.getByRole("switch", { name: "Cliente activo" }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await screen.findByText("Ficha guardada");
    expect(actualizarCliente).toHaveBeenCalledWith(7, {
      activo: false,
      persona: expect.objectContaining({ rut: "12345678-5", telefono: "+56 9 0000 0009" }),
    });
  });
});
