import { type ReactNode, useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, type FieldPath, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import {
  crearDomicilio,
  editarDomicilio,
  obtenerFormularioDomicilio,
  obtenerTramite,
} from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { formatearPesos } from "../../../lib/formato";
import { REGIONES } from "../../../lib/regiones";
import { tokens } from "../../../theme";
import type { FormularioDomicilio as Formulario, Tramite } from "../../../types/tramites";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { aSolicitud, crearDomicilioSchema, type DomicilioEntrada, type DomicilioForm } from "./schema";

/**
 * The tax domicile form (HU-24): the fields of PLT-01 the client supplies.
 * Pre-filled only from the client's own records; Easy Office's branch is
 * chosen, never typed. With a :tramiteId it edits a request not yet paid.
 */
export function FormularioDomicilio() {
  const { tramiteId } = useParams();
  const id = tramiteId ? Number(tramiteId) : undefined;
  const formulario = useQuery({
    queryKey: ["portal", "tramites", "formulario-domicilio"],
    queryFn: ({ signal }) => obtenerFormularioDomicilio(signal),
  });
  const tramite = useQuery({
    queryKey: ["portal", "tramites", id],
    queryFn: ({ signal }) => obtenerTramite(id as number, signal),
    enabled: id !== undefined,
  });

  if (formulario.isPending || (id !== undefined && tramite.isPending)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando el formulario" />
      </Box>
    );
  }
  if (formulario.isError || tramite.isError) {
    return <Alert severity="error">No pudimos cargar el formulario. Recarga la página o intenta más tarde.</Alert>;
  }
  if (!formulario.data.disponible || !formulario.data.datos) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo="Domicilio tributario" />
        <Alert severity="info">{formulario.data.motivo_no_disponible}</Alert>
      </Box>
    );
  }
  if (tramite.data && !tramite.data.editable) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo="Domicilio tributario" />
        <Alert severity="info">
          Esta solicitud ya no se puede editar.{" "}
          <RouterLink to={`/tramites/${tramite.data.id}`}>Ver el estado del trámite</RouterLink>
        </Alert>
      </Box>
    );
  }
  return <Contenido formulario={formulario.data} tramite={tramite.data} />;
}

function valoresIniciales(formulario: Formulario, tramite?: Tramite): DomicilioEntrada {
  const datos = formulario.datos!;
  const contrato = tramite?.contrato;
  return {
    empresa: { ...datos.empresa },
    representante: { ...datos.representante },
    personeria: {
      fecha_instrumento: datos.personeria.fecha_instrumento ?? "",
      sitio_o_notaria: datos.personeria.sitio_o_notaria,
    },
    email_aviso: contrato?.email_aviso ?? datos.contacto.email_aviso,
    movil_aviso: contrato?.movil_aviso ?? datos.contacto.movil_aviso,
    plan: tramite?.datos.plan ?? (formulario.planes.length === 1 ? formulario.planes[0].codigo : ""),
    sucursal: tramite?.datos.sucursal
      ? String(tramite.datos.sucursal)
      : formulario.sucursales.length === 1
        ? String(formulario.sucursales[0].id)
        : "",
    fecha_inicio: tramite?.datos.fecha_inicio ?? formulario.fecha_min,
  };
}

