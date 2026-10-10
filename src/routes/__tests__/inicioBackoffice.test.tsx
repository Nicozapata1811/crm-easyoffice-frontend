/** All data here is synthetic. */

import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../api/auth";
import { dashboardService } from "../../features/backoffice/PanelOperativo/dashboardService";
import { BackofficeLayout } from "../../layouts/BackofficeLayout";
import type { UsuarioSesion } from "../../types/sesion";
import { InicioBackoffice } from "../InicioBackoffice";

vi.mock("../../api/auth", () => ({ getSesion: vi.fn(), logout: vi.fn() }));

const ADMINISTRADOR: UsuarioSesion = {
  id: 1,
  email: "admin@example.test",
  name: "Administración Demo",
  tipo: "staff",
  cliente: null,
  rol: "Administrador",
  permisos: ["clientes.view_cliente", "core.view_dashboard"],
};
const EJECUTIVO: UsuarioSesion = {
  ...ADMINISTRADOR,
  id: 2,
  rol: "Ejecutivo",
  permisos: ["clientes.view_cliente"],
};

function renderBackoffice() {
  const router = createMemoryRouter(
    [
      {
        path: "/backoffice",
        element: <BackofficeLayout />,
        children: [
          { index: true, element: <InicioBackoffice /> },
          { path: "clientes", element: <p>Listado de clientes</p> },
        ],
      },
    ],
    { initialEntries: ["/backoffice"] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("backoffice home", () => {
  beforeEach(() => {
    vi.spyOn(dashboardService, "getIndicators").mockReturnValue(new Promise(() => {}));
  });

  it("sends staff without the dashboard to the client list", async () => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);

    const router = renderBackoffice();

    expect(await screen.findByText("Listado de clientes")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/backoffice/clientes");
    const nav = screen.getByRole("navigation");
    expect(within(nav).queryByRole("link", { name: "Panel" })).not.toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Clientes" })).toBeInTheDocument();
  });

  it("shows the dashboard to staff who may see it", async () => {
    vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);

    renderBackoffice();

    expect(await screen.findByRole("heading", { name: "Panel operativo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Panel" })).toBeInTheDocument();
  });
});
