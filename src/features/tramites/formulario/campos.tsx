import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";


/** Two columns from the small breakpoint on, as the request forms lay out. */
export function Grilla({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 2.5, rowGap: 1 }}>
      {children}
    </Box>
  );
}

/** One radio choice drawn as a card: a branch, a warehouse, a plan. */
export function Opcion({
  value,
  titulo,
  detalle,
  deshabilitada = false,
}: {
  value: string;
  titulo: string;
  detalle: string;
  deshabilitada?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 0.75, mb: 1, opacity: deshabilitada ? 0.55 : 1 }}>
      <FormControlLabel
        value={value}
        disabled={deshabilitada}
        control={<Radio size="small" />}
        label={
          <Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{titulo}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{detalle}</Typography>
          </Box>
        }
        sx={{ width: "100%", m: 0 }}
      />
    </Paper>
  );
}

/**
 * A text field of the surrounding form (FormProvider), showing its error.
 * ``helperText`` replaces the blank line only while the field is valid.
 */
export function CampoTexto<T extends FieldValues>({
  nombre,
  etiqueta,
  helperText,
  ...extra
}: { nombre: Path<T>; etiqueta: string } & Omit<TextFieldProps, "name" | "label">) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = nombre.split(".").reduce<unknown>(
    (nodo, clave) => (nodo as Record<string, unknown> | undefined)?.[clave],
    errors,
  ) as { message?: string } | undefined;
  return (
    <TextField
      label={etiqueta}
      size="small"
      {...register(nombre)}
      error={Boolean(error)}
      helperText={error?.message ?? helperText ?? " "}
      {...extra}
    />
  );
}
