/** All data here is synthetic. */

import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { ApiError } from "../../../../api/client";
import { obtenerCliente } from "../../../../api/clientes";
import type { FichaCliente as Ficha } from "../../../../types/cliente";
import { FichaCliente } from "../FichaCliente";
import { EJECUTIVO, renderEn, SOLO_LECTURA } from "./renderConSesion";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/clientes", () => ({ obtenerCliente: vi.fn() }));

const EMPRESA: Ficha = {
  id: 9,
  folio: "CLI-000009",
  tipo: "empresa",
  activo: true,
  created_at: "2026-10-01T10:00:00-03:00",
  updated_at: "2026-10-02T10:00:00-03:00",
  persona: null,
  empresa: {
    rut: "76543210-3",
    razon_social: "Transportes Austral de Ejemplo SpA",
    nombre_fantasia: "Transportes Austral",
    giro: "Transporte de carga",
    email: "contacto@example.test",
    telefono: "",
  },
  representantes: [
    {
      id: 1,
      rut: "12345678-5",
      nombre: "Valentina Fuentes Soto",
      vigente_desde: "2026-01-15",
      vigente_hasta: null,
      activo: true,
    },
  ],
};

function renderFicha(id = 9) {
  return renderEn(`/backoffice/clientes/${id}`, [
    { path: "/backoffice/clientes/:clienteId", element: <FichaCliente /> },
  ]);
}

describe("FichaCliente", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);
    vi.mocked(obtenerCliente).mockResolvedValue(EMPRESA);
  });

  it("shows a company's data and its legal representatives", async () => {
    renderFicha();

    expect(
      await screen.findByRole("heading", { name: "Transportes Austral de Ejemplo SpA" }),
    ).toBeInTheDocument();
    const datos = screen.getByRole("region", { name: "Datos del cliente" });
    expect(within(datos).getByText("76.543.210-3")).toBeInTheDocument();
    expect(within(datos).getByText("Transporte de carga")).toBeInTheDocument();

    const representantes = screen.getByRole("region", { name: "Representantes legales" });
    expect(within(representantes).getByText("Valentina Fuentes Soto")).toBeInTheDocument();
    expect(within(representantes).getByText("Sin término")).toBeInTheDocument();
  });

  it("offers editing only with the permission", async () => {
    renderFicha();
    expect(await screen.findByRole("link", { name: "Editar" })).toBeInTheDocument();
  });

  it("hides editing without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(SOLO_LECTURA);
    renderFicha();

    await screen.findByRole("region", { name: "Datos del cliente" });
    expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
  });

  it("says when the client does not exist", async () => {
    vi.mocked(obtenerCliente).mockRejectedValue(new ApiError(404, {}, "404"));
    renderFicha(404);

    expect(await screen.findByText("No encontramos este cliente.")).toBeInTheDocument();
  });
});
