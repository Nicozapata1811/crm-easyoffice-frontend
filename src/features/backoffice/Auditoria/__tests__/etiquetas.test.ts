/** All data here is synthetic. */

import { describe, expect, it } from "vitest";

import { etiquetaEntidad, OPCIONES_ENTIDAD } from "../entidades";
import {
  etiquetaAccion,
  etiquetaOrigen,
  etiquetaUsuario,
  OPCIONES_ACCION,
  OPCIONES_ORIGEN,
} from "../etiquetas";
import { DEL_SISTEMA, INGRESO_FALLIDO, MODIFICACION } from "./fixtures";

describe("audit labels", () => {
  it("has a Spanish label for every action", () => {
    const etiquetas = {
      crear: "Creación",
      modificar: "Modificación",
      eliminar: "Eliminación",
      inicio_sesion: "Inicio de sesión",
      cierre_sesion: "Cierre de sesión",
      inicio_sesion_fallido: "Inicio de sesión fallido",
      descarga_documento: "Descarga de documento",
      acceso_documento_identidad: "Acceso a documento de identidad",
      reenvio_firma: "Reenvío del enlace de firma",
      cancelacion_firma: "Cancelación de la firma",
      reintento_firma: "Reintento de la firma",
    };

    for (const [accion, etiqueta] of Object.entries(etiquetas)) {
      expect(etiquetaAccion(accion)).toBe(etiqueta);
    }
    expect(OPCIONES_ACCION).toHaveLength(Object.keys(etiquetas).length);
  });

  it("has a Spanish label for every channel", () => {
    const etiquetas = {
      api: "Backoffice",
      portal: "Portal del cliente",
      admin: "Panel de administración",
      sistema: "Sistema",
    };

    for (const [origen, etiqueta] of Object.entries(etiquetas)) {
      expect(etiquetaOrigen(origen)).toBe(etiqueta);
    }
    expect(OPCIONES_ORIGEN).toHaveLength(Object.keys(etiquetas).length);
  });

  it("shows a value the backend adds later rather than a blank", () => {
    expect(etiquetaAccion("accion_nueva")).toBe("accion_nueva");
    expect(etiquetaOrigen("origen_nuevo")).toBe("origen_nuevo");
  });

  it("names the user, or the system when there is none", () => {
    expect(etiquetaUsuario(MODIFICACION)).toBe("Administración Demo");
    expect(etiquetaUsuario(DEL_SISTEMA)).toBe("Sistema");
  });

  it("does not blame the system for a failed sign-in", () => {
    expect(etiquetaUsuario(INGRESO_FALLIDO)).toBe("Sin identificar");
  });

  it("uses its own name for an entity and falls back to the API's", () => {
    expect(etiquetaEntidad("users.user", "user")).toBe("Usuario");
    expect(etiquetaEntidad("app.nueva", "entidad nueva")).toBe("Entidad nueva");
    expect(etiquetaEntidad("", "")).toBe("—");
    expect(OPCIONES_ENTIDAD.map(({ valor }) => valor)).toContain("tramites.tramite");
  });
});
