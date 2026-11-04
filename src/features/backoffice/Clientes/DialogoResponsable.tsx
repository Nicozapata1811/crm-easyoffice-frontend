import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { Contrato } from "../../../types/contratos";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { useAsignarResponsable, useEjecutivos } from "./useContratos";

interface DialogoResponsableProps {
  contrato: Contrato;
  alCerrar: () => void;
}

function mensajeDeError(error: unknown): string | null {
  if (!error) return null;
  if (codigoDeConflicto(error)) return "Este contrato ya no admite cambios.";
  return erroresDeCampo(error)[0]?.[1] ?? "No pudimos guardar el cambio. Intenta nuevamente.";
}

export function DialogoResponsable({ contrato, alCerrar }: DialogoResponsableProps) {
  const [ejecutivo, setEjecutivo] = useState(String(contrato.ejecutivo_responsable ?? ""));
  const ejecutivos = useEjecutivos();
  const asignar = useAsignarResponsable();

  const opciones = ejecutivos.data ?? [];
  // Someone who no longer qualifies is not offered, and cannot stay selected.
  const valor = opciones.some(({ id }) => String(id) === ejecutivo) ? ejecutivo : "";
  const mensaje = mensajeDeError(asignar.error);

  return (
    <Dialog open onClose={alCerrar} fullWidth maxWidth="xs">
      <DialogTitle>Ejecutivo responsable · {contrato.folio}</DialogTitle>
      <DialogContent>
        {mensaje && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mensaje}
          </Alert>
        )}
        {ejecutivos.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No pudimos cargar los ejecutivos. Intenta nuevamente.
          </Alert>
        )}
        <TextField
          select
          label="Responsable"
          fullWidth
          value={valor}
          onChange={(event) => setEjecutivo(event.target.value)}
          disabled={ejecutivos.isPending}
          sx={{ mt: 1 }}
        >
          {opciones.map(({ id, nombre }) => (
            <MenuItem key={id} value={String(id)}>
              {nombre}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={alCerrar}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!valor || asignar.isPending}
          onClick={() =>
            asignar.mutate(
              { contratoId: contrato.id, ejecutivo: Number(valor) },
              { onSuccess: alCerrar },
            )
          }
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
