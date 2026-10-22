import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import type { Descarga } from "../../api/client";
import { useArchivo } from "./useArchivo";

/**
 * A protected PDF shown inline: fetched with the session (useArchivo) while
 * a spinner shows, or an error that points to the Word download.
 */
export function VisorPdf({
  clave,
  obtener,
  habilitado,
  titulo,
  error,
}: {
  clave: unknown[];
  obtener: () => Promise<Descarga>;
  habilitado: boolean;
  /** The iframe's accessible title; the spinner says "Cargando el …" with it. */
  titulo: string;
  error: string;
}) {
  const pdf = useArchivo(clave, obtener, habilitado);
  if (pdf.url) {
    return (
      <Box component="iframe" title={titulo} src={pdf.url} sx={{ width: "100%", height: "75vh", border: 0 }} />
    );
  }
  if (pdf.isError) return <Alert severity="error">{error}</Alert>;
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress aria-label="Cargando el borrador" />
    </Box>
  );
}
