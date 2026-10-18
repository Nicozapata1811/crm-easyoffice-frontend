import Alert from "@mui/material/Alert";

import type { TipoUsuario } from "../../types/sesion";

const NOMBRE_SESION: Record<TipoUsuario, string> = {
  staff: "del personal",
  cliente: "de cliente",
};

interface AvisoOtraSesionProps {
  tipoActivo: TipoUsuario;
  alContinuar: string;
}

export function AvisoOtraSesion({ tipoActivo, alContinuar }: AvisoOtraSesionProps) {
  return (
    <Alert severity="info">
      Tienes abierta una sesión {NOMBRE_SESION[tipoActivo]}. {alContinuar}, esa sesión se cerrará.
    </Alert>
  );
}
