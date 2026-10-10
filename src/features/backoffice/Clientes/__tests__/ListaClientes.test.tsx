/** All data here is synthetic. */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { listarClientes } from "../../../../api/clientes";
import type { ClienteResumen } from "../../../../types/cliente";
import { ListaClientes } from "../ListaClientes";
import { EJECUTIVO, renderEn, SOLO_LECTURA } from "./renderConSesion";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/clientes", () => ({
  TAMANO_PAGINA_CLIENTES: 25,
  listarClientes: vi.fn(),
}));

const PERSONA: ClienteResumen = {
  id: 7,
  folio: "CLI-000007",
  tipo: "persona",
  rut: "12345678-5",
  nombre: "Valentina Fuentes Soto",
  email: "valentina@example.test",
  telefono: "+56 9 0000 0007",
  activo: true,
  created_at: "2026-10-01T10:00:00-03:00",
};

function renderLista(path = "/backoffice/clientes") {
  return renderEn(path, [
    { path: "/backoffice/clientes", element: <ListaClientes /> },
    { path: "/backoffice/clientes/:clienteId", element: <p>Ficha abierta</p> },
    { path: "/backoffice/clientes/nuevo", element: <p>Formulario nuevo</p> },
  ]);
}

describe("ListaClientes", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);
    vi.mocked(listarClientes).mockReset();
    vi.mocked(listarClientes).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [PERSONA],
    });
  });

  it("lists clients with a formatted RUT", async () => {
    renderLista();

    const tabla = await screen.findByRole("table", { name: "Clientes" });
    expect(within(tabla).getByText("12.345.678-5")).toBeInTheDocument();
    expect(within(tabla).getByText("CLI-000007")).toBeInTheDocument();
    expect(within(tabla).getByText("Activo")).toBeInTheDocument();
  });

  it("searches as the user types and keeps the search in the URL", async () => {
    const router = renderLista();
    const user = userEvent.setup();

    await user.type(await screen.findByRole("searchbox", { name: "Buscar" }), "12.345.678");

    await vi.waitFor(() =>
      expect(listarClientes).toHaveBeenLastCalledWith(
        { buscar: "12.345.678", tipo: undefined, pagina: 1 },
        expect.any(AbortSignal),
      ),
    );
    expect(router.state.location.search).toBe("?buscar=12.345.678");
  });

  it("restores the filters from the URL", async () => {
    renderLista("/backoffice/clientes?buscar=fuentes&tipo=empresa&pagina=2");

    await screen.findByRole("table", { name: "Clientes" });
    expect(listarClientes).toHaveBeenCalledWith(
      { buscar: "fuentes", tipo: "empresa", pagina: 2 },
      expect.any(AbortSignal),
    );
    expect(screen.getByRole("searchbox", { name: "Buscar" })).toHaveValue("fuentes");
  });

  it("opens the record from a row", async () => {
    renderLista();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("link", { name: PERSONA.nombre }));

    expect(await screen.findByText("Ficha abierta")).toBeInTheDocument();
  });

  it("offers a new client only to users who may create one", async () => {
    renderLista();
    expect(await screen.findByRole("link", { name: "Nuevo cliente" })).toBeInTheDocument();
  });

  it("hides the new client button without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(SOLO_LECTURA);
    renderLista();

    await screen.findByRole("table", { name: "Clientes" });
    expect(screen.queryByRole("link", { name: "Nuevo cliente" })).not.toBeInTheDocument();
  });

  it("says so when the search finds nothing", async () => {
    vi.mocked(listarClientes).mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    renderLista("/backoffice/clientes?buscar=nadie");

    expect(
      await screen.findByText("No encontramos clientes con esos criterios."),
    ).toBeInTheDocument();
  });
});
