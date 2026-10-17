/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../api/client";
import { crearDomicilio, obtenerFormularioDomicilio } from "../../../../api/tramites";
import { renderEn } from "../../../backoffice/Clientes/__tests__/renderConSesion";
import { FORMULARIO, FORMULARIO_VACIO, TRAMITE } from "../../../tramites/__tests__/fixtures";
import { FormularioDomicilio } from "../FormularioDomicilio";

vi.mock("../../../../api/tramites", () => ({
  obtenerFormularioDomicilio: vi.fn(),
  obtenerTramite: vi.fn(),
  crearDomicilio: vi.fn(),
  editarDomicilio: vi.fn(),
}));

function renderFormulario() {
  return renderEn("/tramites/domicilio-tributario/nuevo", [
    { path: "/tramites/domicilio-tributario/nuevo", element: <FormularioDomicilio /> },
    { path: "/tramites/:tramiteId/documento", element: <p>Borrador</p> },
  ]);
}

describe("FormularioDomicilio", () => {
  beforeEach(() => {
    vi.mocked(obtenerFormularioDomicilio).mockResolvedValue(FORMULARIO);
    vi.mocked(crearDomicilio).mockReset();
  });

  it("pre-fills from the client's own records", async () => {
    renderFormulario();

    expect(await screen.findByLabelText("Razón social")).toHaveValue("Comercial Ficticia del Sur SpA");
    expect(screen.getByLabelText("RUT de la empresa")).toHaveValue("76543210-3");
    expect(screen.getByLabelText("RUT del representante")).toHaveValue("12345678-5");
    expect(screen.getByLabelText("Domicilio particular")).toHaveValue("Pasaje de Prueba 123");
    expect(screen.getByLabelText("Celular")).toHaveValue("912345678");
  });

  it("leaves blank what the records do not hold", async () => {
    vi.mocked(obtenerFormularioDomicilio).mockResolvedValue(FORMULARIO_VACIO);
    renderFormulario();

    expect(await screen.findByLabelText("Nombres")).toHaveValue("");
    expect(screen.getByLabelText("RUT del representante")).toHaveValue("");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("");
  });

  it("never asks for the domicile's address, comuna or rol: the branch gives them", async () => {
    renderFormulario();
    await screen.findByLabelText("Razón social");

    expect(screen.queryByLabelText(/Rol de avalúo/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Dirección/)).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /La Florida/ })).toBeInTheDocument();
    expect(screen.getByText(/Avenida de Ejemplo 1000/)).toBeInTheDocument();
  });

  it("shows no demo data", async () => {
    renderFormulario();
    await screen.findByLabelText("Razón social");

    expect(document.body.textContent).not.toMatch(/Constructora Ríos|Marcela Ríos|76\.245\.891-8/);
  });

  it("blocks an invalid RUT before sending", async () => {
    const user = userEvent.setup();
    renderFormulario();
    const rut = await screen.findByLabelText("RUT del representante");

    await user.clear(rut);
    await user.type(rut, "12345678-0");
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText(/dígito verificador no calza/)).toBeInTheDocument();
    expect(crearDomicilio).not.toHaveBeenCalled();
  });

  it("sends the request with the chosen branch and plan", async () => {
    vi.mocked(crearDomicilio).mockResolvedValue(TRAMITE);
    const user = userEvent.setup();
    const router = renderFormulario();

    await user.click(await screen.findByRole("radio", { name: /La Florida/ }));
    await user.click(screen.getByRole("radio", { name: /Plan semestral/ }));
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    await screen.findByText("Borrador");
    expect(crearDomicilio).toHaveBeenCalledWith({
      empresa: { rut: "76543210-3", razon_social: "Comercial Ficticia del Sur SpA", giro: "Venta de ejemplo" },
      representante: FORMULARIO.datos!.representante,
      personeria: { fecha_instrumento: "2025-12-10", sitio_o_notaria: "www.tuempresaenundia.cl" },
      email_aviso: "contacto@empresa-ficticia.example",
      movil_aviso: "912345678",
      plan: "semestral",
      sucursal: 1,
      fecha_inicio: "2026-10-16",
    });
    expect(router.state.location.pathname).toBe("/tramites/7/documento");
  });

  it("marks the fields the backend rejects", async () => {
    vi.mocked(crearDomicilio).mockRejectedValue(
      new ApiError(400, { representante: { rut: ["No podemos usar este RUT."] } }, "x"),
    );
    const user = userEvent.setup();
    renderFormulario();

    await user.click(await screen.findByRole("radio", { name: /La Florida/ }));
    await user.click(screen.getByRole("radio", { name: /Plan anual/ }));
    await user.click(screen.getByRole("button", { name: "Generar el borrador del contrato" }));

    expect(await screen.findByText("No podemos usar este RUT.")).toBeInTheDocument();
  });

  it("explains when the online request is not available", async () => {
    vi.mocked(obtenerFormularioDomicilio).mockResolvedValue({
      ...FORMULARIO,
      disponible: false,
      motivo_no_disponible: "El domicilio tributario en línea es para empresas.",
      datos: null,
    });
    renderFormulario();

    expect(await screen.findByText(/es para empresas/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Generar/ })).not.toBeInTheDocument();
  });
});
