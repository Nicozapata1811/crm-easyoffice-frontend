import type { ReactNode } from "react";

import { SinAcceso } from "../components/SinAcceso";
import { tienePermiso, useSesion } from "../features/auth/useSesion";

interface RequirePermissionProps {
  permiso: string;
  children: ReactNode;
}

/** Must sit under RequireAuth, which has already loaded the session. */
export function RequirePermission({ permiso, children }: RequirePermissionProps) {
  const { data: usuario } = useSesion();

  if (!tienePermiso(usuario, permiso)) {
    return <SinAcceso />;
  }
  return children;
}
