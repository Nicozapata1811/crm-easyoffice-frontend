import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { useCatalogo } from "../../../api/catalogo";
import { parseDeepLinkParams } from "../../../lib/deepLinkParams";
import { tokens } from "../../../theme";
import { CLIENTE_DEMO, formatearPesos } from "../datosDemo";
import { domicilioConPlanSchema, type DomicilioConPlanForm } from "./schema";

/**
 * ASSUMPTION: pending validation with Easy Office. The comunas listed, and the
 * fields this form collects, come from the prototype. Nothing is submitted:
 * the backend exposes no trámite endpoint yet.
 */
const COMUNAS = ["San Bernardo", "Santiago", "Puente Alto", "La Florida"];

const SERVICIO = "domicilio-tributario";

export function FormularioDomicilio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catalogo = useCatalogo();
  const planes = catalogo.data?.servicios.find((s) => s.slug === SERVICIO)?.planes ?? [];
  const enlace = parseDeepLinkParams(searchParams, planes);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<DomicilioConPlanForm>({
    resolver: zodResolver(domicilioConPlanSchema),
    mode: "onBlur",
    defaultValues: {
      rutEmpresa: CLIENTE_DEMO.rut,
      razonSocial: CLIENTE_DEMO.nombre,
      representanteLegal: CLIENTE_DEMO.representante,
      direccion: "",
      comuna: COMUNAS[0],
      rolDeAvaluo: "",
      plan: "",
      // ASSUMPTION: pending validation with Easy Office. Travels with the form values
      // until the backend defines the request that creates the trámite.
      origen: enlace.origen.kind === "valid" ? enlace.origen.value : undefined,
    },
  });

  const planDelEnlace = enlace.plan.kind === "valid" ? enlace.plan.value.slug : undefined;
  useEffect(() => {
    if (planDelEnlace) setValue("plan", planDelEnlace);
  }, [planDelEnlace, setValue]);

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

        <SectionHeading texto="Plan" />
        {catalogo.isPending && (
          <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>Cargando planes…</Typography>
        )}
        {catalogo.isError && (
          <Typography sx={{ fontSize: 13, color: tokens.stamp }}>
            No pudimos cargar los planes. Recarga la página para intentarlo de nuevo.
          </Typography>
        )}
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} aria-label="Plan">
              {planes.map((plan) => (
                <FormControlLabel
                  key={plan.slug}
                  value={plan.slug}
                  control={<Radio size="small" />}
                  label={`${plan.nombre} · ${plan.meses} meses · ${formatearPesos(plan.precio)}${
                    plan.precioConfirmado ? "" : " (precio referencial)"
                  }`}
                />
              ))}
            </RadioGroup>
          )}
        />
        <FormHelperText error={Boolean(errors.plan)} sx={{ mb: 2 }}>
          {errors.plan?.message ?? " "}
        </FormHelperText>

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
