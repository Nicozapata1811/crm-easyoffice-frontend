/** Navigation links shared by both audience shells. */

import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { NavLink } from "react-router-dom";

interface NavLinksProps {
  links: { to: string; label: string; end?: boolean }[];
}

export function NavLinks({ links }: NavLinksProps) {
  return (
    <Stack direction="row" spacing={2} component="nav">
      {links.map(({ to, label, end }) => (
        <Link
          key={to}
          component={NavLink}
          to={to}
          end={end}
          color="inherit"
          underline="hover"
        >
          {label}
        </Link>
      ))}
    </Stack>
  );
}
