import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import type { FiltrosAuditoria as Filtros } from "../../../api/auditoria";
import { OPCIONES_ENTIDAD, type OpcionFiltro } from "./entidades";
import { OPCIONES_ACCION, OPCIONES_ORIGEN } from "./etiquetas";
import { hayFiltros } from "./filtrosUrl";

const ESPERA_ESCRITURA_MS = 300;

interface SelectorProps {
  etiqueta: string;
  todos: string;
  valor: string;
  opciones: OpcionFiltro[];
  error?: string;
  alCambiar: (valor: string) => void;
  ancho: number;
}

function Selector({ etiqueta, todos, valor, opciones, error, alCambiar, ancho }: SelectorProps) {
  // A value from a shared URL that the list does not know still has to show.
  const conocido = !valor || opciones.some((opcion) => opcion.valor === valor);
  return (
    <TextField
      select
      label={etiqueta}
      size="small"
      value={valor}
      onChange={(event) => alCambiar(event.target.value)}
      error={Boolean(error)}
      helperText={error}
      slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
      sx={{ minWidth: ancho, maxWidth: 320 }}
    >
      <MenuItem value="">{todos}</MenuItem>
      {!conocido && <MenuItem value={valor}>{valor}</MenuItem>}
      {opciones.map((opcion) => (
        <MenuItem key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </MenuItem>
      ))}
    </TextField>
  );
}

interface FiltrosAuditoriaProps {
  filtros: Filtros;
  errores: Record<string, string>;
  nombreUsuario?: string;
  alCambiar: (cambios: Record<string, string>) => void;
  alLimpiar: () => void;
}

export function FiltrosAuditoria({ filtros, errores, nombreUsuario, alCambiar, alLimpiar }: FiltrosAuditoriaProps) {
  // The box follows the URL, which a row's link or "Limpiar filtros" can change.
  const registroEnUrl = filtros.registro_id ?? "";
  const [registro, setRegistro] = useState(registroEnUrl);
  const [registroPrevio, setRegistroPrevio] = useState(registroEnUrl);
  if (registroEnUrl !== registroPrevio) {
    setRegistroPrevio(registroEnUrl);
    setRegistro(registroEnUrl);
  }

  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(espera.current), []);

  const escribirRegistro = (valor: string) => {
    setRegistro(valor);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => alCambiar({ registro_id: valor.trim() }), ESPERA_ESCRITURA_MS);
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 2 }}>
        <Selector
          etiqueta="Entidad"
          todos="Todas"
          valor={filtros.entidad ?? ""}
          opciones={OPCIONES_ENTIDAD}
          error={errores.entidad}
          alCambiar={(entidad) => alCambiar({ entidad })}
          ancho={200}
        />
        <TextField
          label="ID de registro"
          size="small"
          value={registro}
          onChange={(event) => escribirRegistro(event.target.value)}
          error={Boolean(errores.registro_id)}
          helperText={errores.registro_id}
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
          sx={{ width: 140 }}
        />
        <Selector
          etiqueta="Acción"
          todos="Todas"
          valor={filtros.accion ?? ""}
          opciones={OPCIONES_ACCION}
          error={errores.accion}
          alCambiar={(accion) => alCambiar({ accion })}
          ancho={200}
        />
        <Selector
          etiqueta="Canal"
          todos="Todos"
          valor={filtros.origen ?? ""}
          opciones={OPCIONES_ORIGEN}
          error={errores.origen}
          alCambiar={(origen) => alCambiar({ origen })}
          ancho={180}
        />
        <TextField
          label="Desde"
          type="date"
          size="small"
          value={filtros.desde ?? ""}
          onChange={(event) => alCambiar({ desde: event.target.value })}
          error={Boolean(errores.desde)}
          helperText={errores.desde}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 240 }}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={filtros.hasta ?? ""}
          onChange={(event) => alCambiar({ hasta: event.target.value })}
          error={Boolean(errores.hasta)}
          helperText={errores.hasta}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: 240 }}
        />
        {hayFiltros(filtros) && (
          <Button
            onClick={() => {
              clearTimeout(espera.current);
              setRegistro("");
              alLimpiar();
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>
      {filtros.usuario && (
        <Chip
          label={`Usuario: ${nombreUsuario ?? `#${filtros.usuario}`}`}
          onDelete={() => alCambiar({ usuario: "" })}
          sx={{ mt: 1.5 }}
        />
      )}
    </Box>
  );
}
