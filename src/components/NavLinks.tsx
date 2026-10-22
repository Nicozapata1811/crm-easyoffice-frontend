/** Navigation links shared by both audience shells. */

import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { NavLink } from "react-router-dom";

interface NavLinksProps {
  links: { to: string; label: string; end?: boolean }[];
}

export function NavLinks({ links }: NavLinksProps) {
  return (
    <Stack direction="row" spacing={0.5} component="nav">
      {links.map(({ to, label, end }) => (
        <Link
          key={to}
          component={NavLink}
          to={to}
          end={end}
          underline="none"
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
        </Link>
      ))}
    </Stack>
  );
}
