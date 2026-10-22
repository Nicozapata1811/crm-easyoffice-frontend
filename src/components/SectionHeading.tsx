/** Heading for a section inside a form panel. */

import Typography from "@mui/material/Typography";

export function SectionHeading({ texto, primera }: { texto: string; primera?: boolean }) {
  return (
    <Typography
      variant="h2"
      sx={{
        fontSize: 16,
        color: "text.primary",
        mb: 2.25,
        ...(primera ? {} : { mt: 1, pt: 3, borderTop: 1, borderColor: "divider" }),
      }}
    >
      {texto}
    </Typography>
  );
}
