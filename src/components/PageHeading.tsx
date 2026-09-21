/** Page title with its supporting line. */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { tokens } from "../theme";

interface PageHeadingProps {
  titulo: string;
  bajada?: string;
}

export function PageHeading({ titulo, bajada }: PageHeadingProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h1" sx={{ mb: 0.75 }}>
        {titulo}
      </Typography>
      {bajada && (
        <Typography sx={{ color: tokens.inkSoft, fontSize: 14.5 }}>{bajada}</Typography>
      )}
    </Box>
  );
}
