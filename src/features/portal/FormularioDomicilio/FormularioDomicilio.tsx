import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FieldPath, FormProvider, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import {
  crearDomicilio,
  editarDomicilio,
  obtenerFormularioDomicilio,
  obtenerTramite,
} from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { tokens } from "../../../theme";
import type { FormularioDomicilio as Formulario, Tramite } from "../../../types/tramites";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { CampoTexto, Grilla } from "../../tramites/formulario/campos";
import { contratanteInicial } from "../../tramites/formulario/schema";
import { SeccionesContratante } from "../../tramites/formulario/SeccionesContratante";
import { SelectorInmueble, SelectorPlan } from "../../tramites/formulario/selectores";
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
    ...contratanteInicial(datos, contrato ?? undefined),
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
  const form = useForm<DomicilioEntrada, unknown, DomicilioForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: valoresIniciales(formulario, tramite),
  });
  const { handleSubmit, setError } = form;

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

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <PageHeading
        titulo={tramite ? "Editar solicitud de domicilio tributario" : "Domicilio tributario"}
        bajada="Completa los datos de tu empresa y de su representante legal, y elige la sucursal de Easy Office donde quedará tu domicilio. Revisamos cada dato antes de generar el contrato."
      />

      <FormProvider {...form}>
      <Paper component="form" noValidate onSubmit={handleSubmit((datos) => enviar.mutate(datos))} sx={{ p: 4 }}>
        <SeccionesContratante
          hoy={formulario.fecha_min}
          ayudaRut="El RUT de tu cuenta. No se puede cambiar."
          ayudaRepresentante="Quien firma por la empresa. Si ya está en el registro de tu empresa, sus datos aparecen aquí."
        />

        <SectionHeading texto="Contratación" />
        <SelectorInmueble<DomicilioEntrada>
          nombre="sucursal"
          id="sucursal"
          titulo="Sucursal de Easy Office"
          opciones={formulario.sucursales}
          bloqueado={Boolean(tramite)}
          ayuda={
            tramite
              ? "La sucursal no se puede cambiar en una solicitud ya creada."
              : "Tu domicilio tributario queda en la dirección de la sucursal que elijas."
          }
        />
        <SelectorPlan<DomicilioEntrada> planes={formulario.planes} />
        <Grilla>
          <CampoTexto<DomicilioEntrada>
            nombre="fecha_inicio"
            etiqueta="Fecha de inicio del contrato"
            type="date"
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: formulario.fecha_min, max: formulario.fecha_max },
            }}
            helperText="Desde hoy y hasta 30 días más. Es la fecha que lleva el contrato."
          />
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
      </FormProvider>

      <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 2 }}>
        La validación del RUT comprueba su dígito verificador. No se consulta ningún registro público.
      </Typography>
    </Box>
  );
}
