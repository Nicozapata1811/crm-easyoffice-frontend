/** All data here is synthetic. */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listarServicios } from "../../../../api/portal";
import type { Servicio } from "../../../../types/ventas";
import { CatalogoServicios } from "../CatalogoServicios";

vi.mock("../../../../api/portal", () => ({ listarServicios: vi.fn() }));

function servicio(datos: Partial<Servicio> & Pick<Servicio, "codigo" | "nombre">): Servicio {
  return {
    id: 1,
    descripcion: "",
    precio_base: null,
    precio_incluye_iva: true,
    precio_confirmado: false,
    ciclo_pago_default: null,
    visible_en_portal: true,
    se_vende_en_portal: false,
    ...datos,
  };
}

const SERVICIOS: Servicio[] = [
  servicio({
    id: 1,
    codigo: "domicilio-tributario",
    nombre: "Domicilio tributario",
    descripcion: "Domicilio tributario, postal y comercial.",
    precio_base: "59990",
    ciclo_pago_default: "anual",
    se_vende_en_portal: true,
  }),
  servicio({
    id: 2,
    codigo: "firma-electronica-avanzada",
    nombre: "Firma electrónica avanzada",
    precio_base: "3500",
    visible_en_portal: false,
    se_vende_en_portal: true,
  }),
  servicio({
    id: 3,
    codigo: "bodega",
    nombre: "Bodega",
    descripcion: "Contrato para usar una bodega.",
  }),
  servicio({
    id: 4,
    codigo: "arriendo-vehiculo",
    nombre: "Arriendo de vehículo",
    descripcion: "Contrato de arriendo de un vehículo.",
  }),
];

function renderCatalogo() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <CatalogoServicios /> },
      { path: "/tramites/domicilio-tributario/nuevo", element: <p>Formulario de domicilio</p> },
    ],
    { initialEntries: ["/"] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

/** The card whose title is `nombre`. */
function tarjeta(nombre: string): HTMLElement {
  const titulo = screen.getByRole("heading", { name: nombre });
  return titulo.closest(".MuiPaper-root") as HTMLElement;
}

describe("CatalogoServicios", () => {
  beforeEach(() => {
    vi.mocked(listarServicios).mockReset().mockResolvedValue(SERVICIOS);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the visible services from the API, in order", async () => {
    renderCatalogo();

    await screen.findByRole("heading", { name: "Domicilio tributario" });
    const titulos = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titulos).toEqual(["Domicilio tributario", "Bodega", "Arriendo de vehículo"]);
    expect(screen.queryByText("Firma electrónica avanzada")).not.toBeInTheDocument();
  });

  it("marks bookable services available and the rest as coming soon", async () => {
    renderCatalogo();

    await screen.findByRole("heading", { name: "Domicilio tributario" });
    expect(within(tarjeta("Domicilio tributario")).getByText("Disponible ahora")).toBeInTheDocument();
    expect(within(tarjeta("Bodega")).getByText("Próximamente")).toBeInTheDocument();
    expect(within(tarjeta("Arriendo de vehículo")).getByText("Próximamente")).toBeInTheDocument();
  });

  it("navigates only from a bookable card with a route", async () => {
    const user = userEvent.setup();
    const router = renderCatalogo();

    await screen.findByRole("heading", { name: "Domicilio tributario" });
    const enlaces = screen.getAllByRole("link").filter((enlace) => enlace.closest(".MuiPaper-root"));
    expect(enlaces).toHaveLength(1);

    await user.click(tarjeta("Bodega"));
    expect(router.state.location.pathname).toBe("/");

    await user.click(enlaces[0]);
    expect(router.state.location.pathname).toBe("/tramites/domicilio-tributario/nuevo");
  });

  it("makes the bodega card bookable once the backend sells it", async () => {
    vi.mocked(listarServicios).mockResolvedValue([
      servicio({
        codigo: "bodega",
        nombre: "Bodega",
        precio_base: "59990",
        ciclo_pago_default: "anual",
        se_vende_en_portal: true,
      }),
    ]);
    renderCatalogo();

    await screen.findByRole("heading", { name: "Bodega" });
    expect(within(tarjeta("Bodega")).getByText("Disponible ahora")).toBeInTheDocument();
    expect(tarjeta("Bodega").closest("a")).toHaveAttribute("href", "/tramites/bodega/nuevo");
  });

  it("shows a bookable service without a route as coming soon and warns", async () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.mocked(listarServicios).mockResolvedValue([
      servicio({ codigo: "poder-simple", nombre: "Poder simple", precio_base: "9900", se_vende_en_portal: true }),
    ]);
    renderCatalogo();

    await screen.findByRole("heading", { name: "Poder simple" });
    expect(within(tarjeta("Poder simple")).getByText("Próximamente")).toBeInTheDocument();
    expect(within(tarjeta("Poder simple")).queryByRole("link")).not.toBeInTheDocument();
    expect(tarjeta("Poder simple").tagName).not.toBe("A");
    expect(aviso).toHaveBeenCalledWith(expect.stringContaining("poder-simple"));
  });

  it("shows reference prices as examples and missing prices as to be confirmed", async () => {
    renderCatalogo();

    await screen.findByRole("heading", { name: "Domicilio tributario" });
    expect(within(tarjeta("Domicilio tributario")).getByText(/\$59\.990/)).toBeInTheDocument();
    expect(within(tarjeta("Bodega")).getByText("Por confirmar")).toBeInTheDocument();
    expect(screen.getByText(/Valores de ejemplo/)).toBeInTheDocument();
  });

  it("filters the cards by name or description, ignoring accents", async () => {
    const user = userEvent.setup();
    renderCatalogo();

    await screen.findByRole("heading", { name: "Domicilio tributario" });
    const buscador = screen.getByRole("textbox", { name: "Buscar servicio" });

    await user.type(buscador, "VEHICULO");
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Arriendo de vehículo",
    ]);

    await user.clear(buscador);
    await user.type(buscador, "postal");
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Domicilio tributario",
    ]);

    await user.clear(buscador);
    await user.type(buscador, "notaría");
    expect(screen.getByText("No encontramos servicios para «notaría».")).toBeInTheDocument();
  });

  it("shows a spinner while loading", () => {
    vi.mocked(listarServicios).mockReturnValue(new Promise(() => undefined));
    renderCatalogo();

    expect(screen.getByRole("progressbar", { name: "Cargando servicios" })).toBeInTheDocument();
  });

  it("shows an error and retries", async () => {
    vi.mocked(listarServicios).mockRejectedValueOnce(new Error("red"));
    const user = userEvent.setup();
    renderCatalogo();

    expect(await screen.findByText(/No pudimos cargar los servicios/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("heading", { name: "Domicilio tributario" })).toBeInTheDocument();
  });

  it("says so when no service is published", async () => {
    vi.mocked(listarServicios).mockResolvedValue([]);
    renderCatalogo();

    expect(await screen.findByText("Pronto publicaremos nuestros servicios.")).toBeInTheDocument();
  });
});
