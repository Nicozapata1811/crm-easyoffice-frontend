import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { SectionHeading } from "../../../components/SectionHeading";
import { tokens } from "../../../theme";
import { SelectorMedioPago } from "./SelectorMedioPago";
import type { useMediosPago } from "./useMediosPago";

/**
 * ASSUMPTION: pending validation with Easy Office. The company has not chosen
 * a payment provider; the methods shown are whatever the backend enables.
 */
export function PanelMedioPago({ medios, elegido, elegir }: ReturnType<typeof useMediosPago>) {
  return (
    <Paper sx={{ p: 3.25 }}>
      <SectionHeading texto="Medio de pago" primera />
      {medios.isPending && <CircularProgress size={22} aria-label="Cargando medios de pago" />}
      {medios.isError && <Alert severity="error">No pudimos cargar los medios de pago.</Alert>}
      {medios.data?.length === 0 && (
        <Alert severity="warning">El pago en línea no está disponible por ahora.</Alert>
      )}
      {medios.data && medios.data.length > 0 && (
        <SelectorMedioPago medios={medios.data} elegido={elegido} onElegir={elegir} />
      )}
      <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 2.25 }}>
        Ambiente de prueba · no se realiza ningún cobro real. El pago se hace en la página segura
        del medio elegido; Easy Office no recibe los datos de tu tarjeta.
      </Typography>
    </Paper>
  );
}
