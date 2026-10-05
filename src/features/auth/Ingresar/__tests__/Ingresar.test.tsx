/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion, login } from "../../../../api/auth";
import { ApiError } from "../../../../api/client";
import { Ingresar } from "../Ingresar";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn(), login: vi.fn() }));

function renderIngresar(path = "/backoffice/ingresar") {
  const router = createMemoryRouter(
    [
      { path: "/backoffice/ingresar", element: <Ingresar /> },
      { path: "/backoffice/*", element: <p>Backoffice</p> },
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

async function ingresar(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText(/Correo electrónico/), email);
  await user.type(screen.getByLabelText(/Contraseña/), password);
  await user.click(screen.getByRole("button", { name: "Ingresar" }));
}

describe("Ingresar", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(null);
    vi.mocked(login).mockReset();
  });

  it("shows one generic message when the credentials are rejected", async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(400, {}, "rejected"));

    renderIngresar();
    await ingresar("persona@example.test", "incorrecta");

    expect(await screen.findByText("Correo o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("goes to the requested page after signing in", async () => {
    vi.mocked(login).mockResolvedValue({
      id: 1,
      email: "persona@example.test",
      name: "Persona Demo",
      rol: "Administrador",
      permisos: [],
    });
    const router = renderIngresar("/backoffice/ingresar?siguiente=%2Fbackoffice%2Ftipos-tramite");

    await ingresar("persona@example.test", "correcta");

    expect(await screen.findByText("Backoffice")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/backoffice/tipos-tramite");
    expect(vi.mocked(login).mock.calls[0]?.[0]).toEqual({
      email: "persona@example.test",
      password: "correcta",
    });
  });

  it("ignores a redirect to another origin", async () => {
    vi.mocked(login).mockResolvedValue({
      id: 1,
      email: "persona@example.test",
      name: "",
      rol: null,
      permisos: [],
    });
    const router = renderIngresar("/backoffice/ingresar?siguiente=%2F%2Fexample.com");

    await ingresar("persona@example.test", "correcta");

    await screen.findByText("Backoffice");
    expect(router.state.location.pathname).toBe("/backoffice");
  });

  it("validates the form before calling the backend", async () => {
    renderIngresar();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Ingresa un correo válido.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});
