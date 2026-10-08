import { useState, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  get,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
} from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { z } from "zod";

import { ApiError } from "../../../api/client";
import { PageHeading } from "../../../components/PageHeading";
import { normalizeRut } from "../../../lib/rut";
import type {
  DatosEmpresa,
  DatosPersona,
  FichaCliente,
  NuevoCliente,
  TipoCliente,
} from "../../../types/cliente";
import { empresaSchema, personaSchema } from "./schema";
import { useActualizarCliente, useCliente, useCrearCliente } from "./useClientes";

interface Campo<T extends FieldValues> {
  nombre: Path<T>;
  etiqueta: string;
  ayuda?: string;
}

const AYUDA_RUT = "Con o sin puntos, por ejemplo 12.345.678-5.";

const CAMPOS_PERSONA: Campo<DatosPersona>[] = [
  { nombre: "rut", etiqueta: "RUT", ayuda: AYUDA_RUT },
  { nombre: "nombres", etiqueta: "Nombres" },
  { nombre: "apellido_paterno", etiqueta: "Apellido paterno" },
  { nombre: "apellido_materno", etiqueta: "Apellido materno (opcional)" },
  { nombre: "email", etiqueta: "Correo (opcional)" },
  { nombre: "telefono", etiqueta: "Teléfono (opcional)" },
];

const CAMPOS_EMPRESA: Campo<DatosEmpresa>[] = [
  { nombre: "rut", etiqueta: "RUT", ayuda: AYUDA_RUT },
  { nombre: "razon_social", etiqueta: "Razón social" },
  { nombre: "nombre_fantasia", etiqueta: "Nombre de fantasía (opcional)" },
  { nombre: "giro", etiqueta: "Giro (opcional)" },
  { nombre: "email", etiqueta: "Correo (opcional)" },
  { nombre: "telefono", etiqueta: "Teléfono (opcional)" },
];

const PERSONA_VACIA: DatosPersona = {
  rut: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
};

const EMPRESA_VACIA: DatosEmpresa = {
  rut: "",
  razon_social: "",
  nombre_fantasia: "",
  giro: "",
  email: "",
  telefono: "",
};

interface ErrorServidor {
  rut?: string;
  general?: string;
}

/** Creates a client at /clientes/nuevo and edits one at /clientes/:clienteId/editar. */
export function FormularioCliente() {
  const { clienteId } = useParams();
  const { data: ficha, isPending, isError } = useCliente(Number(clienteId));

  if (clienteId === undefined) return <EditorCliente />;
  if (isError) {
    return (
      <Alert severity="error" sx={{ maxWidth: 720, mx: "auto" }}>
        No pudimos cargar el cliente. Intenta nuevamente.
      </Alert>
    );
  }
  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="Cargando cliente" />
      </Box>
    );
  }
  return <EditorCliente ficha={ficha} />;
}

function EditorCliente({ ficha }: { ficha?: FichaCliente }) {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoCliente>(ficha?.tipo ?? "persona");
  const [activo, setActivo] = useState(ficha?.activo ?? true);
  const crear = useCrearCliente();
  const actualizar = useActualizarCliente(ficha?.id ?? Number.NaN);
  const volver = () => navigate(ficha ? `/backoffice/clientes/${ficha.id}` : "/backoffice/clientes");

  const guardar = async (datos: DatosPersona | DatosEmpresa) => {
    const parte = { ...datos, rut: normalizeRut(datos.rut) };
    try {
      const guardada = ficha
        ? await actualizar.mutateAsync({ activo, [tipo]: parte })
        : await crear.mutateAsync({ tipo, [tipo]: parte } as NuevoCliente);
      navigate(`/backoffice/clientes/${guardada.id}`, { replace: true });
    } catch (error) {
      return errorDelServidor(error, tipo, Boolean(ficha));
    }
  };

  const comunes = {
    textoGuardar: ficha ? "Guardar cambios" : "Registrar cliente",
    onGuardar: guardar,
    onCancelar: volver,
    extra: ficha && (
      <FormControlLabel
        control={<Switch checked={activo} onChange={(event) => setActivo(event.target.checked)} />}
        label="Cliente activo"
      />
    ),
  };

  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <PageHeading
        titulo={ficha ? "Editar cliente" : "Nuevo cliente"}
        bajada={ficha ? ficha.folio : "Registra a una persona natural o a una empresa."}
      />
      <Paper sx={{ p: 4 }}>
        {!ficha && (
          <ToggleButtonGroup
            exclusive
            value={tipo}
            onChange={(_, nuevo: TipoCliente | null) => nuevo && setTipo(nuevo)}
            aria-label="Tipo de cliente"
            size="small"
            sx={{ mb: 3 }}
          >
            <ToggleButton value="persona">Persona natural</ToggleButton>
            <ToggleButton value="empresa">Empresa</ToggleButton>
          </ToggleButtonGroup>
        )}
        {tipo === "persona" ? (
          <DatosForm
            key="persona"
            schema={personaSchema}
            campos={CAMPOS_PERSONA}
            valoresIniciales={ficha?.persona ?? PERSONA_VACIA}
            {...comunes}
          />
        ) : (
          <DatosForm
            key="empresa"
            schema={empresaSchema}
            campos={CAMPOS_EMPRESA}
            valoresIniciales={ficha?.empresa ?? EMPRESA_VACIA}
            {...comunes}
          />
        )}
      </Paper>
    </Box>
  );
}

interface DatosFormProps<T extends FieldValues> {
  schema: z.ZodType<T, T>;
  campos: Campo<T>[];
  valoresIniciales: T;
  textoGuardar: string;
  onGuardar: (datos: T) => Promise<ErrorServidor | undefined>;
  onCancelar: () => void;
  extra?: ReactNode;
}

function DatosForm<T extends FieldValues>({
  schema,
  campos,
  valoresIniciales,
  textoGuardar,
  onGuardar,
  onCancelar,
  extra,
}: DatosFormProps<T>) {
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    defaultValues: valoresIniciales as DefaultValues<T>,
    mode: "onBlur",
  });

  const enviar = handleSubmit(async (datos) => {
    setErrorGeneral(undefined);
    const error = await onGuardar(datos);
    if (error?.rut) setError("rut" as Path<T>, { message: error.rut });
    setErrorGeneral(error?.general);
  });

  return (
    <Box component="form" noValidate onSubmit={enviar}>
      {errorGeneral && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorGeneral}
        </Alert>
      )}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
        {campos.map(({ nombre, etiqueta, ayuda }) => {
          const error: string | undefined = get(errors, nombre)?.message;
          return (
            <TextField
              key={nombre}
              label={etiqueta}
              {...register(nombre)}
              error={Boolean(error)}
              helperText={error ?? ayuda}
            />
          );
        })}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 3 }}>
        {extra}
        <Box sx={{ display: "flex", gap: 1.5, ml: "auto" }}>
          <Button onClick={onCancelar}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {textoGuardar}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function errorDelServidor(error: unknown, tipo: TipoCliente, editando: boolean): ErrorServidor {
  const errores = error instanceof ApiError && error.status === 400 ? error.detail : undefined;
  const delTipo = (errores as Record<string, unknown> | undefined)?.[tipo];
  if (typeof delTipo === "object" && delTipo !== null && "rut" in delTipo) {
    return {
      rut: editando ? "Este RUT ya pertenece a otro registro." : "Ya existe un cliente con este RUT.",
    };
  }
  return { general: "No pudimos guardar el cliente. Revisa los datos e intenta nuevamente." };
}
