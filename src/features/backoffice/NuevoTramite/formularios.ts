/**
 * The forms of the documents implemented directly, by template code. The
 * backend says which one a case type uses (``formulario``); a type without
 * one keeps the generic form. A new document adds its own entry.
 */

import type { ComponentType } from "react";

import type { FormularioTramite, TramiteBackoffice } from "../../../types/tramites";
import { FormularioVehiculo } from "./vehiculo/FormularioVehiculo";

export interface FormularioPropioProps {
  formulario: FormularioTramite;
  /** The case being edited, if any. */
  tramite?: TramiteBackoffice;
  tipo: string;
  clienteId: number;
  onCambiarCliente?: () => void;
}

export const FORMULARIOS: Record<string, ComponentType<FormularioPropioProps>> = {
  "PLT-03": FormularioVehiculo,
};
