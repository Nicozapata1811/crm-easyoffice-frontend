/** All data here is synthetic. */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import { obtenerHistorial } from "../../../../api/auditoria";
import { ApiError } from "../../../../api/client";
import { obtenerCliente } from "../../../../api/clientes";
import {
  asignarResponsable,
  listarContratosDeCliente,
  listarEjecutivos,
} from "../../../../api/contratos";
import type { Pagina } from "../../../../types/cliente";
import type { Contrato } from "../../../../types/contratos";
import type { UsuarioSesion } from "../../../../types/sesion";
import { FichaCliente } from "../FichaCliente";
import { EJECUTIVO, renderEn } from "./renderConSesion";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/clientes", () => ({ obtenerCliente: vi.fn() }));
vi.mock("../../../../api/auditoria", async (original) => ({
  ...(await original<typeof import("../../../../api/auditoria")>()),
  obtenerHistorial: vi.fn(),
}));
vi.mock("../../../../api/contratos", async (original) => ({
  ...(await original<typeof import("../../../../api/contratos")>()),
  listarContratosDeCliente: vi.fn(),
  listarEjecutivos: vi.fn(),
  asignarResponsable: vi.fn(),
}));

const CON_CONTRATOS: UsuarioSesion = {
  ...EJECUTIVO,
  permisos: [...EJECUTIVO.permisos, "contratos.view_contrato", "contratos.change_contrato"],
};
const ADMINISTRADOR: UsuarioSesion = {
  ...CON_CONTRATOS,
  id: 1,
  rol: "Administrador",
  permisos: [...CON_CONTRATOS.permisos, "contratos.asignar_responsable_contrato"],
};

const VIGENTE: Contrato = {
  id: 70,
  folio: "LF-0007-2026",
  estado: "vigente",
  cliente: { id: 9, codigo: "CLI-000009", nombre: "Transportes Austral de Ejemplo SpA" },
  fecha_inicio: "2026-10-02",
  duracion_meses: 12,
  fecha_vencimiento: "2027-10-01",
  renovacion_automatica: true,
  ejecutivo_responsable: 2,
  ejecutivo_responsable_nombre: "Ejecutivo Demo",
  dias_restantes: 29,
  servicios: [
    { orden: 1, servicio: "domicilio-tributario", nombre: "Domicilio tributario" },
    { orden: 2, servicio: "bodega", nombre: "Bodega" },
  ],
};
const ANULADO: Contrato = {
  ...VIGENTE,
  id: 71,
  folio: "LF-0008-2026",
  estado: "anulado",
  ejecutivo_responsable: null,
  ejecutivo_responsable_nombre: null,
  dias_restantes: null,
};

const pagina = (results: Contrato[], count = results.length): Pagina<Contrato> => ({
  count,
  next: null,
  previous: null,
  results,
});

function renderFicha() {
  return renderEn("/backoffice/clientes/9", [
    { path: "/backoffice/clientes/:clienteId", element: <FichaCliente /> },
  ]);
}

