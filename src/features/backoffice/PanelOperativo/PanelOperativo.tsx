import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { PageHeading } from "../../../components/PageHeading";
import { formatearEntero, formatearFecha, formatearPesos } from "../../../lib/formato";
import { dashboardService } from "./dashboardService";
import { IndicadorCard } from "./IndicadorCard";
import { PERIODOS, resolverPeriodo, type PeriodoId } from "./periodos";
import { VentasDesglose } from "./VentasDesglose";

export function PanelOperativo() {
  const [periodoId, setPeriodoId] = useState<PeriodoId>("mes-actual");
  const periodo = resolverPeriodo(periodoId);
  const { data, isPending, isError } = useQuery({
    queryKey: ["indicadores", periodo],
    queryFn: () => dashboardService.getIndicators(periodo),
    placeholderData: keepPreviousData,
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2 }}>
        <PageHeading
          titulo="Panel operativo"
          bajada={`${formatearFecha(periodo.desde)} – ${formatearFecha(periodo.hasta)}`}
        />
        <TextField
          select
          label="Período"
          size="small"
          value={periodoId}
          onChange={(event) => setPeriodoId(event.target.value as PeriodoId)}
          sx={{ minWidth: 200, alignSelf: "flex-start" }}
        >
          {PERIODOS.map(({ id, etiqueta }) => (
            <MenuItem key={id} value={id}>
              {etiqueta}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Datos de ejemplo: el panel aún no está conectado al sistema. Los montos son valores
        de ejemplo, no ventas reales.
      </Alert>

      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando indicadores" />
        </Box>
      )}
      {isError && (
        <Alert severity="error">No pudimos cargar los indicadores. Intenta nuevamente.</Alert>
      )}

      {data && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 2.5,
              mb: 3,
            }}
          >
            <IndicadorCard etiqueta="Total de clientes" valor={formatearEntero(data.clientes.total)} />
            <IndicadorCard
              etiqueta="Clientes nuevos"
              valor={formatearEntero(data.clientes.nuevos)}
              detalle="En el período"
            />
            <IndicadorCard
              etiqueta="Servicios activos"
              valor={formatearEntero(data.servicios.activos)}
            />
            <IndicadorCard
              etiqueta="Servicios por vencer"
              valor={formatearEntero(data.servicios.por_vencer)}
              detalle={`En los próximos ${data.servicios.dias_aviso} días`}
              tono="atencion"
            />
            <IndicadorCard
              etiqueta="Servicios vencidos"
              valor={formatearEntero(data.servicios.vencidos)}
            />
            <IndicadorCard
              etiqueta="Ventas totales"
              valor={formatearPesos(data.ventas.total)}
              detalle="Valor de ejemplo · en el período"
            />
            <IndicadorCard
              etiqueta="Trámites pendientes"
              valor={formatearEntero(data.tramites_pendientes)}
            />
            <IndicadorCard
              etiqueta="Documentos pendientes de firma"
              valor={formatearEntero(data.documentos_pendientes_firma)}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            <VentasDesglose
              titulo="Ventas por servicio"
              filas={data.ventas.por_servicio.map(({ servicio, ...venta }) => ({
                nombre: servicio,
                ...venta,
              }))}
            />
            <VentasDesglose
              titulo="Ventas por ejecutivo"
              filas={data.ventas.por_ejecutivo.map(({ ejecutivo, ...venta }) => ({
                nombre: ejecutivo,
                ...venta,
              }))}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
