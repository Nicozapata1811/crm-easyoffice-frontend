/**
 * The Easy Office wordmark, shared by both shells. This is the logo slot.
 *
 * ASSUMPTION: pending validation with Easy Office. A text wordmark until the
 * official logo arrives (TA-06); then replace the monogram and the name here
 * with `<Box component="img" src="/marca/logo.svg" alt="Easy Office" />`.
 */

import Box from "@mui/material/Box";

export function Marca({ contexto }: { contexto?: string }) {
  return (
    <Box
      component="span"
      sx={{ display: "flex", alignItems: "center", gap: 1.125, fontWeight: 700, fontSize: 18, color: "text.primary" }}
    >
      <Box
        aria-hidden
        component="span"
        sx={{
          width: 26,
          height: 26,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11.5,
        }}
      >
        EO
      </Box>
      Easy Office
      {contexto && (
        <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
          · {contexto}
        </Box>
      )}
    </Box>
  );
}
