/** All data here is synthetic. */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { listarAuditoria } from "../../../../api/auditoria";
import { ApiError } from "../../../../api/client";
import { router } from "../../../../routes/routes";
import { renderEn } from "../../Clientes/__tests__/renderConSesion";
import {
  ADMINISTRADOR,
  CIERRE_SESION,
  CREACION,
  DEL_SISTEMA,
  EJECUTIVO,
  ELIMINACION,
  INGRESO_FALLIDO,
  MODIFICACION,
  pagina,
} from "./fixtures";

vi.mock("../../../../api/auth", () => ({
  getSesion: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("../../../../api/auditoria", async (original) => ({
  ...(await original<typeof import("../../../../api/auditoria")>()),
  listarAuditoria: vi.fn(),
}));

// The real route tree, so the guard and the menu entry are the ones that ship.
const renderAuditoria = (consulta = "") => renderEn(`/backoffice/auditoria${consulta}`, router.routes);

describe("RegistroAuditoria", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockReset();
    vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);
    vi.mocked(listarAuditoria).mockReset();
    vi.mocked(listarAuditoria).mockResolvedValue(pagina([MODIFICACION]));
  });

  describe("access", () => {
    it("shows the menu entry and the log with the permission", async () => {
      renderAuditoria();

      expect(await screen.findByRole("link", { name: "Auditoría" })).toHaveAttribute(
        "href",
        "/backoffice/auditoria",
      );
      expect(await screen.findByText("Transportes Austral de Ejemplo SpA")).toBeInTheDocument();
    });

    it("hides the menu entry and blocks the direct URL without it", async () => {
      vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);

      renderAuditoria();

      expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Auditoría" })).not.toBeInTheDocument();
      expect(listarAuditoria).not.toHaveBeenCalled();
    });

    it("shows the no-permission view on a 403, without asking again", async () => {
      vi.mocked(listarAuditoria).mockRejectedValue(new ApiError(403, {}, "refused"));

      renderAuditoria();

      expect(await screen.findByText("Sin acceso")).toBeInTheDocument();
      expect(listarAuditoria).toHaveBeenCalledTimes(1);
    });

    it("sends them to log in when the 403 means the session ended", async () => {
      vi.mocked(getSesion).mockResolvedValueOnce(ADMINISTRADOR).mockResolvedValue(null);
      vi.mocked(listarAuditoria).mockRejectedValue(new ApiError(403, {}, "refused"));

      const memoria = renderAuditoria("?accion=crear");

      await waitFor(() => expect(memoria.state.location.pathname).toBe("/backoffice/ingresar"));
      expect(memoria.state.location.search).toBe("?siguiente=%2Fbackoffice%2Fauditoria%3Faccion%3Dcrear");
    });
  });

  describe("table", () => {
    it("shows the entry in Chile time, with its labels", async () => {
      renderAuditoria();

      const fila = (await screen.findByText("Transportes Austral de Ejemplo SpA")).closest("tr")!;
      const celdas = within(fila);
      expect(celdas.getByText(/12:30:05/)).toBeInTheDocument();
      expect(celdas.getByText("Administración Demo")).toBeInTheDocument();
      expect(celdas.getByText("Backoffice")).toBeInTheDocument();
      expect(celdas.getByText("Modificación")).toBeInTheDocument();
      expect(celdas.getByText("Empresa")).toBeInTheDocument();
      expect(celdas.getByText("192.0.2.10")).toBeInTheDocument();
    });

    it("shows Sistema when no user acted", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([DEL_SISTEMA]));

      renderAuditoria();

      const fila = (await screen.findByText("VEN-000004")).closest("tr")!;
      expect(within(fila).getAllByText("Sistema")).toHaveLength(2);
    });

    it("shows a failed sign-in as unidentified, with the typed address in its detail", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([INGRESO_FALLIDO]));
      const user = userEvent.setup();

      renderAuditoria();

      expect(await screen.findByText("Sin identificar")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Ver detalle" }));
      const detalle = await screen.findByRole("dialog");
      expect(within(detalle).getByText(/alguien@example\.test/)).toBeInTheDocument();
      expect(within(detalle).queryByRole("link", { name: "Ver solo este usuario" })).not.toBeInTheDocument();
      expect(within(detalle).queryByRole("link", { name: "Ver solo este registro" })).not.toBeInTheDocument();
    });

    it("says when nothing matches", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([]));

      renderAuditoria("?accion=eliminar");

      expect(await screen.findByText("No hay entradas con estos filtros.")).toBeInTheDocument();
    });
  });

  describe("detail", () => {
    const abrirDetalle = async () => {
      const user = userEvent.setup();
      await user.click(await screen.findByRole("button", { name: "Ver detalle" }));
      return { user, detalle: await screen.findByRole("dialog") };
    };

    it("renders a change as field: before → after", async () => {
      renderAuditoria();

      const { detalle } = await abrirDetalle();

      expect(within(detalle).getByText("Cambios")).toBeInTheDocument();
      expect(
        within(detalle).getByText(/Transportes Antiguos SpA → Transportes Austral de Ejemplo SpA/),
      ).toHaveTextContent("Razon social:");
    });

    it("renders only the new values of a creation", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([CREACION]));
      renderAuditoria();

      const { detalle } = await abrirDetalle();

      expect(within(detalle).getByText("Valores nuevos")).toBeInTheDocument();
      expect(within(detalle).getByText(/Transportes Antiguos SpA/)).toBeInTheDocument();
      expect(within(detalle).queryByText(/→/)).not.toBeInTheDocument();
    });

    it("renders only the old values of a deletion", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([ELIMINACION]));
      renderAuditoria();

      const { detalle } = await abrirDetalle();

      expect(within(detalle).getByText("Valores anteriores")).toBeInTheDocument();
      expect(within(detalle).getByText(/Transportes Antiguos SpA/)).toBeInTheDocument();
      expect(within(detalle).queryByText(/→/)).not.toBeInTheDocument();
    });

    it("says when an event recorded no data", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([CIERRE_SESION]));
      renderAuditoria();

      const { detalle } = await abrirDetalle();

      expect(within(detalle).getByText("Esta acción no guarda datos adicionales.")).toBeInTheDocument();
    });

    it("narrows the log to the record from its detail, and closes", async () => {
      const memoria = renderAuditoria("?accion=modificar&pagina=2");

      const { user, detalle } = await abrirDetalle();
      await user.click(within(detalle).getByRole("link", { name: "Ver solo este registro" }));

      await waitFor(() =>
        expect(memoria.state.location.search).toBe("?entidad=clientes.empresa&registro_id=7"),
      );
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("narrows the log to the user from its detail", async () => {
      const memoria = renderAuditoria();

      const { user, detalle } = await abrirDetalle();
      await user.click(within(detalle).getByRole("link", { name: "Ver solo este usuario" }));

      await waitFor(() => expect(memoria.state.location.search).toBe("?usuario=1"));
      expect(await screen.findByText("Usuario: Administración Demo")).toBeInTheDocument();
    });
  });

  describe("filters", () => {
    const COMPLETA =
      "?entidad=clientes.cliente&registro_id=7&usuario=1&accion=modificar&origen=api&desde=2026-10-01&hasta=2026-10-31&pagina=2";

    it("restores every filter from the URL", async () => {
      renderAuditoria(COMPLETA);

      await waitFor(() =>
        expect(listarAuditoria).toHaveBeenCalledWith(
          {
            entidad: "clientes.cliente",
            registro_id: "7",
            usuario: "1",
            accion: "modificar",
            origen: "api",
            desde: "2026-10-01",
            hasta: "2026-10-31",
            pagina: 2,
          },
          expect.anything(),
        ),
      );
      expect(screen.getByRole("combobox", { name: "Entidad" })).toHaveTextContent("Cliente");
      expect(screen.getByRole("combobox", { name: "Acción" })).toHaveTextContent("Modificación");
      expect(screen.getByRole("combobox", { name: "Canal" })).toHaveTextContent("Backoffice");
      expect(screen.getByLabelText("ID de registro")).toHaveValue("7");
      expect(screen.getByLabelText("Desde")).toHaveValue("2026-10-01");
      expect(screen.getByLabelText("Hasta")).toHaveValue("2026-10-31");
      expect(await screen.findByText("Usuario: Administración Demo")).toBeInTheDocument();
    });

    it("names an unknown user by id while no row can name them", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([]));

      renderAuditoria("?usuario=99");

      expect(await screen.findByText("Usuario: #99")).toBeInTheDocument();
    });

    it("keeps working with an entity the list does not know", async () => {
      renderAuditoria("?entidad=app.nueva");

      await waitFor(() =>
        expect(listarAuditoria).toHaveBeenCalledWith(
          { entidad: "app.nueva", pagina: 1 },
          expect.anything(),
        ),
      );
      expect(screen.getByRole("combobox", { name: "Entidad" })).toHaveTextContent("app.nueva");
    });

    it("puts a chosen filter in the URL and starts from the first page", async () => {
      const user = userEvent.setup();
      const memoria = renderAuditoria("?origen=api&pagina=3");

      await user.click(await screen.findByRole("combobox", { name: "Acción" }));
      await user.click(await screen.findByRole("option", { name: "Inicio de sesión fallido" }));

      await waitFor(() =>
        expect(memoria.state.location.search).toBe("?origen=api&accion=inicio_sesion_fallido"),
      );
      await waitFor(() =>
        expect(listarAuditoria).toHaveBeenLastCalledWith(
          { origen: "api", accion: "inicio_sesion_fallido", pagina: 1 },
          expect.anything(),
        ),
      );
    });

    it("sends the entity by its API name", async () => {
      const user = userEvent.setup();
      const memoria = renderAuditoria();

      await user.click(await screen.findByRole("combobox", { name: "Entidad" }));
      await user.click(await screen.findByRole("option", { name: "Trámite" }));

      await waitFor(() => expect(memoria.state.location.search).toBe("?entidad=tramites.tramite"));
    });

    it("waits for the typing to end before filtering by record", async () => {
      const user = userEvent.setup();
      const memoria = renderAuditoria("?entidad=clientes.cliente");

      await user.type(await screen.findByLabelText("ID de registro"), "42");

      await waitFor(() =>
        expect(memoria.state.location.search).toBe("?entidad=clientes.cliente&registro_id=42"),
      );
      expect(listarAuditoria).not.toHaveBeenCalledWith(
        expect.objectContaining({ registro_id: "4" }),
        expect.anything(),
      );
    });

    it("sets the dates in the API's format", async () => {
      const user = userEvent.setup();
      const memoria = renderAuditoria();

      await user.type(await screen.findByLabelText("Desde"), "2026-10-01");

      await waitFor(() => expect(memoria.state.location.search).toBe("?desde=2026-10-01"));
    });

    it("removes the user filter from its chip", async () => {
      const memoria = renderAuditoria("?usuario=1&accion=crear");
      const user = userEvent.setup();

      const chip = await screen.findByText("Usuario: Administración Demo");
      await user.click(within(chip.closest(".MuiChip-root") as HTMLElement).getByTestId("CancelIcon"));

      await waitFor(() => expect(memoria.state.location.search).toBe("?accion=crear"));
    });

    it("clears every filter", async () => {
      const user = userEvent.setup();
      const memoria = renderAuditoria(COMPLETA);

      await user.click(await screen.findByRole("button", { name: "Limpiar filtros" }));

      await waitFor(() => expect(memoria.state.location.search).toBe(""));
      expect(screen.getByLabelText("ID de registro")).toHaveValue("");
      expect(screen.queryByRole("button", { name: "Limpiar filtros" })).not.toBeInTheDocument();
    });

    it("shows the API's error under its field and keeps the filters", async () => {
      vi.mocked(listarAuditoria).mockRejectedValue(
        new ApiError(400, { hasta: ["La fecha final no puede ser anterior a la inicial."] }, "invalid"),
      );

      renderAuditoria("?desde=2026-10-31&hasta=2026-10-01");

      expect(
        await screen.findByText("La fecha final no puede ser anterior a la inicial."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Hasta")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Corrige los filtros marcados para ver el registro.")).toBeInTheDocument();
      expect(listarAuditoria).toHaveBeenCalledTimes(1);
    });

    it("shows an error about a parameter with no field of its own", async () => {
      vi.mocked(listarAuditoria).mockRejectedValue(
        new ApiError(400, { usuario: ["Introduzca un número entero válido."] }, "invalid"),
      );

      renderAuditoria("?usuario=abc");

      expect(await screen.findByRole("alert")).toHaveTextContent("Introduzca un número entero válido.");
    });

    it("says when the log could not load", async () => {
      vi.mocked(listarAuditoria).mockRejectedValue(new ApiError(400, "no es un objeto", "invalid"));

      renderAuditoria();

      expect(await screen.findByText(/No pudimos cargar el registro/)).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("asks the API for the next page and keeps it in the URL", async () => {
      vi.mocked(listarAuditoria).mockResolvedValue(pagina([MODIFICACION], 30));
      const user = userEvent.setup();
      const memoria = renderAuditoria("?accion=modificar");

      await user.click(await screen.findByRole("button", { name: /next page|página siguiente/i }));

      await waitFor(() => expect(memoria.state.location.search).toBe("?accion=modificar&pagina=2"));
      await waitFor(() =>
        expect(listarAuditoria).toHaveBeenLastCalledWith(
          { accion: "modificar", pagina: 2 },
          expect.anything(),
        ),
      );
    });

    it("offers the way back from a page that does not exist", async () => {
      vi.mocked(listarAuditoria).mockRejectedValue(new ApiError(404, {}, "missing"));
      const user = userEvent.setup();
      const memoria = renderAuditoria("?accion=crear&pagina=99");

      expect(await screen.findByText("Esa página no existe con estos filtros.")).toBeInTheDocument();
      expect(listarAuditoria).toHaveBeenCalledTimes(1);
      await user.click(screen.getByRole("button", { name: "Ir a la primera página" }));

      await waitFor(() => expect(memoria.state.location.search).toBe("?accion=crear"));
    });
  });
});
