/**
 * Coloured pill for a trámite's state. The label always says the state, so the
 * colour is never the only signal; every tone's text/background is ≥ 4.5:1.
 *
 * ASSUMPTION: pending validation with Easy Office. The states are not defined,
 * so the tone is chosen per record rather than mapped from a fixed vocabulary.
 */

import Box from "@mui/material/Box";

export type TonoEstado = "progreso" | "completo" | "espera" | "alerta" | "neutro";

/** The palette colour behind each tone; the pill uses its `soft` and `strong`. */
const COLOR_TONO: Record<TonoEstado, "info" | "success" | "warning" | "error" | "neutral"> = {
  progreso: "info",
  completo: "success",
  espera: "warning",
  alerta: "error",
  neutro: "neutral",
};

export function EstadoPill({ etiqueta, tono }: { etiqueta: string; tono: TonoEstado }) {
  const color = COLOR_TONO[tono];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        px: 1.375,
        py: 0.5,
        borderRadius: 20,
        whiteSpace: "nowrap",
        bgcolor: `${color}.soft`,
        color: `${color}.strong`,
      }}
    >
      {etiqueta}
    </Box>
  );
}
