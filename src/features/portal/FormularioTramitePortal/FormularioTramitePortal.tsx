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
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { crearTramitePortal, editarTramitePortal, obtenerFormularioPortal } from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import type { FormularioPortal, Tramite } from "../../../types/tramites";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { CampoTexto, Grilla } from "../../tramites/formulario/campos";
import { ROLES, rolesDe } from "../../tramites/formulario/roles";
import { SeccionesContratante } from "../../tramites/formulario/SeccionesContratante";
import { SelectorInmueble, SelectorPlan } from "../../tramites/formulario/selectores";
import {
  aSolicitudPortal,
  crearSolicitudSchema,
  type SolicitudEntrada,
  type SolicitudForm,
  valoresIniciales,
} from "./schema";

/**
 * The portal form of a case type sold online by plan (the bodega, PLT-02),
 * built from what `GET /api/portal/tramites/formulario/` offers: the same
 * contracting-party sections as the domicile, the plan, one property per
 * role and the start date. With `tramite` it edits a request not yet paid.
 */
export function FormularioTramitePortal({ tipo, tramite }: { tipo: string; tramite?: Tramite }) {
  const formulario = useQuery({
    queryKey: ["portal", "tramites", "formulario", tipo],
    queryFn: ({ signal }) => obtenerFormularioPortal(tipo, signal),
  });

  if (formulario.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress aria-label="Cargando el formulario" />
      </Box>
    );
  }
  if (formulario.isError) {
    return <Alert severity="error">No pudimos cargar el formulario. Recarga la página o intenta más tarde.</Alert>;
  }
  if (!formulario.data.disponible || !formulario.data.datos) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo={formulario.data.nombre} />
        <Alert severity="info">{formulario.data.motivo_no_disponible}</Alert>
      </Box>
    );
  }
  if (tramite && !tramite.editable) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo={formulario.data.nombre} />
        <Alert severity="info">
          Esta solicitud ya no se puede editar.{" "}
          <RouterLink to={`/tramites/${tramite.id}`}>Ver el estado del trámite</RouterLink>
        </Alert>
      </Box>
    );
  }
  return <Contenido tipo={tipo} formulario={formulario.data} tramite={tramite} />;
}

function Contenido({ tipo, formulario, tramite }: { tipo: string; formulario: FormularioPortal; tramite?: Tramite }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schema = useMemo(() => crearSolicitudSchema(formulario), [formulario]);
  const form = useForm<SolicitudEntrada, unknown, SolicitudForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: valoresIniciales(formulario, tramite),
  });
  const roles = rolesDe(formulario.inmuebles);

  const enviar = useMutation({
    mutationFn: (datos: SolicitudForm) =>
      tramite
        ? editarTramitePortal(tramite.id, aSolicitudPortal(datos))
        : crearTramitePortal(tipo, aSolicitudPortal(datos)),
    onSuccess: (guardado) => {
      queryClient.setQueryData(["portal", "tramites", guardado.id], guardado);
      void queryClient.invalidateQueries({ queryKey: ["portal", "tramites"] });
      navigate(`/tramites/${guardado.id}/documento`);
    },
    onError: (error) => {
      for (const [ruta, mensaje] of erroresDeCampo(error)) {
        // The API names a property by its role at the top level.
        const campo = roles.includes(ruta) ? `inmuebles.${ruta}` : ruta;
        form.setError(campo as FieldPath<SolicitudEntrada>, { message: mensaje });
      }
    },
  });
  const conflicto = codigoDeConflicto(enviar.error);
  const otroError = enviar.isError && erroresDeCampo(enviar.error).length === 0 && !conflicto;

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <PageHeading
        titulo={tramite ? `Editar solicitud: ${formulario.nombre}` : formulario.nombre}
        bajada="Completa los datos de tu empresa y de su representante legal, elige el plan y dónde quedan tus servicios. Revisamos cada dato antes de generar el contrato."
      />

      <FormProvider {...form}>
        <Paper
          component="form"
          noValidate
          onSubmit={form.handleSubmit((datos) => enviar.mutate(datos))}
          sx={{ p: 4 }}
        >
          <SeccionesContratante
            hoy={formulario.fecha_min}
            ayudaRut="El RUT de tu cuenta. No se puede cambiar."
            ayudaRepresentante="Quien firma por la empresa. Si ya está en el registro de tu empresa, sus datos aparecen aquí."
          />

          <SectionHeading texto="Contratación" />
          {roles.map((rol) => (
            <SelectorInmueble<SolicitudEntrada>
              key={rol}
              nombre={`inmuebles.${rol}`}
              id={rol}
              titulo={ROLES[rol]?.titulo ?? rol}
              opciones={formulario.inmuebles[rol]}
              bloqueado={Boolean(tramite) && rol === "sucursal"}
              ayuda={
                tramite && rol === "sucursal"
                  ? "La sucursal no se puede cambiar en una solicitud ya creada."
                  : ROLES[rol]?.ayudaCliente
              }
            />
          ))}
          <SelectorPlan<SolicitudEntrada> planes={formulario.planes} />
          <Grilla>
            <CampoTexto<SolicitudEntrada>
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
            <Button variant="outlined" onClick={() => navigate(tramite ? `/tramites/${tramite.id}/documento` : "/")}>
              {tramite ? "← Volver al borrador" : "← Volver al catálogo"}
            </Button>
            <Button type="submit" variant="contained" disabled={enviar.isPending}>
              {enviar.isPending ? "Enviando…" : "Generar el borrador del contrato"}
            </Button>
          </Box>
        </Paper>
      </FormProvider>

      <Typography sx={{ fontSize: 11.5, color: "text.hint", mt: 2 }}>
        La validación del RUT comprueba su dígito verificador. No se consulta ningún registro público.
      </Typography>
    </Box>
  );
}
