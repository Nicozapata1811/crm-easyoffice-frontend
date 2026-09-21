/**
 * Step indicator across the trámite flow.
 *
 * ASSUMPTION: pending validation with Easy Office. These five steps come from
 * the prototype, not from a validated state machine. The real trámite states
 * and their transitions are still undefined.
 */

import Box from "@mui/material/Box";

import { tokens } from "../theme";

const PASOS = [
  "Catálogo",
  "Formulario",
  "Vista previa",
  "Confirmación y pago",
  "Firma",
] as const;

interface FolioNavProps {
  /** 1-based index of the current step. */
  pasoActual: number;
}

export function FolioNav({ pasoActual }: FolioNavProps) {
  return (
    <Box
      component="nav"
      sx={{
        bgcolor: tokens.primaryDark,
        display: "flex",
        px: { xs: 2, md: 4 },
        overflowX: "auto",
      }}
    >
      {PASOS.map((paso, index) => {
        const numero = index + 1;
        const done = numero < pasoActual;
        const current = numero === pasoActual;

        return (
          <Box
            key={paso}
            sx={{
              px: 2.5,
              pt: 1.625,
              pb: 1.375,
              fontSize: 12.5,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: "2px solid",
              borderBottomColor: current ? tokens.gold : "transparent",
              color: current ? "#fff" : done ? "#CFE0D5" : "#8FA398",
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "1px solid",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10.5,
                fontFamily: tokens.serif,
                bgcolor: done ? tokens.gold : "transparent",
                borderColor: done ? tokens.gold : current ? "#fff" : "#567362",
                color: done ? "#3A2E0C" : current ? "#fff" : "inherit",
              }}
            >
              {done ? "✓" : numero}
            </Box>
            {paso}
          </Box>
        );
      })}
    </Box>
  );
}
