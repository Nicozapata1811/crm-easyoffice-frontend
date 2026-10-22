/** All data here is synthetic. */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import {
  cambiarFechaInicioBackoffice,
  confirmarTramiteBackoffice,
  descargarDocumentoBackoffice,
  listarDocumentosBackoffice,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
  regenerarDocumento,
  subirDocumentoFirmado,
} from "../../../../api/tramites";
import {
  DOCUMENTO,
  FORMULARIO_BODEGA,
  TRAMITE_BACKOFFICE,
  TRAMITE_BODEGA,
} from "../../../tramites/__tests__/fixtures";
import { EJECUTIVO, renderEn } from "../../Clientes/__tests__/renderConSesion";
import { DetalleTramite } from "../DetalleTramite";

vi.mock("../../../../api/auth", () => ({ getSesion: vi.fn() }));
vi.mock("../../../../api/tramites", () => ({
  obtenerTramiteBackoffice: vi.fn(),
  listarDocumentosBackoffice: vi.fn(),
  descargarDocumentoBackoffice: vi.fn(),
  subirDocumentoFirmado: vi.fn(),
  regenerarDocumento: vi.fn(),
  confirmarTramiteBackoffice: vi.fn(),
  cambiarFechaInicioBackoffice: vi.fn(),
  obtenerFormularioTramite: vi.fn(),
}));

const CON_PERMISOS = {
  ...EJECUTIVO,
  permisos: [
    "tramites.view_tramite",
    "tramites.gestionar_tramite",
    "documentos.view_documento",
    "documentos.subir_documento_firmado",
  ],
};

function renderDetalle() {
  return renderEn("/backoffice/tramites/7", [
    { path: "/backoffice/tramites/:tramiteId", element: <DetalleTramite /> },
  ]);
}

