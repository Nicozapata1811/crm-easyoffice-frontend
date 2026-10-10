import { useState } from "react";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { PageHeading } from "../../../components/PageHeading";
import { formatearEntero, formatearFecha, formatearPesos } from "../../../lib/formato";
import { dashboardService } from "./dashboardService";
import { IndicadorCard } from "./IndicadorCard";
import { PERIODOS, resolverPeriodo, type PeriodoId } from "./periodos";
import { VentasDesglose } from "./VentasDesglose";

const VALOR_DE_EJEMPLO = "Valor de ejemplo";

export function PanelOperativo() {
  const [periodoId, setPeriodoId] = useState<PeriodoId>("mes-actual");
  const periodo = resolverPeriodo(periodoId);
  const { data, isPending, isError } = useQuery({
    queryKey: ["indicadores", periodo],
    queryFn: ({ signal }) => dashboardService.getIndicators(periodo, signal),
    placeholderData: keepPreviousData,
  });
  const exportar = useMutation({ mutationFn: () => dashboardService.exportIndicators(periodo) });

  const deEjemplo = new Set(data?.datos_de_ejemplo);
  const detalle = (clave: string, texto?: string) => {
    if (!deEjemplo.has(clave)) return texto;
    return texto ? `${VALOR_DE_EJEMPLO} · ${texto.toLowerCase()}` : VALOR_DE_EJEMPLO;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2 }}>
        <PageHeading
          titulo="Panel operativo"
          bajada={`${formatearFecha(periodo.desde)} – ${formatearFecha(periodo.hasta)}`}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignSelf: "flex-start" }}>
          <TextField
            select
            label="Período"
            size="small"
            value={periodoId}
            onChange={(event) => setPeriodoId(event.target.value as PeriodoId)}
            sx={{ minWidth: 200 }}
          >
            {PERIODOS.map(({ id, etiqueta }) => (
              <MenuItem key={id} value={id}>
                {etiqueta}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            onClick={() => exportar.mutate()}
            disabled={!data || exportar.isPending}
            startIcon={
              exportar.isPending ? <CircularProgress size={16} /> : <FileDownloadOutlined />
            }
          >
            Exportar a Excel
          </Button>
        </Box>
      </Box>

      {exportar.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => exportar.reset()}>
          No pudimos generar el archivo Excel. Intenta nuevamente.
        </Alert>
      )}
      {deEjemplo.size > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Los clientes son datos reales del sistema. Servicios, ventas, trámites y documentos
          todavía son valores de ejemplo, no cifras reales.
        </Alert>
      )}

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
            <IndicadorCard
              etiqueta="Total de clientes"
              valor={formatearEntero(data.clientes.total)}
              detalle={detalle("clientes")}
            />
            <IndicadorCard
              etiqueta="Clientes nuevos"
              valor={formatearEntero(data.clientes.nuevos)}
              detalle={detalle("clientes", "En el período")}
            />
            <IndicadorCard
              etiqueta="Servicios activos"
              valor={formatearEntero(data.servicios.activos)}
              detalle={detalle("servicios")}
            />
            <IndicadorCard
              etiqueta="Servicios por vencer"
              valor={formatearEntero(data.servicios.por_vencer)}
              detalle={detalle("servicios", `En los próximos ${data.servicios.dias_aviso} días`)}
              tono="atencion"
            />
            <IndicadorCard
              etiqueta="Servicios vencidos"
              valor={formatearEntero(data.servicios.vencidos)}
              detalle={detalle("servicios")}
            />
            <IndicadorCard
              etiqueta="Ventas totales"
              valor={formatearPesos(data.ventas.total)}
              detalle={detalle("ventas", "En el período")}
            />
            <IndicadorCard
              etiqueta="Trámites pendientes"
              valor={formatearEntero(data.tramites_pendientes)}
              detalle={detalle("tramites_pendientes")}
            />
            <IndicadorCard
              etiqueta="Documentos pendientes de firma"
              valor={formatearEntero(data.documentos_pendientes_firma)}
              detalle={detalle("documentos_pendientes_firma")}
            />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            <VentasDesglose
              titulo="Ventas por servicio"
              deEjemplo={deEjemplo.has("ventas")}
              filas={data.ventas.por_servicio.map(({ servicio, ...venta }) => ({
                nombre: servicio,
                ...venta,
              }))}
            />
            <VentasDesglose
              titulo="Ventas por ejecutivo"
              deEjemplo={deEjemplo.has("ventas")}
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
