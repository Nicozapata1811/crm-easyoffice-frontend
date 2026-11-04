/** Navigation links shared by both audience shells. */

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { NavLink } from "react-router-dom";

interface NavLinksProps {
  /** `insignia` is a count shown next to the label, and read out with it. */
  links: { to: string; label: string; end?: boolean; insignia?: { cantidad: number; que: string } }[];
}

export function NavLinks({ links }: NavLinksProps) {
  return (
    <Stack direction="row" spacing={0.5} component="nav">
      {links.map(({ to, label, end, insignia }) => (
        <Link
          key={to}
          component={NavLink}
          to={to}
          end={end}
          underline="none"
          aria-label={insignia ? `${label}, ${insignia.cantidad} ${insignia.que}` : undefined}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            fontSize: 14,
            color: "text.secondary",
            boxShadow: "inset 0 -2px 0 transparent",
            "&:hover": { color: "text.primary" },
            // NavLink marks the current section with aria-current="page".
            "&[aria-current='page']": {
              bgcolor: "primary.soft",
              color: "text.primary",
              fontWeight: 600,
              boxShadow: (theme) => `inset 0 -2px 0 ${theme.palette.primary.main}`,
            },
          }}
        >
          {label}
          {insignia && (
            <Box
              component="span"
              sx={{
                ml: 0.75,
                px: 0.75,
                py: 0.125,
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "error.soft",
                color: "error.strong",
              }}
            >
              {insignia.cantidad}
            </Box>
          )}
        </Link>
      ))}
    </Stack>
  );
}
