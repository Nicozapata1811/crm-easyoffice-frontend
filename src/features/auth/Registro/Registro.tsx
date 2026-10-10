import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { Navigate, Link as RouterLink, useSearchParams } from "react-router-dom";

import { ApiError } from "../../../api/client";
import { PageHeading } from "../../../components/PageHeading";
import { destinoSeguro } from "../destino";
import { useRegistro, useSesion } from "../useSesion";
import { aDatosRegistro, registroSchema, type RegistroForm } from "./schema";

const VALORES_INICIALES: RegistroForm = {
  tipo: "persona",
  rut: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  razon_social: "",
  email: "",
  password: "",
  confirmacion: "",
};

const CAMPOS_DEL_SERVIDOR: Path<RegistroForm>[] = [
  "rut",
  "nombres",
  "apellido_paterno",
  "razon_social",
  "email",
  "password",
];

export function Registro() {
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get("siguiente"), "/");
  const { data: usuario } = useSesion();
  const registro = useRegistro();
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: VALORES_INICIALES,
    mode: "onBlur",
  });
  const tipo = useWatch({ control, name: "tipo" });

  if (usuario) return <Navigate to={destino} replace />;

  const enviar = handleSubmit((datos) => {
    setErrorGeneral(undefined);
    registro.mutate(aDatosRegistro(datos), {
      onError: (error) => {
        if (!(error instanceof ApiError) || error.status !== 400) {
          setErrorGeneral("No pudimos conectar con el servidor. Intenta nuevamente.");
          return;
        }
        const detalle = (error.detail ?? {}) as Record<string, string | string[]>;
        for (const campo of CAMPOS_DEL_SERVIDOR) {
          const mensaje = detalle[campo];
          if (mensaje) setError(campo, { message: [mensaje].flat().join(" ") });
        }
        if (typeof detalle.detail === "string") setErrorGeneral(detalle.detail);
      },
    });
  });

  const campo = (nombre: Path<RegistroForm>, label: string, extra = {}) => (
    <TextField
      label={label}
      error={Boolean(errors[nombre])}
      helperText={errors[nombre]?.message ?? " "}
      {...extra}
      {...register(nombre)}
    />
  );

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: { xs: 3, sm: 5 }, width: "100%", maxWidth: 520 }}>
        <PageHeading
          titulo="Crea tu cuenta"
          bajada="Con tu cuenta puedes pagar tus trámites y revisar tus compras."
        />
        <Stack component="form" spacing={1.5} onSubmit={enviar} noValidate>
          {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <ToggleButtonGroup
                exclusive
                size="small"
                aria-label="Tipo de cuenta"
                value={field.value}
                onChange={(_, nuevo) => nuevo && field.onChange(nuevo)}
                sx={{ mb: 1.5 }}
              >
                <ToggleButton value="persona">Persona natural</ToggleButton>
                <ToggleButton value="empresa">Empresa</ToggleButton>
              </ToggleButtonGroup>
            )}
          />
          {campo("rut", tipo === "persona" ? "Tu RUT" : "RUT de la empresa", {
            placeholder: "12.345.678-5",
          })}
          {tipo === "persona" ? (
            <>
              {campo("nombres", "Nombres")}
              {campo("apellido_paterno", "Apellido paterno")}
              {campo("apellido_materno", "Apellido materno (opcional)")}
            </>
          ) : (
            campo("razon_social", "Razón social")
          )}
          {campo("email", "Correo electrónico", { type: "email", autoComplete: "email" })}
          {campo("password", "Contraseña", { type: "password", autoComplete: "new-password" })}
          {campo("confirmacion", "Repite la contraseña", {
            type: "password",
            autoComplete: "new-password",
          })}
          <Button type="submit" variant="contained" disabled={registro.isPending}>
            {registro.isPending ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
          <Typography sx={{ fontSize: 14, textAlign: "center" }}>
            ¿Ya tienes cuenta?{" "}
            <Link component={RouterLink} to={`/ingresar?${params.toString()}`}>
              Ingresa aquí
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
