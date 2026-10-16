import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Descarga } from "../../api/client";

/**
 * Fetch a protected file (the session cookie travels with the request) and
 * expose it as an object URL an <iframe> can show. The URL is revoked when the
 * file changes or the component goes away.
 */
export function useArchivo(clave: unknown[], obtener: () => Promise<Descarga>, habilitado: boolean) {
  const archivo = useQuery({
    queryKey: ["archivo", ...clave],
    queryFn: obtener,
    enabled: habilitado,
    staleTime: Infinity,
  });
  const url = useMemo(
    () => (archivo.data ? URL.createObjectURL(archivo.data.blob) : null),
    [archivo.data],
  );
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return { ...archivo, url };
}
