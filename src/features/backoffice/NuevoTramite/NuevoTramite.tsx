import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, type FieldPath, FormProvider, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { listarClientes } from "../../../api/clientes";
import {
  crearTramiteBackoffice,
  editarTramiteBackoffice,
  obtenerFormularioTramite,
  obtenerTramiteBackoffice,
} from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import type { FormularioTramite, TramiteBackoffice } from "../../../types/tramites";
import { codigoDeConflicto, erroresDeCampo } from "../../tramites/errores";
import { CampoTexto, Grilla, Opcion } from "../../tramites/formulario/campos";
import { SeccionesContratante } from "../../tramites/formulario/SeccionesContratante";
import {
  aSolicitudTramite,
  crearTramiteSchema,
  ROLES,
  rolesDe,
  type TramiteEntrada,
  type TramiteForm,
  valoresIniciales,
} from "./schema";

/**
 * An executive starts a case for a client (PLT-02, sold only in the
 * backoffice): first the company, then the form the case type's
 * configuration describes. With a :tramiteId it edits a request not yet
 * signed; the document is generated again.
 */
export function NuevoTramite() {
  const { tipo, tramiteId } = useParams();
  const id = tramiteId ? Number(tramiteId) : undefined;
  const [clienteId, setClienteId] = useState<number | undefined>();
  const tramite = useQuery({
    queryKey: ["tramites", id],
    queryFn: ({ signal }) => obtenerTramiteBackoffice(id as number, signal),
    enabled: id !== undefined,
  });

  if (id !== undefined) {
    if (tramite.isPending) return <Cargando />;
    if (tramite.isError) return <Alert severity="error">No encontramos este trámite.</Alert>;
    if (!tramite.data.editable) {
      return (
        <Alert severity="info">
          Este trámite ya no se puede editar.{" "}
          <RouterLink to={`/backoffice/tramites/${id}`}>Volver al trámite</RouterLink>
        </Alert>
      );
    }
    return <Formulario tipo={tramite.data.tipo_codigo} clienteId={tramite.data.cliente.id} tramite={tramite.data} />;
  }
  if (clienteId === undefined) return <ElegirCliente onElegir={setClienteId} />;
  return <Formulario tipo={tipo!} clienteId={clienteId} onCambiarCliente={() => setClienteId(undefined)} />;
}

function Cargando() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress aria-label="Cargando el formulario" />
    </Box>
  );
}

/** Search a company client by name, RUT or code. */
function ElegirCliente({ onElegir }: { onElegir: (id: number) => void }) {
  const [buscar, setBuscar] = useState("");
  const clientes = useQuery({
    queryKey: ["clientes", "empresas", buscar.trim()],
    queryFn: ({ signal }) => listarClientes({ buscar: buscar.trim(), tipo: "empresa" }, signal),
    placeholderData: keepPreviousData,
  });

  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <PageHeading titulo="Nuevo trámite" bajada="Elige la empresa para la que inicias el trámite." />
      <Paper sx={{ p: 3 }}>
        <TextField
          label="Buscar empresa"
          type="search"
          size="small"
          fullWidth
          value={buscar}
          onChange={(event) => setBuscar(event.target.value)}
          placeholder="Razón social, RUT o código"
        />
        {clientes.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            No pudimos cargar los clientes.
          </Alert>
        )}
        <List aria-label="Empresas">
          {clientes.data?.results.map((cliente) => (
            <ListItemButton key={cliente.id} onClick={() => onElegir(cliente.id)}>
              <ListItemText primary={cliente.nombre} secondary={`RUT ${cliente.rut}`} />
            </ListItemButton>
          ))}
        </List>
        {clientes.data?.results.length === 0 && (
          <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
            Ninguna empresa coincide. Regístrala primero en Clientes.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

function Formulario({
  tipo,
  clienteId,
  tramite,
  onCambiarCliente,
}: {
  tipo: string;
  clienteId: number;
  tramite?: TramiteBackoffice;
  onCambiarCliente?: () => void;
}) {
  const formulario = useQuery({
    queryKey: ["tramites", "formulario", tipo, clienteId],
    queryFn: ({ signal }) => obtenerFormularioTramite(tipo, clienteId, signal),
  });

  if (formulario.isPending) return <Cargando />;
  if (formulario.isError) {
    return <Alert severity="error">No pudimos cargar el formulario. Recarga la página o intenta más tarde.</Alert>;
  }
  if (!formulario.data.disponible || !formulario.data.datos) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <PageHeading titulo="Nuevo trámite" />
        <Alert severity="warning" sx={{ whiteSpace: "pre-line" }}>
          <strong>Este trámite no se puede iniciar todavía.</strong>
          {formulario.data.problemas.map((problema) => `\n• ${problema}`).join("")}
          {"\n"}Completa los datos que faltan en el panel de administración.
        </Alert>
        {onCambiarCliente && (
          <Button sx={{ mt: 2 }} onClick={onCambiarCliente}>
            ← Elegir otra empresa
          </Button>
        )}
      </Box>
    );
  }
  return <Contenido formulario={formulario.data} tramite={tramite} onCambiarCliente={onCambiarCliente} clienteId={clienteId} tipo={tipo} />;
}

