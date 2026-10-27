/** All data here is synthetic. */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSesion } from "../../../../api/auth";
import {
  cambiarFechaInicioBackoffice,
  cancelarFirma,
  confirmarTramiteBackoffice,
  descargarDocumentoBackoffice,
  listarDocumentosBackoffice,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
  reenviarEnlaceFirma,
  regenerarDocumento,
  subirDocumentoFirmado,
} from "../../../../api/tramites";
import {
  DOCUMENTO_BACKOFFICE,
  DOCUMENTO_FIRMA_AVANZADA,
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
  reenviarEnlaceFirma: vi.fn(),
  cancelarFirma: vi.fn(),
  reintentarFirma: vi.fn(),
}));

const CON_PERMISOS = {
  ...EJECUTIVO,
  permisos: [
    "tramites.view_tramite",
    "tramites.gestionar_tramite",
    "documentos.view_documento",
    "documentos.subir_documento_firmado",
    "documentos.gestionar_firma",
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
    vi.mocked(listarDocumentosBackoffice).mockResolvedValue([DOCUMENTO_BACKOFFICE]);
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
    vi.mocked(subirDocumentoFirmado).mockResolvedValue({ ...DOCUMENTO_BACKOFFICE, estado: "firmado" });
    const user = userEvent.setup();
    renderDetalle();
    const pdf = new File(["%PDF-1.7"], "firmado.pdf", { type: "application/pdf" });

    await user.upload(await screen.findByLabelText("PDF firmado"), pdf);
    await user.click(screen.getByRole("button", { name: "Subir PDF firmado" }));

    expect(subirDocumentoFirmado).toHaveBeenCalledWith(7, DOCUMENTO_BACKOFFICE.id, pdf);
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

  describe("advanced signature through the provider", () => {
    beforeEach(() => {
      vi.mocked(listarDocumentosBackoffice).mockResolvedValue([DOCUMENTO_FIRMA_AVANZADA]);
      vi.mocked(reenviarEnlaceFirma).mockResolvedValue(DOCUMENTO_FIRMA_AVANZADA);
      vi.mocked(cancelarFirma).mockResolvedValue(DOCUMENTO_FIRMA_AVANZADA);
    });

    it("lists each signer with their state and the request", async () => {
      renderDetalle();

      const tabla = await screen.findByRole("table", { name: "Firmantes de la versión 1" });
      const filas = within(tabla).getAllByRole("row").slice(1);
      expect(filas).toHaveLength(3);
      expect(within(filas[0]).getByText("Firmado")).toBeInTheDocument();
      expect(within(filas[1]).getByText(/Easy Office/)).toBeInTheDocument();
      expect(within(filas[1]).getByText("Pendiente")).toBeInTheDocument();
      expect(screen.getByText(/Solicitud 8f0e2c1a-0000-4000-8000-000000000001/)).toBeInTheDocument();
    });

    it("hides the assisted upload", async () => {
      renderDetalle();

      await screen.findByRole("table", { name: "Firmantes de la versión 1" });
      expect(screen.queryByLabelText("PDF firmado")).not.toBeInTheDocument();
    });

    it("resends a pending signer's link and cancels the request", async () => {
      const user = userEvent.setup();
      renderDetalle();

      const reenviar = await screen.findAllByRole("button", { name: "Reenviar enlace" });
      expect(reenviar).toHaveLength(2);
      await user.click(reenviar[0]);
      expect(reenviarEnlaceFirma).toHaveBeenCalledWith(7, DOCUMENTO_FIRMA_AVANZADA.id, 33);
      expect(await screen.findByText("Enviamos un enlace nuevo.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancelar firma" }));
      expect(cancelarFirma).toHaveBeenCalledWith(7, DOCUMENTO_FIRMA_AVANZADA.id);
    });

    it("offers no actions without the permission", async () => {
      vi.mocked(getSesion).mockResolvedValue({
        ...CON_PERMISOS,
        permisos: CON_PERMISOS.permisos.filter((p) => p !== "documentos.gestionar_firma"),
      });
      renderDetalle();

      await screen.findByRole("table", { name: "Firmantes de la versión 1" });
      expect(screen.queryByRole("button", { name: "Reenviar enlace" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Cancelar firma" })).not.toBeInTheDocument();
    });
  });
});
