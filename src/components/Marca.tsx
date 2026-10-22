/**
 * The Easy Office logo, shared by both shells (`public/marca/logo.svg`, the
 * file Easy Office provided). The backoffice adds its context beside it.
 *
 * ASSUMPTION: pending validation with Easy Office. The SVG wraps a bitmap;
 * replace it with a true vector file when one is available (TA-06).
 */

import Box from "@mui/material/Box";

export function Marca({ contexto }: { contexto?: string }) {
  return (
    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box component="img" src="/marca/logo.svg" alt="Easy Office" sx={{ height: 48, width: "auto", display: "block" }} />
      {contexto && (
        <Box component="span" sx={{ fontSize: 18, fontWeight: 500, color: "text.secondary" }}>
          {contexto}
        </Box>
      )}
    </Box>
  );
}
