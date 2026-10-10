/** All data here is synthetic. */

import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router-dom";

import type { UsuarioSesion } from "../../../../types/sesion";

export const EJECUTIVO: UsuarioSesion = {
  id: 2,
  email: "ejecutivo@example.test",
  name: "Ejecutivo Demo",
  rol: "Ejecutivo",
  permisos: ["clientes.add_cliente", "clientes.change_cliente", "clientes.view_cliente"],
};

export const SOLO_LECTURA: UsuarioSesion = {
  ...EJECUTIVO,
  id: 3,
  rol: "Consulta",
  permisos: ["clientes.view_cliente"],
};

export function renderEn(path: string, routes: RouteObject[]) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}
