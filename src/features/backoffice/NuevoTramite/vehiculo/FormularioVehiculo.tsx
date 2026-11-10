import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, type FieldPath, FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { crearTramiteBackoffice, editarTramiteBackoffice } from "../../../../api/tramites";
import { DesgloseVenta } from "../../../../components/DesgloseVenta";
import { PageHeading } from "../../../../components/PageHeading";
import { SectionHeading } from "../../../../components/SectionHeading";
import { codigoDeConflicto, erroresDeCampo } from "../../../tramites/errores";
import { BloquePersona } from "../../../tramites/formulario/BloquePersona";
import { CampoTexto, Grilla } from "../../../tramites/formulario/campos";
import { SeccionesContratante } from "../../../tramites/formulario/SeccionesContratante";
import type { FormularioPropioProps } from "../formularios";
import {
  aSolicitudVehiculo,
  crearVehiculoSchema,
  type VehiculoEntrada,
  type VehiculoForm,
  valoresIniciales,
} from "./schema";

const Campo = CampoTexto<VehiculoEntrada>;

/**
 * The vehicle lease (PLT-03): a person leases their own vehicle to their
 * company, the client. Easy Office is not a party; the owner and the
 * company's representative sign. Confirming the draft charges the client
 * the price shown, which they pay in the portal.
 */
export function FormularioVehiculo({ formulario, tramite, tipo, clienteId, onCambiarCliente }: FormularioPropioProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const schema = useMemo(() => crearVehiculoSchema(formulario.fecha_min), [formulario.fecha_min]);
  const form = useForm<VehiculoEntrada, unknown, VehiculoForm>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: valoresIniciales(formulario, tramite),
  });
  const { control, handleSubmit, setError } = form;
  const medioPago = useWatch({ control, name: "medio_pago" });

  const enviar = useMutation({
    mutationFn: (datos: VehiculoForm) => {
      const solicitud = aSolicitudVehiculo(datos);
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
        setError(ruta as FieldPath<VehiculoEntrada>, { message: mensaje });
      }
    },
  });
  const conflicto = codigoDeConflicto(enviar.error);
  const sinCampo = erroresDeCampo(enviar.error).filter(([ruta]) => ["tipo", "cliente", "non_field_errors"].includes(ruta));

  return (
    <Box sx={{ maxWidth: 820, mx: "auto" }}>
      <PageHeading
        titulo={tramite ? `Editar trámite ${tramite.folio}` : "Arriendo de vehículo"}
        bajada="El dueño del vehículo lo arrienda a su empresa. Firman el dueño y el representante legal; Easy Office no es parte del contrato."
      />

      <FormProvider {...form}>
        <Paper component="form" noValidate onSubmit={handleSubmit((datos) => enviar.mutate(datos))} sx={{ p: 4 }}>
          <SeccionesContratante
            sinContacto
            hoy={formulario.fecha_min}
            ayudaRut="El RUT del cliente elegido. No se puede cambiar."
            ayudaRepresentante="Quien firma por la empresa, la arrendataria."
          />
          <Grilla>
            <Campo
              nombre="representante.email"
              etiqueta="Correo del representante"
              type="email"
              helperText="Para la firma electrónica avanzada: ahí llega su enlace."
            />
            <Campo
              nombre="domicilio_empresa"
              etiqueta="Domicilio de la empresa"
              placeholder="Calle, número, oficina"
              helperText="Como debe leerse en el contrato."
            />
          </Grilla>

          <SectionHeading texto="Arrendador (dueño del vehículo)" />
          <BloquePersona<VehiculoEntrada>
            nombre="arrendador"
            etiqueta="Arrendador"
            copiarDe={{ etiqueta: "El dueño es el representante legal", origen: "representante" }}
          />

          <SectionHeading texto="Vehículo" />
          <Grilla>
            <Campo nombre="vehiculo.marca" etiqueta="Marca" />
            <Campo nombre="vehiculo.modelo" etiqueta="Modelo" />
            <Campo nombre="vehiculo.anio" etiqueta="Año" inputMode="numeric" />
            <Campo nombre="vehiculo.color" etiqueta="Color" />
            <Campo nombre="vehiculo.patente" etiqueta="Patente" placeholder="BBDF12" helperText="Sin puntos ni guiones." />
            <Campo nombre="vehiculo.vin" etiqueta="VIN o número de chasis" />
          </Grilla>

          <SectionHeading texto="Condiciones del arriendo" />
          <Grilla>
            <Campo
              nombre="plazo_meses"
              etiqueta="Plazo (meses)"
              inputMode="numeric"
              helperText="El término se calcula: inicio más el plazo, menos un día."
            />
            <Campo
              nombre="fecha_inicio"
              etiqueta="Inicio del arriendo"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Campo
              nombre="renta"
              etiqueta="Renta mensual"
              inputMode="numeric"
              helperText="En pesos, sin puntos. El contrato la escribe también en palabras."
              slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
            />
            <Campo
              nombre="dia_pago"
              etiqueta="Se paga dentro de los primeros (días)"
              inputMode="numeric"
              helperText="De cada mes."
            />
            <Controller
              control={control}
              name="medio_pago"
              render={({ field, fieldState }) => (
                <TextField
                  select
                  label="Medio de pago"
                  size="small"
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? " "}
                >
                  <MenuItem value="transferencia">Transferencia bancaria</MenuItem>
                  <MenuItem value="otro">Otro medio</MenuItem>
                </TextField>
              )}
            />
            {medioPago === "otro" && (
              <Campo nombre="medio_pago_otro" etiqueta="¿Cuál?" helperText="Como debe leerse: «mediante …»." />
            )}
          </Grilla>

          <SectionHeading texto="Lugar y fecha del contrato" />
          <Grilla>
            <Campo nombre="comuna" etiqueta="Comuna" helperText="Donde se firma y donde las partes fijan domicilio." />
            <Campo
              nombre="fecha"
              etiqueta="Fecha del documento"
              type="date"
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: formulario.fecha_min } }}
            />
          </Grilla>

          {formulario.precio && (
            <>
              <SectionHeading texto="Valor del servicio" />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {formulario.precio.servicio}. Al confirmar el borrador se crea el cobro, que el cliente paga en su
                portal.{formulario.precio.precio_confirmado ? "" : " Valor referencial, por confirmar."}
              </Typography>
              <Box sx={{ maxWidth: 320 }}>
                <DesgloseVenta {...formulario.precio} />
              </Box>
            </>
          )}

          {sinCampo.map(([ruta, mensaje]) => (
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
          {enviar.isError && erroresDeCampo(enviar.error).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Revisa los campos marcados.
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
