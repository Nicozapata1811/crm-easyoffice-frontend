import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/** Detail text colour per tone; the detail text always says what it means. */
const COLOR_DETALLE = { normal: "text.hint", atencion: "warning.strong", alerta: "error.strong" };

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
      <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>{etiqueta}</Typography>
      <Typography
        sx={{ fontWeight: 700, fontSize: 34, color: "text.primary", my: 0.5 }}
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
