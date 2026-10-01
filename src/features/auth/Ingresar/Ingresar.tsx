import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { ApiError } from "../../../api/client";
import { PageHeading } from "../../../components/PageHeading";
import { useLogin, useSesion } from "../useSesion";

const ingresoSchema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type IngresoForm = z.infer<typeof ingresoSchema>;

const DESTINO_POR_DEFECTO = "/backoffice";

/** Only same-origin paths, so ?siguiente= cannot send the user elsewhere. */
function destinoSeguro(siguiente: string | null): string {
  if (siguiente?.startsWith("/") && !siguiente.startsWith("//")) return siguiente;
  return DESTINO_POR_DEFECTO;
}

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    return "Correo o contraseña incorrectos.";
  }
  return "No pudimos conectar con el servidor. Intenta nuevamente.";
}

export function Ingresar() {
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get("siguiente"));
  const { data: usuario } = useSesion();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IngresoForm>({ resolver: zodResolver(ingresoSchema) });

  if (usuario) return <Navigate to={destino} replace />;

  const ingresar = handleSubmit((credenciales) => login.mutate(credenciales));

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}
    >
      <Paper sx={{ p: { xs: 3, sm: 5 }, width: "100%", maxWidth: 420 }}>
        <PageHeading
          titulo="Ingreso del personal"
          bajada="Usa tu correo y contraseña de Easy Office."
        />
        <Stack component="form" spacing={2} onSubmit={ingresar} noValidate>
          {login.isError && <Alert severity="error">{mensajeDeError(login.error)}</Alert>}
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="username"
            autoFocus
            error={Boolean(errors.email)}
            helperText={errors.email?.message ?? " "}
            {...register("email")}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message ?? " "}
            {...register("password")}
          />
          <Button type="submit" variant="contained" disabled={login.isPending}>
            {login.isPending ? "Ingresando…" : "Ingresar"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
