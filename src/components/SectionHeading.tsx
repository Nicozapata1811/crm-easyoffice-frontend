/** Heading for a section inside a form panel. */

import Typography from "@mui/material/Typography";

import { tokens } from "../theme";

export function SectionHeading({ texto, primera }: { texto: string; primera?: boolean }) {
  return (
    <Typography
      variant="h2"
      sx={{
        fontSize: 16,
        color: tokens.primaryDark,
        mb: 2.25,
        ...(primera ? {} : { mt: 1, pt: 3, borderTop: `1px solid ${tokens.border}` }),
      }}
    >
      {texto}
    </Typography>
  );
}
