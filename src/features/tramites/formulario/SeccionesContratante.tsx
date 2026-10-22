import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Controller, useFormContext } from "react-hook-form";

import { SectionHeading } from "../../../components/SectionHeading";
import { REGIONES } from "../../../lib/regiones";
import { tokens } from "../../../theme";
import { CampoTexto, Grilla } from "./campos";
import type { ContratanteEntrada } from "./schema";

const Campo = CampoTexto<ContratanteEntrada>;

const campoValido = {
  "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.success },
  "& .MuiFormHelperText-root": { color: tokens.success },
};

/**
 * The contracting party of a service contract (section A): company, legal
 * representative, personería and notice contact. Used inside a form whose
 * values include ContratanteEntrada (FormProvider).
 */
export function SeccionesContratante({
  hoy,
  ayudaRut,
  ayudaRepresentante,
}: {
  /** Today in the backend's calendar: the personería cannot be later. */
  hoy: string;
  /** Why the company RUT cannot be typed, said to whoever fills the form. */
  ayudaRut: string;
  ayudaRepresentante: string;
}) {
  const {
    control,
    formState: { errors, touchedFields },
  } = useFormContext<ContratanteEntrada>();
  const rutRepresentante = touchedFields.representante?.rut && !errors.representante?.rut;

  return (
    <>
      <SectionHeading texto="Datos de la empresa" primera />
      <Grilla>
        <Campo
          nombre="empresa.rut"
          etiqueta="RUT de la empresa"
          slotProps={{ htmlInput: { readOnly: true } }}
          helperText={ayudaRut}
        />
        <Campo nombre="empresa.razon_social" etiqueta="Razón social" />
        <Campo nombre="empresa.giro" etiqueta="Giro principal" sx={{ gridColumn: { sm: "1 / -1" } }} />
      </Grilla>

      <SectionHeading texto="Representante legal" />
      <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft, mb: 2 }}>{ayudaRepresentante}</Typography>
      <Grilla>
        <Campo nombre="representante.nombres" etiqueta="Nombres" />
        <Campo nombre="representante.apellido_paterno" etiqueta="Apellido paterno" />
        <Campo nombre="representante.apellido_materno" etiqueta="Apellido materno" />
        <Campo
          nombre="representante.rut"
          etiqueta="RUT del representante"
          helperText={rutRepresentante ? "✓ Dígito verificador correcto" : undefined}
          sx={rutRepresentante ? campoValido : undefined}
        />
        <Campo
          nombre="representante.domicilio"
          etiqueta="Domicilio particular"
          placeholder="Calle, número, depto."
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
        <Campo nombre="representante.comuna" etiqueta="Comuna" />
        <Controller
          control={control}
          name="representante.region"
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Región"
              size="small"
              {...field}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? " "}
            >
              {[...new Set([...REGIONES, field.value].filter(Boolean))].map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grilla>

      <SectionHeading texto="Personería del representante" />
      <Grilla>
        <Campo
          nombre="personeria.fecha_instrumento"
          etiqueta="Fecha de la escritura o estatuto actualizado"
          type="date"
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hoy } }}
        />
        <Campo
          nombre="personeria.sitio_o_notaria"
          etiqueta="Sitio o notaría"
          placeholder="www.tuempresaenundia.cl o Notaría …"
        />
      </Grilla>

      <SectionHeading texto="Contacto para notificaciones" />
      <Grilla>
        <Campo nombre="email_aviso" etiqueta="Correo electrónico" type="email" />
        <Campo
          nombre="movil_aviso"
          etiqueta="Celular"
          inputMode="numeric"
          slotProps={{ input: { startAdornment: <InputAdornment position="start">+56</InputAdornment> } }}
        />
      </Grilla>
    </>
  );
}
