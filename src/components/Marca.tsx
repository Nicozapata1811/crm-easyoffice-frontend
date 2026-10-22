/**
 * The Easy Office mark, shared by both shells: the "eo" symbol and the name.
 *
 * The symbol (`public/marca/isotipo.png`) is cut from the logo the team
 * provided; at header height the logo's own lettering would be unreadable,
 * so the name is set as text beside it.
 *
 * ASSUMPTION: pending validation with Easy Office. The logo came as a small
 * bitmap; ask for the official vector file (TA-06) and swap it in here.
 */

import Box from "@mui/material/Box";

export function Marca({ contexto }: { contexto?: string }) {
  return (
    <Box
      component="span"
      sx={{ display: "flex", alignItems: "center", gap: 1.125, fontWeight: 700, fontSize: 18, color: "text.primary" }}
    >
      {/* Decorative: the name next to it already says "Easy Office". */}
      <Box component="img" src="/marca/isotipo.png" alt="" sx={{ height: 28, width: "auto", display: "block" }} />
      Easy Office
      {contexto && (
        <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
          · {contexto}
        </Box>
      )}
    </Box>
  );
}
