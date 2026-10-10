/** All data here is synthetic. */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { ApiError } from "../../../../api/client";
import { registrar } from "../../../../api/portal";
import type { UsuarioSesion } from "../../../../types/sesion";
import { Registro } from "../Registro";
import { aDatosRegistro, registroSchema } from "../schema";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/portal", () => ({ registrar: vi.fn() }));

const CLIENTE: UsuarioSesion = {
  id: 3,
  email: "camila.soto@example.test",
  name: "Camila Soto",
  tipo: "cliente",
  cliente: { id: 7, folio: "CLI-000007", nombre: "Camila Soto" },
  rol: null,
  permisos: [],
};

const PERSONA = {
  tipo: "persona" as const,
  rut: "11.111.111-1",
  nombres: "Camila",
  apellido_paterno: "Soto",
  apellido_materno: "",
  razon_social: "",
  email: "camila.soto@example.test",
  password: "clave-segura-1",
  confirmacion: "clave-segura-1",
};

function renderRegistro(path = "/registro?siguiente=%2Ftramites%2Fx%2Fpago") {
  const router = createMemoryRouter(
    [
      { path: "/registro", element: <Registro /> },
      { path: "/tramites/x/pago", element: <p>Pago</p> },
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

async function completar() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Tu RUT"), PERSONA.rut);
  await user.type(screen.getByLabelText("Nombres"), PERSONA.nombres);
  await user.type(screen.getByLabelText("Apellido paterno"), PERSONA.apellido_paterno);
  await user.type(screen.getByLabelText("Correo electrónico"), PERSONA.email);
  await user.type(screen.getByLabelText("Contraseña"), PERSONA.password);
  await user.type(screen.getByLabelText("Repite la contraseña"), PERSONA.confirmacion);
  await user.click(screen.getByRole("button", { name: "Crear cuenta" }));
}

describe("registroSchema", () => {
  it("asks for the fields of the chosen type", () => {
    const empresa = registroSchema.safeParse({ ...PERSONA, tipo: "empresa" });

    expect(empresa.success).toBe(false);
    expect(empresa.error?.issues.map((issue) => issue.path[0])).toEqual(["razon_social"]);
  });

  it("rejects a wrong check digit and mismatched passwords", () => {
    const resultado = registroSchema.safeParse({
      ...PERSONA,
      rut: "11.111.111-2",
      confirmacion: "otra",
    });

    expect(resultado.error?.issues.map((issue) => issue.path[0]).sort()).toEqual([
      "confirmacion",
      "rut",
    ]);
  });

  it("sends only the fields of the chosen type, with the RUT normalised", () => {
    const datos = aDatosRegistro({ ...PERSONA, razon_social: "No va" });

    expect(datos).toEqual({
      tipo: "persona",
      rut: "11111111-1",
      email: PERSONA.email,
      password: PERSONA.password,
      nombres: "Camila",
      apellido_paterno: "Soto",
      apellido_materno: "",
    });
  });
});

describe("Registro", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(null);
    vi.mocked(registrar).mockReset();
  });

  it("creates the account and continues where the client was going", async () => {
    vi.mocked(registrar).mockResolvedValue(CLIENTE);

    const router = renderRegistro();
    await completar();

    expect(await screen.findByText("Pago")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/tramites/x/pago");
  });

  it("shows the server's generic refusal", async () => {
    vi.mocked(registrar).mockRejectedValue(
      new ApiError(400, { detail: "No pudimos crear una cuenta con estos datos." }, "rejected"),
    );

    renderRegistro();
    await completar();

    expect(
      await screen.findByText("No pudimos crear una cuenta con estos datos."),
    ).toBeInTheDocument();
  });

  it("puts the server's password complaint on the field", async () => {
    vi.mocked(registrar).mockRejectedValue(
      new ApiError(400, { password: ["Esta contraseña es demasiado común."] }, "rejected"),
    );

    renderRegistro();
    await completar();

    expect(await screen.findByText("Esta contraseña es demasiado común.")).toBeInTheDocument();
  });
});