function Contenido({ formulario, tramite }: { formulario: Formulario; tramite?: Tramite }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () => crearDomicilioSchema({ fechaMin: formulario.fecha_min, fechaMax: formulario.fecha_max }),
    [formulario.fecha_min, formulario.fecha_max],
  );
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields },
  } = useForm<DomicilioEntrada, unknown, DomicilioForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: valoresIniciales(formulario, tramite),
  });

  const enviar = useMutation({
    mutationFn: (form: DomicilioForm) =>
      tramite ? editarDomicilio(tramite.id, aSolicitud(form)) : crearDomicilio(aSolicitud(form)),
    onSuccess: (guardado) => {
      queryClient.setQueryData(["portal", "tramites", guardado.id], guardado);
      void queryClient.invalidateQueries({ queryKey: ["portal", "tramites"] });
      navigate(`/tramites/${guardado.id}/documento`);
    },
    onError: (error) => {
      for (const [ruta, mensaje] of erroresDeCampo(error)) {
        setError(ruta as FieldPath<DomicilioEntrada>, { message: mensaje });
      }
    },
  });

  const conflicto = codigoDeConflicto(enviar.error);
  const otroError = enviar.isError && erroresDeCampo(enviar.error).length === 0 && !conflicto;
  const rutRepresentante = touchedFields.representante?.rut && !errors.representante?.rut;

  const texto = (nombre: FieldPath<DomicilioEntrada>, etiqueta: string, extra: object = {}) => {
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
        helperText={error?.message ?? " "}
        {...extra}
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <PageHeading
        titulo={tramite ? "Editar solicitud de domicilio tributario" : "Domicilio tributario"}
        bajada="Completa los datos de tu empresa y de su representante legal, y elige la sucursal de Easy Office donde quedará tu domicilio. Revisamos cada dato antes de generar el contrato."
      />

      <Paper component="form" noValidate onSubmit={handleSubmit((form) => enviar.mutate(form))} sx={{ p: 4 }}>
        <SectionHeading texto="Datos de la empresa" primera />
        <Grilla>
          {texto("empresa.rut", "RUT de la empresa", {
            slotProps: { htmlInput: { readOnly: true } },
            helperText: errors.empresa?.rut?.message ?? "El RUT de tu cuenta. No se puede cambiar.",
          })}
          {texto("empresa.razon_social", "Razón social")}
          {texto("empresa.giro", "Giro principal", { sx: { gridColumn: { sm: "1 / -1" } } })}
        </Grilla>

        <SectionHeading texto="Representante legal" />
        <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft, mb: 2 }}>
          Quien firma por la empresa. Si ya está en el registro de tu empresa, sus datos aparecen aquí.
        </Typography>
        <Grilla>
          {texto("representante.nombres", "Nombres")}
          {texto("representante.apellido_paterno", "Apellido paterno")}
          {texto("representante.apellido_materno", "Apellido materno")}
          {texto("representante.rut", "RUT del representante", {
            helperText:
              errors.representante?.rut?.message ?? (rutRepresentante ? "✓ Dígito verificador correcto" : " "),
            sx: rutRepresentante ? campoValido : undefined,
          })}
          {texto("representante.domicilio", "Domicilio particular", {
            placeholder: "Calle, número, depto.",
            sx: { gridColumn: { sm: "1 / -1" } },
          })}
          {texto("representante.comuna", "Comuna")}
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
          {texto("personeria.fecha_instrumento", "Fecha de la escritura o estatuto actualizado", {
            type: "date",
            slotProps: { inputLabel: { shrink: true }, htmlInput: { max: formulario.fecha_min } },
          })}
          {texto("personeria.sitio_o_notaria", "Sitio o notaría", {
            placeholder: "www.tuempresaenundia.cl o Notaría …",
          })}
        </Grilla>

        <SectionHeading texto="Contacto para notificaciones" />
        <Grilla>
          {texto("email_aviso", "Correo electrónico", { type: "email" })}
          {texto("movil_aviso", "Celular", {
            inputMode: "numeric",
            slotProps: { input: { startAdornment: <InputAdornment position="start">+56</InputAdornment> } },
          })}
        </Grilla>

        <SectionHeading texto="Contratación" />
        <Controller
          control={control}
          name="sucursal"
          render={({ field, fieldState }) => (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 1 }} id="etiqueta-sucursal">
                Sucursal de Easy Office
              </Typography>
              <RadioGroup aria-labelledby="etiqueta-sucursal" {...field}>
                {formulario.sucursales.map((sucursal) => (
                  <Opcion
                    key={sucursal.id}
                    value={String(sucursal.id)}
                    deshabilitada={Boolean(tramite) && String(sucursal.id) !== field.value}
                    titulo={sucursal.nombre}
                    detalle={`${sucursal.direccion} · ${sucursal.region}`}
                  />
                ))}
              </RadioGroup>
              <FormHelperText error={Boolean(fieldState.error)}>
                {fieldState.error?.message ??
                  (tramite
                    ? "La sucursal no se puede cambiar en una solicitud ya creada."
                    : "Tu domicilio tributario queda en la dirección de la sucursal que elijas.")}
              </FormHelperText>
            </Box>
          )}
        />
        <Controller
          control={control}
          name="plan"
          render={({ field, fieldState }) => (
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 1 }} id="etiqueta-plan">
                Plan
              </Typography>
              <RadioGroup aria-labelledby="etiqueta-plan" {...field}>
                {formulario.planes.map((plan) => (
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
                {fieldState.error?.message ??
                  "Valores referenciales: Easy Office aún no confirma los precios."}
              </FormHelperText>
            </Box>
          )}
        />
        <Grilla>
          {texto("fecha_inicio", "Fecha de inicio del contrato", {
            type: "date",
            slotProps: {
              inputLabel: { shrink: true },
              htmlInput: { min: formulario.fecha_min, max: formulario.fecha_max },
            },
            helperText:
              errors.fecha_inicio?.message ?? "Desde hoy y hasta 30 días más. Es la fecha que lleva el contrato.",
          })}
        </Grilla>

        {conflicto && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {conflicto === "no_disponible"
              ? "El trámite en línea no está disponible por ahora. Escríbenos y te ayudamos a contratarlo."
              : "Esta solicitud ya no se puede cambiar."}
          </Alert>
        )}
        {otroError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            No pudimos enviar la solicitud. Intenta nuevamente.
          </Alert>
        )}
        {enviar.isError && erroresDeCampo(enviar.error).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Revisa los campos marcados.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(tramite ? `/tramites/${tramite.id}/documento` : "/")}
          >
            {tramite ? "← Volver al borrador" : "← Volver al catálogo"}
          </Button>
          <Button type="submit" variant="contained" disabled={enviar.isPending}>
            {enviar.isPending ? "Enviando…" : "Generar el borrador del contrato"}
          </Button>
        </Box>
      </Paper>

      <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 2 }}>
        La validación del RUT comprueba su dígito verificador. No se consulta ningún registro público.
      </Typography>
    </Box>
  );
}

function Grilla({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 2.5, rowGap: 1 }}>
      {children}
    </Box>
  );
}

function Opcion({
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
            <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft }}>{detalle}</Typography>
          </Box>
        }
        sx={{ width: "100%", m: 0 }}
      />
    </Paper>
  );
}

const campoValido = {
  "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.success },
  "& .MuiFormHelperText-root": { color: tokens.success },
};