describe("ContratosCliente", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(CON_CONTRATOS);
    vi.mocked(obtenerCliente).mockResolvedValue({
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
        nombre_fantasia: "",
        giro: "Transporte de carga",
        email: "contacto@example.test",
        telefono: "",
      },
      representantes: [],
    });
    vi.mocked(obtenerHistorial).mockResolvedValue({ count: 0, next: null, previous: null, results: [] });
    vi.mocked(listarContratosDeCliente).mockReset();
    vi.mocked(listarContratosDeCliente).mockResolvedValue(pagina([VIGENTE, ANULADO]));
    vi.mocked(listarEjecutivos).mockReset();
    vi.mocked(listarEjecutivos).mockResolvedValue([
      { id: 2, nombre: "Ejecutivo Demo" },
      { id: 3, nombre: "Ejecutiva Prueba" },
    ]);
    vi.mocked(asignarResponsable).mockReset();
  });

  it("shows each contract's folio, state, services, dates, days left and responsible", async () => {
    renderFicha();

    const seccion = await screen.findByRole("region", { name: "Servicios y documentos" });
    const fila = (await within(seccion).findByText("LF-0007-2026")).closest("tr")!;
    expect(within(fila).getByText("Vigente")).toBeInTheDocument();
    expect(within(fila).getByText("Domicilio tributario, Bodega")).toBeInTheDocument();
    expect(within(fila).getByText("2 oct 2026")).toBeInTheDocument();
    expect(within(fila).getByText("1 oct 2027")).toBeInTheDocument();
    expect(within(fila).getByText("29 días")).toBeInTheDocument();
    expect(within(fila).getByText("Ejecutivo Demo")).toBeInTheDocument();
    expect(listarContratosDeCliente).toHaveBeenCalledWith(9, 1, expect.anything());
  });

  it("shows no chip for a contract that is not in force", async () => {
    renderFicha();

    const fila = (await screen.findByText("LF-0008-2026")).closest("tr")!;
    expect(within(fila).getByText("Anulado")).toBeInTheDocument();
    expect(within(fila).getByText("—")).toBeInTheDocument();
    expect(within(fila).getByText("Sin responsable")).toBeInTheDocument();
  });

  it("says when the client has none", async () => {
    vi.mocked(listarContratosDeCliente).mockResolvedValue(pagina([]));

    renderFicha();

    expect(await screen.findByText("Este cliente no tiene contratos registrados.")).toBeInTheDocument();
  });

  it("renders above the audit section", async () => {
    vi.mocked(getSesion).mockResolvedValue({
      ...CON_CONTRATOS,
      permisos: [...CON_CONTRATOS.permisos, "core.consultar_auditoria"],
    });

    renderFicha();

    const contratos = await screen.findByRole("region", { name: "Servicios y documentos" });
    const auditoria = await screen.findByRole("region", { name: "Registro de auditoría" });
    expect(contratos.compareDocumentPosition(auditoria)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("is not shown and asks nothing without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue(EJECUTIVO);

    renderFicha();

    await screen.findByRole("region", { name: "Datos del cliente" });
    expect(screen.queryByRole("region", { name: "Servicios y documentos" })).not.toBeInTheDocument();
    expect(listarContratosDeCliente).not.toHaveBeenCalled();
  });

  describe("responsible executive", () => {
    it("is not offered to an executive, even with change_contrato", async () => {
      renderFicha();

      await screen.findByText("LF-0007-2026");
      expect(screen.queryByRole("button", { name: /Cambiar responsable/ })).not.toBeInTheDocument();
      expect(listarEjecutivos).not.toHaveBeenCalled();
    });

    it("lets the Administrador change it, only on a contract that admits it", async () => {
      vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);
      vi.mocked(asignarResponsable).mockResolvedValue(VIGENTE);
      const user = userEvent.setup();
      renderFicha();

      await screen.findByText("LF-0008-2026");
      expect(screen.queryByRole("button", { name: "Cambiar responsable de LF-0008-2026" })).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Cambiar responsable de LF-0007-2026" }));

      const dialogo = await screen.findByRole("dialog");
      await waitFor(() =>
        expect(within(dialogo).getByRole("combobox", { name: "Responsable" })).toHaveTextContent("Ejecutivo Demo"),
      );
      await user.click(within(dialogo).getByRole("combobox", { name: "Responsable" }));
      await user.click(await screen.findByRole("option", { name: "Ejecutiva Prueba" }));
      await user.click(within(dialogo).getByRole("button", { name: "Guardar" }));

      await waitFor(() => expect(asignarResponsable).toHaveBeenCalledWith(70, 3));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(listarContratosDeCliente).toHaveBeenCalledTimes(2));
    });

    it("says why when the contract no longer admits it", async () => {
      vi.mocked(getSesion).mockResolvedValue(ADMINISTRADOR);
      vi.mocked(asignarResponsable).mockRejectedValue(
        new ApiError(409, { codigo: "contrato_no_editable" }, "x"),
      );
      const user = userEvent.setup();
      renderFicha();

      await user.click(await screen.findByRole("button", { name: "Cambiar responsable de LF-0007-2026" }));
      const dialogo = await screen.findByRole("dialog");
      await waitFor(() => expect(within(dialogo).getByRole("button", { name: "Guardar" })).toBeEnabled());
      await user.click(within(dialogo).getByRole("button", { name: "Guardar" }));

      expect(await within(dialogo).findByText("Este contrato ya no admite cambios.")).toBeInTheDocument();
    });
  });
});
