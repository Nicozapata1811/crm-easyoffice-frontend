import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { tokens } from "../../../theme";
import { CLIENTE_DEMO } from "../datosDemo";
import { domicilioSchema, type DomicilioForm } from "./schema";

/**
 * ASSUMPTION: pending validation with Easy Office. The comunas listed, and the
 * fields this form collects, come from the prototype. Nothing is submitted:
 * the backend exposes no trámite endpoint yet.
 */
const COMUNAS = ["San Bernardo", "Santiago", "Puente Alto", "La Florida"];

export function FormularioDomicilio() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<DomicilioForm>({
    resolver: zodResolver(domicilioSchema),
    mode: "onBlur",
    defaultValues: {
      rutEmpresa: CLIENTE_DEMO.rut,
      razonSocial: CLIENTE_DEMO.nombre,
      representanteLegal: CLIENTE_DEMO.representante,
      direccion: "",
      comuna: COMUNAS[0],
      rolDeAvaluo: "",
    },
  });

  const rutValido = touchedFields.rutEmpresa && !errors.rutEmpresa;

  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <PageHeading
        titulo="Domicilio tributario"
        bajada="Completa los datos de la empresa y del nuevo domicilio. Validamos el RUT y el rol de avalúo antes de generar el documento."
      />

      <Paper
        component="form"
        onSubmit={handleSubmit(() => navigate("/tramites/domicilio-tributario/documento"))}
        sx={{ p: 4 }}
      >
        <SectionHeading texto="Datos de la empresa" primera />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <TextField
            label="RUT empresa"
            size="small"
            {...register("rutEmpresa")}
            error={Boolean(errors.rutEmpresa)}
            helperText={errors.rutEmpresa?.message ?? (rutValido ? "✓ RUT válido" : " ")}
            sx={rutValido ? campoValido : undefined}
          />
          <TextField label="Razón social" size="small" {...register("razonSocial")} helperText=" " />
          <TextField
            label="Representante legal"
            size="small"
            sx={{ gridColumn: { sm: "1 / -1" } }}
            {...register("representanteLegal")}
            helperText="Desde el registro de la empresa"
          />
        </Box>

        <SectionHeading texto="Nuevo domicilio tributario" />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <TextField
            label="Dirección"
            size="small"
            placeholder="Calle, número, oficina"
            sx={{ gridColumn: { sm: "1 / -1" } }}
            {...register("direccion")}
            error={Boolean(errors.direccion)}
            helperText={errors.direccion?.message ?? " "}
          />
          <TextField label="Comuna" size="small" select defaultValue={COMUNAS[0]} {...register("comuna")} helperText=" ">
            {COMUNAS.map((comuna) => (
              <MenuItem key={comuna} value={comuna}>
                {comuna}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Rol de avalúo"
            size="small"
            placeholder="0000-00"
            {...register("rolDeAvaluo")}
            error={Boolean(errors.rolDeAvaluo)}
            helperText={errors.rolDeAvaluo?.message ?? "Formato esperado: 0000-00"}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Button variant="outlined" onClick={() => navigate("/")}>
            ← Volver al catálogo
          </Button>
          <Button type="submit" variant="contained">
            Generar vista previa
          </Button>
        </Box>
      </Paper>

      <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 2 }}>
        La validación del RUT comprueba su dígito verificador. No se consulta ningún registro público.
      </Typography>
    </Box>
  );
}

const campoValido = {
  "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.success },
  "& .MuiFormHelperText-root": { color: tokens.success },
};
