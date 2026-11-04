import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ApiError } from "../../../api/client";
import type { AlertaVencimiento } from "../../../types/contratos";
import { erroresDeCampo } from "../../tramites/errores";
import { useGestionarAlerta } from "./useAlertas";

const LARGO_MAXIMO_NOTA = 1000;

interface DialogoGestionarProps {
  alerta: AlertaVencimiento;
  alCerrar: () => void;
  alYaGestionada: () => void;
}

export function DialogoGestionar({ alerta, alCerrar, alYaGestionada }: DialogoGestionarProps) {
  const [nota, setNota] = useState("");
  const gestionar = useGestionarAlerta();

  const enviar = () =>
    gestionar.mutate(
      { id: alerta.id, nota },
      {
        onSuccess: alCerrar,
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) alYaGestionada();
        },
      },
    );

  const errorNota = erroresDeCampo(gestionar.error).find(([campo]) => campo === "nota")?.[1];
  const errorGeneral = gestionar.error && !errorNota;

  return (
    <Dialog open onClose={alCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Marcar como gestionada</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          {alerta.folio} · {alerta.cliente.nombre}
        </Typography>
        {errorGeneral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            No pudimos guardar la gestión. Intenta nuevamente.
          </Alert>
        )}
        <TextField
          label="Nota (opcional)"
          multiline
          minRows={3}
          fullWidth
          value={nota}
          onChange={(event) => setNota(event.target.value)}
          error={Boolean(errorNota)}
          helperText={
            errorNota ??
            "Queda en el registro de auditoría y no se puede borrar: no escribas datos sensibles."
          }
          slotProps={{ htmlInput: { maxLength: LARGO_MAXIMO_NOTA } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={alCerrar}>Cancelar</Button>
        <Button variant="contained" onClick={enviar} disabled={gestionar.isPending}>
          Marcar como gestionada
        </Button>
      </DialogActions>
    </Dialog>
  );
}
