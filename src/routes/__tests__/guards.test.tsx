/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../api/auth";
import type { UsuarioSesion } from "../../types/sesion";
import { RequireAuth, RequireCliente, RUTA_INGRESO, RUTA_INGRESO_CLIENTE } from "../RequireAuth";
import { RequirePermission } from "../RequirePermission";

vi.mock("../../api/auth", () => ({ getSesion: vi.fn() }));

const ADMINISTRADOR: UsuarioSesion = {
  id: 1,
  email: "admin@example.test",
  name: "Administración Demo",
  tipo: "staff",
  cliente: null,
  rol: "Administrador",
  permisos: ["core.view_dashboard"],
};
const EJECUTIVO: UsuarioSesion = { ...ADMINISTRADOR, id: 2, rol: "Ejecutivo", permisos: [] };
const CLIENTE: UsuarioSesion = {
  id: 3,
  email: "cliente@example.test",
  name: "Camila Soto",
  tipo: "cliente",
  cliente: { id: 7, folio: "CLI-000007", nombre: "Camila Soto" },
  rol: null,
  permisos: [],
};

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: RUTA_INGRESO, element: <p>Pantalla de ingreso</p> },
      { path: RUTA_INGRESO_CLIENTE, element: <p>Ingreso de clientes</p> },
      {
        path: "/tramites/x/pago",
        element: (
          <RequireCliente>
            <p>Pago</p>
          </RequireCliente>
        ),
      },
      {
        path: "/backoffice",
        element: (
          <RequireAuth>
            <RequirePermission permiso="core.view_dashboard">
              <p>Contenido protegido</p>
            </RequirePermission>
          </RequireAuth>
        ),
      },
    ],
    { initialEntries: [path] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("route guards", () => {
  beforeEach(() => vi.mocked(getSesion).mockReset());

  it("sends a visitor without a session to the login screen", async () => {
    vi.mocked(getSesion).mockResolvedValue(null);

    const router = renderAt("/backoffice");

    expect(await screen.findByText("Pantalla de ingreso")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?siguiente=%2Fbackoffice");
  });

  it("blocks a user without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);

    renderAt("/backoffice");

    expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("lets a user with the permission through", async () => {
    vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);

    renderAt("/backoffice");

    expect(await screen.findByText("Contenido protegido")).toBeInTheDocument();
  });

  it("sends a visitor to the client login before paying", async () => {
    vi.mocked(getSesion).mockResolvedValue(null);

    const router = renderAt("/tramites/x/pago");

    expect(await screen.findByText("Ingreso de clientes")).toBeInTheDocument();
    expect(router.state.location.search).toBe("?siguiente=%2Ftramites%2Fx%2Fpago");
  });

  it("lets a client pay", async () => {
    vi.mocked(getSesion).mockResolvedValue(CLIENTE);

    renderAt("/tramites/x/pago");

    expect(await screen.findByText("Pago")).toBeInTheDocument();
  });

  it("keeps staff out of the client portal and clients out of the backoffice", async () => {
    vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);
    renderAt("/tramites/x/pago");
    expect(await screen.findByText(/Esta sección es para clientes/)).toBeInTheDocument();

    vi.mocked(getSesion).mockResolvedValue(CLIENTE);
    renderAt("/backoffice");
    expect(await screen.findByText(/para el personal de Easy Office/)).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
});
