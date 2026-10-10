import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { KeyboardEvent } from "react";

import { tokens } from "../../../theme";
import type { MedioPago } from "../../../types/ventas";

interface SelectorMedioPagoProps {
  medios: MedioPago[];
  elegido: string;
  onElegir: (codigo: string) => void;
}

export function SelectorMedioPago({ medios, elegido, onElegir }: SelectorMedioPagoProps) {
  const moverCon = (event: KeyboardEvent, indice: number) => {
    const pasos: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onElegir(medios[indice].codigo);
    } else if (event.key in pasos) {
      event.preventDefault();
      onElegir(medios[(indice + pasos[event.key] + medios.length) % medios.length].codigo);
    }
  };

  return (
    <Box role="radiogroup" aria-label="Medio de pago" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {medios.map((medio, indice) => {
        const activo = medio.codigo === elegido;
        return (
          <Box
            key={medio.codigo}
            role="radio"
            aria-checked={activo}
            aria-label={`${medio.nombre}. ${medio.descripcion}`}
            tabIndex={activo ? 0 : -1}
            onClick={() => onElegir(medio.codigo)}
            onKeyDown={(event) => moverCon(event, indice)}
            sx={{
              border: "1px solid",
              borderColor: activo ? tokens.primary : tokens.borderStrong,
              bgcolor: activo ? tokens.primaryTint : "transparent",
              borderRadius: "3px",
              px: 2,
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{medio.nombre}</Typography>
              <Typography sx={{ fontSize: 11.8, color: tokens.inkSoft, mt: 0.25 }}>
                {medio.descripcion}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                flex: "none",
                border: "1.5px solid",
                borderColor: activo ? tokens.primary : tokens.borderStrong,
                background: activo ? `radial-gradient(circle, ${tokens.primary} 0 5px, transparent 6px)` : "none",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