function Contenido({
  formulario,
  tramite,
  tipo,
  clienteId,
  onCambiarCliente,
}: {
  formulario: FormularioTramite;
  tramite?: TramiteBackoffice;
  tipo: string;
  clienteId: number;
  onCambiarCliente?: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schema = useMemo(() => crearTramiteSchema(formulario), [formulario]);
  const form = useForm<TramiteEntrada, unknown, TramiteForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: valoresIniciales(formulario, tramite),
  });
  const { control, handleSubmit, setError } = form;
  const roles = rolesDe(formulario);

  const enviar = useMutation({
    mutationFn: (datos: TramiteForm) => {
      const solicitud = aSolicitudTramite(datos, formulario);
      return tramite
        ? editarTramiteBackoffice(tramite.id, solicitud)
        : crearTramiteBackoffice({ ...solicitud, tipo, cliente: clienteId });
    },
    onSuccess: (guardado) => {
      queryClient.setQueryData(["tramites", guardado.id], guardado);
      void queryClient.invalidateQueries({ queryKey: ["tramites", "lista"] });
      navigate(`/backoffice/tramites/${guardado.id}`);
    },
    onError: (error) => {
      for (const [ruta, mensaje] of erroresDeCampo(error)) {
        // The API names a property by its role at the top level.
        const campo = roles.includes(ruta) ? `inmuebles.${ruta}` : ruta;
        setError(campo as FieldPath<TramiteEntrada>, { message: mensaje });
      }
    },
  });
  const camposDelFormulario = new Set(["fecha_inicio", "duracion_meses", "email_aviso", "movil_aviso", ...roles]);
  const erroresGenerales = erroresDeCampo(enviar.error).filter(
    ([ruta]) => !camposDelFormulario.has(ruta) && !/^(empresa|representante|personeria)\./.test(ruta),
  );
  const conflicto = codigoDeConflicto(enviar.error);

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <PageHeading
        titulo={tramite ? `Editar trámite ${tramite.folio}` : "Nuevo trámite"}
        bajada="Completa los datos de la empresa y de su representante legal, y elige dónde se ubican los servicios. El sistema revisa cada dato antes de generar el contrato."
      />

      <FormProvider {...form}>
        <Paper
          component="form"
          noValidate
          onSubmit={handleSubmit((datos) => enviar.mutate(datos))}
          sx={{ p: 4 }}
        >
          <SeccionesContratante
            hoy={formulario.fecha_min}
            ayudaRut="El RUT del cliente elegido. No se puede cambiar."
            ayudaRepresentante="Quien firma por la empresa. Si ya está en el registro de la empresa, sus datos aparecen aquí."
          />

          <SectionHeading texto="Contratación" />
          {roles.map((rol) => (
            <Controller
              key={rol}
              control={control}
              name={`inmuebles.${rol}`}
              render={({ field, fieldState }) => (
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, mb: 1 }} id={`etiqueta-${rol}`}>
                    {ROLES[rol]?.titulo ?? rol}
                  </Typography>
                  <RadioGroup aria-labelledby={`etiqueta-${rol}`} {...field}>
                    {(formulario.inmuebles[rol] ?? []).map((inmueble) => (
                      <Opcion
                        key={inmueble.id}
                        value={String(inmueble.id)}
                        deshabilitada={Boolean(tramite) && rol === "sucursal" && String(inmueble.id) !== field.value}
                        titulo={inmueble.nombre}
                        detalle={`${inmueble.direccion} · ${inmueble.region}`}
                      />
                    ))}
                  </RadioGroup>
                  <FormHelperText error={Boolean(fieldState.error)}>
                    {fieldState.error?.message ??
                      (tramite && rol === "sucursal"
                        ? "La sucursal encabeza el folio: no se puede cambiar."
                        : ROLES[rol]?.ayuda)}
                  </FormHelperText>
                </Box>
              )}
            />
          ))}

          <SectionHeading texto="Servicios" />
          {formulario.lineas.map((linea, indice) => (
            <Box key={linea.servicio} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{linea.nombre}</Typography>
              <Grilla>
                <Controller
                  control={control}
                  name={`lineas.${indice}.ciclo_pago`}
                  render={({ field, fieldState }) => (
                    <TextField
                      select
                      label="Ciclo de pago"
                      size="small"
                      {...field}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message ?? " "}
                    >
                      {formulario.ciclos_pago.map((ciclo) => (
                        <MenuItem key={ciclo.codigo} value={ciclo.codigo}>
                          {ciclo.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                {linea.precio_base === null ? (
                  <CampoTexto<TramiteEntrada>
                    nombre={`lineas.${indice}.precio`}
                    etiqueta="Precio acordado"
                    inputMode="numeric"
                    helperText="Por confirmar: el servicio no tiene precio de lista."
                    slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
                  />
                ) : (
                  <Typography sx={{ fontSize: 13, color: tokens.inkSoft, alignSelf: "center" }}>
                    Precio de lista {formatearPesos(Number(linea.precio_base))}
                    {linea.precio_confirmado ? "" : " (referencial)"}
                  </Typography>
                )}
              </Grilla>
            </Box>
          ))}

          <Grilla>
            <Controller
              control={control}
              name="duracion_meses"
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Duración"
                  size="small"
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? "Se renueva automáticamente por igual período."}
                >
                  {formulario.duraciones.map((meses) => (
                    <MenuItem key={meses} value={String(meses)}>
                      {meses} {meses === 1 ? "mes" : "meses"}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <CampoTexto<TramiteEntrada>
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

          {erroresGenerales.map(([ruta, mensaje]) => (
            <Alert key={ruta} severity="error" sx={{ mt: 2 }}>
              {mensaje}
            </Alert>
          ))}
          {conflicto && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {conflicto === "no_disponible"
                ? "Este trámite no se puede iniciar todavía: faltan datos en el panel de administración."
                : "Este trámite ya no se puede cambiar."}
            </Alert>
          )}
          {enviar.isError && !conflicto && erroresDeCampo(enviar.error).length === 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              No pudimos guardar el trámite. Intenta nuevamente.
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => (tramite ? navigate(`/backoffice/tramites/${tramite.id}`) : onCambiarCliente?.())}
            >
              {tramite ? "← Volver al trámite" : "← Elegir otra empresa"}
            </Button>
            <Button type="submit" variant="contained" disabled={enviar.isPending}>
              {enviar.isPending ? "Enviando…" : "Generar el borrador del contrato"}
            </Button>
          </Box>
        </Paper>
      </FormProvider>
    </Box>
  );
}
