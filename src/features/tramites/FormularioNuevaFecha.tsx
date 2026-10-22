import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";

import { erroresDeCampo } from "./errores";

/**
 * The start date passed before signing: a new one, between the limits the
 * backend gives. ``guardar`` sends it; ``alGuardar`` receives the case.
 */
export function FormularioNuevaFecha<T>({
  fechaMin,
  fechaMax,
  guardar,
  alGuardar,
}: {
  fechaMin?: string;
  fechaMax?: string;
  guardar: (fecha: string) => Promise<T>;
  alGuardar: (actualizado: T) => void;
}) {
  const [fecha, setFecha] = useState("");
  const cambiar = useMutation({ mutationFn: () => guardar(fecha), onSuccess: alGuardar });
  const errorFecha = erroresDeCampo(cambiar.error).find(([ruta]) => ruta === "fecha_inicio")?.[1];

  return (
    <Box
      component="form"
      sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 2, flexWrap: "wrap" }}
      onSubmit={(event) => {
        event.preventDefault();
        cambiar.mutate();
      }}
    >
      <TextField
        type="date"
        size="small"
        label="Nueva fecha de inicio"
        value={fecha}
        onChange={(event) => setFecha(event.target.value)}
        error={Boolean(errorFecha)}
        helperText={errorFecha ?? " "}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { min: fechaMin, max: fechaMax },
        }}
      />
      <Button type="submit" variant="contained" disabled={!fecha || cambiar.isPending}>
        Guardar fecha
      </Button>
      {cambiar.isError && !errorFecha && (
        <Alert severity="error" sx={{ width: "100%" }}>
          No pudimos guardar la fecha. Intenta nuevamente.
        </Alert>
      )}
    </Box>
  );
}
