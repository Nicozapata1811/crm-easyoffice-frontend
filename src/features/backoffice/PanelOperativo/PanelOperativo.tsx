import { useState } from "react";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { PageHeading } from "../../../components/PageHeading";
import { formatearEntero, formatearFecha, formatearPesos } from "../../../lib/formato";
import { tokens } from "../../../theme";
import { dashboardService } from "./dashboardService";
import { IndicadorCard } from "./IndicadorCard";
import { PERIODOS, resolverPeriodo, type PeriodoId } from "./periodos";
import { VentasDesglose } from "./VentasDesglose";

const NOTA_VENTAS =
  "Solo ventas pagadas en línea. Los contratos registrados en el backoffice sin pago en línea no se cuentan.";

export function PanelOperativo() {
  const [periodoId, setPeriodoId] = useState<PeriodoId>("mes-actual");
  const periodo = resolverPeriodo(periodoId);
  const { data, isPending, isError } = useQuery({
    queryKey: ["indicadores", periodo],
    queryFn: ({ signal }) => dashboardService.getIndicators(periodo, signal),
    placeholderData: keepPreviousData,
  });
  const exportar = useMutation({ mutationFn: () => dashboardService.exportIndicators(periodo) });

  const al = data ? `Al ${formatearFecha(data.fecha_referencia)}` : "";

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
            />
            <IndicadorCard
              etiqueta="Clientes nuevos"
              valor={formatearEntero(data.clientes.nuevos)}
              detalle="En el período"
            />
            <IndicadorCard
              etiqueta="Servicios activos"
              valor={formatearEntero(data.servicios.activos)}
              detalle={`Contratos vigentes · ${al.toLowerCase()}`}
            />
            <IndicadorCard
              etiqueta="Servicios por vencer"
              valor={formatearEntero(data.servicios.por_vencer)}
              detalle={`En los próximos ${data.servicios.dias_aviso} días · ${al.toLowerCase()}`}
              tono="atencion"
            />
            <IndicadorCard
              etiqueta="Servicios vencidos"
              valor={formatearEntero(data.servicios.vencidos)}
              detalle={al}
            />
            <IndicadorCard
              etiqueta="Ventas totales"
              valor={formatearPesos(data.ventas.total)}
              detalle="Pagadas en línea, en el período"
            />
            <IndicadorCard
              etiqueta="Trámites pendientes"
              valor={formatearEntero(data.tramites_pendientes)}
              detalle={al}
            >
              {data.tramites_pendientes_por_motivo.length > 0 && (
                <Box
                  component="ul"
                  aria-label="Pendientes por motivo"
                  sx={{ m: 0, mt: 1, p: 0, listStyle: "none" }}
                >
                  {data.tramites_pendientes_por_motivo.map(({ motivo, nombre, cantidad }) => (
                    <Box
                      component="li"
                      key={motivo}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        fontSize: 12.5,
                        color: tokens.inkSoft,
                      }}
                    >
                      <span>{nombre}</span>
                      <span>{formatearEntero(cantidad)}</span>
                    </Box>
                  ))}
                </Box>
              )}
            </IndicadorCard>
            <IndicadorCard
              etiqueta="Documentos pendientes de firma"
              valor={formatearEntero(data.documentos_pendientes_firma)}
              detalle={al}
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
          <Typography sx={{ mt: 1.5, fontSize: 12.5, color: tokens.inkFaint }}>{NOTA_VENTAS}</Typography>
        </>
      )}
    </Box>
  );
}
