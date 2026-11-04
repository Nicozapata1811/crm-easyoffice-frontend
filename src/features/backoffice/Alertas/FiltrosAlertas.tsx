import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { FiltrosAlertas as Filtros } from "../../../api/contratos";
import { GESTIONADA, hayFiltros, PENDIENTE } from "./filtrosUrl";

interface FiltrosAlertasProps {
  filtros: Filtros;
  umbrales: number[];
  errores: Record<string, string>;
  alCambiar: (cambios: Record<string, string>) => void;
  alLimpiar: () => void;
}

export function FiltrosAlertas({ filtros, umbrales, errores, alCambiar, alLimpiar }: FiltrosAlertasProps) {
  const umbral = filtros.umbral ?? "";
  // A value from a shared URL that the list does not know still has to show.
  const opciones = umbrales.map(String);
  if (umbral && !opciones.includes(umbral)) opciones.unshift(umbral);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
      <TextField
        select
        label="Estado"
        size="small"
        value={filtros.estado ?? PENDIENTE}
        onChange={(event) => alCambiar({ estado: event.target.value })}
        error={Boolean(errores.estado)}
        helperText={errores.estado}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value={PENDIENTE}>Pendientes</MenuItem>
        <MenuItem value={GESTIONADA}>Gestionadas</MenuItem>
      </TextField>
      <TextField
        select
        label="Umbral"
        size="small"
        value={umbral}
        onChange={(event) => alCambiar({ umbral: event.target.value })}
        error={Boolean(errores.umbral)}
        helperText={errores.umbral}
        slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {opciones.map((opcion) => (
          <MenuItem key={opcion} value={opcion}>
            {opcion} días
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        label="Solo los contratos a mi cargo"
        control={
          <Checkbox
            checked={Boolean(filtros.mias)}
            onChange={(event) => alCambiar({ mias: event.target.checked ? "true" : "" })}
          />
        }
      />
      {hayFiltros(filtros) && <Button onClick={alLimpiar}>Limpiar filtros</Button>}
    </Box>
  );
}
