/**
 * Coloured pill for a trámite's state.
 *
 * ASSUMPTION: pending validation with Easy Office. The states are not defined,
 * so the tone is chosen per record rather than mapped from a fixed vocabulary.
 */

import Box from "@mui/material/Box";

import { tokens } from "../theme";

export type TonoEstado = "progreso" | "completo" | "espera";

const TONOS: Record<TonoEstado, { bgcolor: string; color: string }> = {
  progreso: { bgcolor: tokens.goldTint, color: tokens.gold },
  completo: { bgcolor: tokens.primaryTint, color: tokens.primary },
  espera: { bgcolor: tokens.stampTint, color: tokens.stamp },
};

export function EstadoPill({ etiqueta, tono }: { etiqueta: string; tono: TonoEstado }) {
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
        ...TONOS[tono],
      }}
    >
      {etiqueta}
    </Box>
  );
}
