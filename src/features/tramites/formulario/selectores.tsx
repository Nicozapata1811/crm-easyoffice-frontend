import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { Controller, type FieldValues, type Path, useFormContext } from "react-hook-form";

import { formatearPesos } from "../../../lib/formato";
import type { PlanDomicilio } from "../../../types/tramites";
import { Opcion } from "./campos";

/** One of the plans a service is sold in, drawn as cards (domicile, bodega). */
export function SelectorPlan<T extends FieldValues>({ planes }: { planes: PlanDomicilio[] }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={"plan" as Path<T>}
      render={({ field, fieldState }) => (
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 1 }} id="etiqueta-plan">
            Plan
          </Typography>
          <RadioGroup aria-labelledby="etiqueta-plan" {...field}>
            {planes.map((plan) => (
              <Opcion
                key={plan.codigo}
                value={plan.codigo}
                titulo={`${plan.nombre} · ${formatearPesos(Number(plan.precio))}`}
                detalle={`${plan.duracion_meses} meses, pago ${plan.ciclo_pago.toLowerCase()}. ${
                  plan.firma_incluida
                    ? "Incluye la firma electrónica avanzada del contrato."
                    : plan.precio_firma
                      ? `La firma electrónica avanzada se cobra aparte: ${formatearPesos(Number(plan.precio_firma))}.`
                      : "La firma electrónica avanzada se cobra aparte."
                }`}
              />
            ))}
          </RadioGroup>
          <FormHelperText error={Boolean(fieldState.error)}>
            {fieldState.error?.message ?? "Valores referenciales: Easy Office aún no confirma los precios."}
          </FormHelperText>
        </Box>
      )}
    />
  );
}

/** One property for a role (a branch, a warehouse), drawn as cards. */
export function SelectorInmueble<T extends FieldValues>({
  nombre,
  id,
  titulo,
  opciones,
  ayuda,
  bloqueado = false,
}: {
  nombre: Path<T>;
  /** Used for the label's id. */
  id: string;
  titulo: string;
  opciones: { id: number; nombre: string; direccion: string; region: string }[];
  ayuda?: string;
  /** Only the chosen one stays selectable (a request already created). */
  bloqueado?: boolean;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={nombre}
      render={({ field, fieldState }) => (
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 1 }} id={`etiqueta-${id}`}>
            {titulo}
          </Typography>
          <RadioGroup aria-labelledby={`etiqueta-${id}`} {...field}>
            {opciones.map((opcion) => (
              <Opcion
                key={opcion.id}
                value={String(opcion.id)}
                deshabilitada={bloqueado && String(opcion.id) !== field.value}
                titulo={opcion.nombre}
                detalle={`${opcion.direccion} · ${opcion.region}`}
              />
            ))}
          </RadioGroup>
          <FormHelperText error={Boolean(fieldState.error)}>{fieldState.error?.message ?? ayuda}</FormHelperText>
        </Box>
      )}
    />
  );
}
