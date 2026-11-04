/** All data here is synthetic. */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { ApiError } from "../../../../api/client";
import { gestionarAlerta, listarAlertas, obtenerResumenAlertas } from "../../../../api/contratos";
import { router } from "../../../../routes/routes";
import type { Pagina } from "../../../../types/cliente";
import type { AlertaVencimiento } from "../../../../types/contratos";
import type { UsuarioSesion } from "../../../../types/sesion";
import { renderEn } from "../../Clientes/__tests__/renderConSesion";
import { filtrosDesdeUrl, hayFiltros } from "../filtrosUrl";

vi.mock("../../../../api/auth", () => ({
  getSesion: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("../../../../api/contratos", async (original) => ({
  ...(await original<typeof import("../../../../api/contratos")>()),
  listarAlertas: vi.fn(),
  obtenerResumenAlertas: vi.fn(),
  gestionarAlerta: vi.fn(),
}));

const EJECUTIVO: UsuarioSesion = {
  id: 2,
  email: "ejecutivo@example.test",
  name: "Ejecutivo Demo",
  tipo: "staff",
  cliente: null,
  rol: "Ejecutivo",
  permisos: [
    "clientes.view_cliente",
    "contratos.view_alertavencimiento",
    "contratos.gestionar_alertavencimiento",
  ],
};
const SIN_PERMISO: UsuarioSesion = { ...EJECUTIVO, permisos: ["clientes.view_cliente"] };

const PENDIENTE: AlertaVencimiento = {
  id: 7,
  contrato: 70,
  folio: "LF-0007-2026",
  renovacion_automatica: true,
  cliente: { id: 9, codigo: "CLI-000009", nombre: "Transportes Austral de Ejemplo SpA" },
  servicios: ["Domicilio tributario", "Bodega"],
  ejecutivo_responsable: { id: 2, nombre: "Ejecutivo Demo" },
  umbral_dias: 15,
  fecha_vencimiento: "2027-03-11",
  dias_restantes: 10,
  estado: "pendiente",
  created_at: "2027-03-01T11:00:00Z",
  gestionada_por_nombre: null,
  gestionada_en: null,
  nota: "",
};
const GESTIONADA: AlertaVencimiento = {
  ...PENDIENTE,
  id: 8,
  estado: "gestionada",
  ejecutivo_responsable: null,
  gestionada_por_nombre: "Ejecutivo Demo",
  gestionada_en: "2026-01-15T15:30:05Z",
  nota: "Pagará por transferencia",
};

const pagina = (results: AlertaVencimiento[]): Pagina<AlertaVencimiento> => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

// Inside vitest's own 5-second limit per test.
const ESPERA_MENU_MS = 4000;

const renderAlertas = (consulta = "") => renderEn(`/backoffice/alertas${consulta}`, router.routes);

describe("AlertasVencimiento", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockReset();
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);
    vi.mocked(listarAlertas).mockReset();
    vi.mocked(listarAlertas).mockResolvedValue(pagina([PENDIENTE]));
    vi.mocked(obtenerResumenAlertas).mockReset();
    vi.mocked(obtenerResumenAlertas).mockResolvedValue({ pendientes: 3, umbrales: [60, 30, 15, 7] });
    vi.mocked(gestionarAlerta).mockReset();
  });

  describe("access", () => {
    it("shows the menu entry with its badge and the screen with the permission", async () => {
      renderAlertas();

      // The first render of the whole route tree, then two requests in sequence.
      const enlace = await screen.findByRole(
        "link",
        { name: "Alertas, 3 pendientes" },
        { timeout: ESPERA_MENU_MS },
      );
      expect(enlace).toHaveAttribute("href", "/backoffice/alertas");
      expect(within(enlace).getByText("3")).toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Alertas de vencimiento" })).toBeInTheDocument();
    });

    it("hides the entry, blocks the URL and asks nothing without it", async () => {
      vi.mocked(getSesion).mockResolvedValue(SIN_PERMISO);

      renderAlertas();

      expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /^Alertas/ })).not.toBeInTheDocument();
      expect(listarAlertas).not.toHaveBeenCalled();
      expect(obtenerResumenAlertas).not.toHaveBeenCalled();
    });

    it("shows no badge with nothing pending", async () => {
      vi.mocked(obtenerResumenAlertas).mockResolvedValue({ pendientes: 0, umbrales: [] });

      renderAlertas();

      expect(await screen.findByRole("link", { name: "Alertas" })).toBeInTheDocument();
    });

    it("shows no access when the API refuses", async () => {
      vi.mocked(listarAlertas).mockRejectedValue(new ApiError(403, {}, "Tu sesión no está activa."));

      renderAlertas();

      expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
    });
  });

  describe("table", () => {
    it("shows each column and links to the client's record", async () => {
      renderAlertas();

      const fila = (await screen.findByText("LF-0007-2026")).closest("tr")!;
      expect(within(fila).getByRole("link", { name: PENDIENTE.cliente.nombre })).toHaveAttribute(
        "href",
        "/backoffice/clientes/9",
      );
      expect(within(fila).getByText("Domicilio tributario, Bodega")).toBeInTheDocument();
      expect(within(fila).getByText("11 mar 2027")).toBeInTheDocument();
      expect(within(fila).getByText("10 días")).toBeInTheDocument();
      expect(within(fila).getByText("15 días")).toBeInTheDocument();
      expect(within(fila).getByText("Ejecutivo Demo")).toBeInTheDocument();
    });

    it("says who handled an alert, in Chile's time, with the note", async () => {
      vi.mocked(listarAlertas).mockResolvedValue(pagina([GESTIONADA]));

      renderAlertas("?estado=gestionada");

      const fila = (await screen.findByText("LF-0007-2026")).closest("tr")!;
      expect(within(fila).getByText("Sin responsable")).toBeInTheDocument();
      expect(within(fila).getByText(/Ejecutivo Demo · .*12:30:05/)).toBeInTheDocument();
      expect(within(fila).getByText("Pagará por transferencia")).toBeInTheDocument();
      expect(within(fila).queryByRole("button")).not.toBeInTheDocument();
    });

    it("says when nothing matches", async () => {
      vi.mocked(listarAlertas).mockResolvedValue(pagina([]));

      renderAlertas();

      expect(await screen.findByText("No hay alertas con estos filtros.")).toBeInTheDocument();
    });

    it("hides the action without the permission to handle", async () => {
      vi.mocked(getSesion).mockResolvedValue({
        ...EJECUTIVO,
        permisos: ["contratos.view_alertavencimiento"],
      });

      renderAlertas();

      const fila = (await screen.findByText("LF-0007-2026")).closest("tr")!;
      expect(within(fila).getByText("Pendiente")).toBeInTheDocument();
      expect(within(fila).queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("filters", () => {
    it("reads them from the URL", async () => {
      renderAlertas("?estado=gestionada&mias=true&umbral=30&pagina=2");

      await waitFor(() =>
        expect(listarAlertas).toHaveBeenCalledWith(
          { estado: "gestionada", mias: "true", umbral: "30", pagina: 2 },
          expect.anything(),
        ),
      );
    });

    it("asks for the pending alerts by default", async () => {
      renderAlertas();

      await waitFor(() =>
        expect(listarAlertas).toHaveBeenCalledWith(
          { estado: "pendiente", pagina: 1 },
          expect.anything(),
        ),
      );
    });

    it("writes the state and the 'mine' filter to the URL, back on the first page", async () => {
      const user = userEvent.setup();
      const navegador = renderAlertas("?pagina=2");

      await user.click(await screen.findByRole("combobox", { name: "Estado" }));
      await user.click(await screen.findByRole("option", { name: "Gestionadas" }));
      await waitFor(() => expect(navegador.state.location.search).toBe("?estado=gestionada"));

      await user.click(screen.getByRole("checkbox", { name: "Solo los contratos a mi cargo" }));
      await waitFor(() =>
        expect(navegador.state.location.search).toBe("?estado=gestionada&mias=true"),
      );

      await user.click(screen.getByRole("checkbox", { name: "Solo los contratos a mi cargo" }));
      await waitFor(() => expect(navegador.state.location.search).toBe("?estado=gestionada"));
    });

    it("offers the thresholds the API reports, and writes the chosen one to the URL", async () => {
      const user = userEvent.setup();
      const navegador = renderAlertas();

      await user.click(await screen.findByRole("combobox", { name: "Umbral" }));
      await user.click(await screen.findByRole("option", { name: "30 días" }));

      await waitFor(() => expect(navegador.state.location.search).toBe("?umbral=30"));
    });

    it("keeps showing a threshold from a shared URL that the list does not have", async () => {
      renderAlertas("?umbral=45");

      expect(await screen.findByRole("combobox", { name: "Umbral" })).toHaveTextContent("45 días");
    });

    it("clears them", async () => {
      const user = userEvent.setup();
      const navegador = renderAlertas("?estado=gestionada&umbral=30");

      await user.click(await screen.findByRole("button", { name: "Limpiar filtros" }));

      await waitFor(() => expect(navegador.state.location.search).toBe(""));
    });

    it("shows an API error next to its filter", async () => {
      vi.mocked(listarAlertas).mockRejectedValue(
        new ApiError(400, { umbral: ["Introduzca un número entero válido."] }, "x"),
      );

      renderAlertas("?umbral=x");

      expect(await screen.findByText("Introduzca un número entero válido.")).toBeInTheDocument();
      expect(screen.getByText("Corrige los filtros marcados para ver las alertas.")).toBeInTheDocument();
    });

    it("the URL helpers treat pending as no filter", () => {
      const sinFiltros = filtrosDesdeUrl(new URLSearchParams(""));
      expect(sinFiltros).toEqual({ estado: "pendiente", pagina: 1 });
      expect(hayFiltros(sinFiltros)).toBe(false);
      expect(hayFiltros(filtrosDesdeUrl(new URLSearchParams("estado=gestionada")))).toBe(true);
      expect(filtrosDesdeUrl(new URLSearchParams("mias=no")).mias).toBeUndefined();
    });
  });

  describe("handling", () => {
    const abrir = async () => {
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: "Marcar como gestionada" }));
      return { user, dialogo: await screen.findByRole("dialog") };
    };

    it("sends the note, closes and refreshes the list and the badge", async () => {
      vi.mocked(gestionarAlerta).mockResolvedValue(GESTIONADA);
      renderAlertas();
      const { user, dialogo } = await abrir();
      vi.mocked(obtenerResumenAlertas).mockResolvedValue({ pendientes: 2, umbrales: [60, 30, 15, 7] });
      vi.mocked(listarAlertas).mockResolvedValue(pagina([]));

      expect(within(dialogo).getByText(/no escribas datos sensibles/)).toBeInTheDocument();
      await user.type(within(dialogo).getByRole("textbox", { name: "Nota (opcional)" }), "Llamé al cliente");
      await user.click(within(dialogo).getByRole("button", { name: "Marcar como gestionada" }));

      await waitFor(() => expect(gestionarAlerta).toHaveBeenCalledWith(7, "Llamé al cliente"));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(
        await screen.findByRole("link", { name: "Alertas, 2 pendientes" }, { timeout: ESPERA_MENU_MS }),
      ).toBeInTheDocument();
      expect(await screen.findByText("No hay alertas con estos filtros.")).toBeInTheDocument();
    });

    it("works without a note", async () => {
      vi.mocked(gestionarAlerta).mockResolvedValue(GESTIONADA);
      renderAlertas();
      const { user, dialogo } = await abrir();

      await user.click(within(dialogo).getByRole("button", { name: "Marcar como gestionada" }));

      await waitFor(() => expect(gestionarAlerta).toHaveBeenCalledWith(7, ""));
    });

    it("says so and refreshes when someone else already handled it", async () => {
      vi.mocked(gestionarAlerta).mockRejectedValue(
        new ApiError(409, { codigo: "alerta_ya_gestionada" }, "x"),
      );
      renderAlertas();
      const { user, dialogo } = await abrir();
      const llamadas = vi.mocked(listarAlertas).mock.calls.length;

      await user.click(within(dialogo).getByRole("button", { name: "Marcar como gestionada" }));

      expect(await screen.findByText(/Otra persona ya gestionó esa alerta/)).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await waitFor(() =>
        expect(vi.mocked(listarAlertas).mock.calls.length).toBeGreaterThan(llamadas),
      );
    });

    it("keeps the dialog open on any other error", async () => {
      vi.mocked(gestionarAlerta).mockRejectedValue(new ApiError(500, {}, "x"));
      renderAlertas();
      const { user, dialogo } = await abrir();

      await user.click(within(dialogo).getByRole("button", { name: "Marcar como gestionada" }));

      expect(await within(dialogo).findByText(/No pudimos guardar la gestión/)).toBeInTheDocument();
    });
  });
});