describe("DetalleTramite", () => {
  beforeEach(() => {
    vi.mocked(getSesion).mockResolvedValue(CON_PERMISOS);
    vi.mocked(obtenerTramiteBackoffice).mockResolvedValue(TRAMITE_BACKOFFICE);
    vi.mocked(listarDocumentosBackoffice).mockResolvedValue([DOCUMENTO]);
    vi.mocked(subirDocumentoFirmado).mockReset();
  });

  it("shows the case, its contract, documents and history", async () => {
    renderDetalle();

    expect(await screen.findByText("Trámite TRA-000007")).toBeInTheDocument();
    expect(screen.getByText(/LF-0001-2026/)).toBeInTheDocument();
    expect(await screen.findByText(/Versión 1 · PLT-01 v1/)).toBeInTheDocument();
    expect(screen.getByText(/SHA-256 PDF b{64}/)).toBeInTheDocument();
    expect(screen.getByText("cliente@empresa-ficticia.example")).toBeInTheDocument();
  });

  it("uploads the signed PDF while the case waits for a signature", async () => {
    vi.mocked(subirDocumentoFirmado).mockResolvedValue({ ...DOCUMENTO, estado: "firmado" });
    const user = userEvent.setup();
    renderDetalle();
    const pdf = new File(["%PDF-1.7"], "firmado.pdf", { type: "application/pdf" });

    await user.upload(await screen.findByLabelText("PDF firmado"), pdf);
    await user.click(screen.getByRole("button", { name: "Subir PDF firmado" }));

    expect(subirDocumentoFirmado).toHaveBeenCalledWith(7, DOCUMENTO.id, pdf);
  });

  it("hides the upload without the permission", async () => {
    vi.mocked(getSesion).mockResolvedValue({
      ...CON_PERMISOS,
      permisos: ["tramites.view_tramite", "documentos.view_documento"],
    });
    renderDetalle();

    await screen.findByText(/Versión 1/);
    expect(screen.queryByRole("button", { name: "Subir PDF firmado" })).not.toBeInTheDocument();
  });

  it("lets the executive retry a document once the data is complete", async () => {
    vi.mocked(obtenerTramiteBackoffice).mockResolvedValue({
      ...TRAMITE_BACKOFFICE,
      motivo: { codigo: "falta_informacion", nombre: "Falta información", texto_cliente: "" },
      detalle_pendiente: "Falta el reverso de la cédula del autorizante (JPG o PNG).",
    });
    vi.mocked(regenerarDocumento).mockResolvedValue(TRAMITE_BACKOFFICE);
    const user = userEvent.setup();
    renderDetalle();

    expect(await screen.findByText(/Falta el reverso de la cédula/)).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Generar el documento de nuevo" }));
    expect(regenerarDocumento).toHaveBeenCalledWith(7);
  });

  describe("a case started in the backoffice", () => {
    const crearUrl = URL.createObjectURL;
    const revocarUrl = URL.revokeObjectURL;

    afterEach(() => {
      URL.createObjectURL = crearUrl;
      URL.revokeObjectURL = revocarUrl;
    });

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => "blob:borrador");
      URL.revokeObjectURL = vi.fn();
      vi.mocked(obtenerTramiteBackoffice).mockResolvedValue(TRAMITE_BODEGA);
      vi.mocked(descargarDocumentoBackoffice).mockResolvedValue({
        blob: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
        nombreArchivo: "LF-0002-2026-v1.pdf",
      });
    });

    it("lists every contract line with its property", async () => {
      renderEn("/backoffice/tramites/8", [{ path: "/backoffice/tramites/:tramiteId", element: <DetalleTramite /> }]);

      expect(await screen.findByText(/Bodega · \$20\.000 mensual · Bodega de Ejemplo Costa/)).toBeInTheDocument();
      expect(screen.getByText(/Domicilio tributario · \$59\.990 anual · La Florida/)).toBeInTheDocument();
    });

    it("previews the draft and records the client's confirmation", async () => {
      vi.mocked(confirmarTramiteBackoffice).mockResolvedValue({
        ...TRAMITE_BODEGA,
        motivo: { codigo: "firma", nombre: "Firma", texto_cliente: "" },
      });
      const user = userEvent.setup();
      renderEn("/backoffice/tramites/8", [{ path: "/backoffice/tramites/:tramiteId", element: <DetalleTramite /> }]);

      expect(await screen.findByTitle("Borrador del contrato")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Editar datos" })).toHaveAttribute(
        "href",
        "/backoffice/tramites/8/editar",
      );
      await user.click(screen.getByRole("button", { name: "El cliente confirmó el borrador" }));

      expect(confirmarTramiteBackoffice).toHaveBeenCalledWith(8);
    });

    it("lets the executive set a new start date once it passed", async () => {
      vi.mocked(obtenerTramiteBackoffice).mockResolvedValue({
        ...TRAMITE_BODEGA,
        motivo: { codigo: "falta_informacion", nombre: "Falta información", texto_cliente: "" },
        detalle_pendiente: "La fecha de inicio ya pasó: elige una nueva para emitir el contrato.",
      });
      vi.mocked(obtenerFormularioTramite).mockResolvedValue(FORMULARIO_BODEGA);
      vi.mocked(cambiarFechaInicioBackoffice).mockResolvedValue(TRAMITE_BODEGA);
      const user = userEvent.setup();
      renderEn("/backoffice/tramites/8", [{ path: "/backoffice/tramites/:tramiteId", element: <DetalleTramite /> }]);

      const fecha = await screen.findByLabelText("Nueva fecha de inicio");
      expect(screen.queryByRole("button", { name: "Generar el documento de nuevo" })).not.toBeInTheDocument();
      await user.type(fecha, "2026-10-25");
      await user.click(screen.getByRole("button", { name: "Guardar fecha" }));

      expect(cambiarFechaInicioBackoffice).toHaveBeenCalledWith(8, "2026-10-25");
    });
  });
});
