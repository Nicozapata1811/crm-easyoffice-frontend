import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { tokens } from "../../../theme";

const COLOR_DETALLE = { normal: tokens.inkFaint, atencion: tokens.gold };

interface IndicadorCardProps {
  etiqueta: string;
  valor: string;
  detalle?: string;
  tono?: keyof typeof COLOR_DETALLE;
  /** Small breakdown under the detail. */
  children?: ReactNode;
}

export function IndicadorCard({
  etiqueta,
  valor,
  detalle,
  tono = "normal",
  children,
}: IndicadorCardProps) {
  return (
    <Paper component="section" aria-label={etiqueta} sx={{ p: 3 }}>
      <Typography sx={{ fontSize: 13.5, color: tokens.inkSoft }}>{etiqueta}</Typography>
      <Typography
        sx={{ fontFamily: tokens.serif, fontWeight: 600, fontSize: 34, color: tokens.primaryDark, my: 0.5 }}
      >
        {valor}
      </Typography>
      {detalle && (
        <Typography sx={{ fontSize: 12.5, color: COLOR_DETALLE[tono] }}>{detalle}</Typography>
      )}
      {children}
    </Paper>
  );
}
