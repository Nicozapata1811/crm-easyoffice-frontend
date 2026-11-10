import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { type FieldValues, type Path, type PathValue, useFormContext } from "react-hook-form";

import { buscarPersona } from "../../../api/tramites";
import { isValidRut, normalizeRut } from "../../../lib/rut";
import type { PersonaSolicitud } from "../../../types/tramites";
import { CampoTexto, Grilla } from "./campos";

type Campo = keyof PersonaSolicitud;

const CAMPOS: Campo[] = ["nombres", "apellido_paterno", "apellido_materno", "domicilio", "comuna", "email"];

type Busqueda = "sin_buscar" | "buscando" | "registrada" | "nueva" | "error";

const AVISOS: Record<Busqueda, string> = {
  sin_buscar: "Escribe el RUT: si la persona ya está registrada, sus datos se completan solos.",
  buscando: "Buscando a la persona…",
  registrada:
    "Esta persona ya está registrada: completamos sus datos. Si no es de este cliente, se usan tal como están.",
  nueva: "No está registrada: se crea con los datos que escribas.",
  error: "No pudimos buscar a la persona. Escribe sus datos.",
};

/**
 * A party who is a natural person (a lessor, a shareholder), inside a form
 * whose values hold a PersonaSolicitud at ``nombre``. Leaving the RUT field
 * looks the person up and fills the block, or says a new one will be
 * created. ``copiarDe`` offers to copy another block of the form (the
 * company's representative is often the vehicle's owner).
 */
export function BloquePersona<T extends FieldValues>({
  nombre,
  etiqueta,
  copiarDe,
}: {
  nombre: Path<T>;
  /** Names the block for assistive technology: its fields repeat other blocks'. */
  etiqueta: string;
  copiarDe?: { etiqueta: string; origen: Path<T> };
}) {
  const { getValues, setValue } = useFormContext<T>();
  const [busqueda, setBusqueda] = useState<Busqueda>("sin_buscar");
  const ruta = (campo: Campo) => `${nombre}.${campo}` as Path<T>;
  const poner = (campo: Campo, valor: string) =>
    setValue(ruta(campo), valor as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });

  const buscar = async () => {
    const rut = String(getValues(ruta("rut")) ?? "");
    if (!isValidRut(rut)) return;
    setBusqueda("buscando");
    try {
      const persona = await buscarPersona(normalizeRut(rut));
      if (persona === null) {
        setBusqueda("nueva");
        return;
      }
      // Never blank what was typed: a record may lack the domicile or email.
      for (const campo of CAMPOS) if (persona[campo]) poner(campo, persona[campo]);
      setBusqueda("registrada");
    } catch {
      setBusqueda("error");
    }
  };

  const copiar = () => {
    if (!copiarDe) return;
    const origen = getValues(copiarDe.origen) as Partial<PersonaSolicitud>;
    for (const campo of ["rut", ...CAMPOS] as Campo[]) poner(campo, origen[campo] ?? "");
    setBusqueda("sin_buscar");
  };

  return (
    <Box role="group" aria-label={etiqueta}>
      {copiarDe && (
        <Button size="small" variant="outlined" sx={{ mb: 2 }} onClick={copiar}>
          {copiarDe.etiqueta}
        </Button>
      )}
      <Grilla>
        <CampoTexto<T>
          nombre={ruta("rut")}
          etiqueta="RUT"
          placeholder="12345678-5"
          slotProps={{ htmlInput: { onBlur: () => void buscar() } }}
        />
        <Typography role="status" sx={{ fontSize: 12.5, color: "text.secondary", alignSelf: "center", pb: 2 }}>
          {AVISOS[busqueda]}
        </Typography>
        <CampoTexto<T> nombre={ruta("nombres")} etiqueta="Nombres" />
        <CampoTexto<T> nombre={ruta("apellido_paterno")} etiqueta="Apellido paterno" />
        <CampoTexto<T> nombre={ruta("apellido_materno")} etiqueta="Apellido materno" />
        <CampoTexto<T> nombre={ruta("comuna")} etiqueta="Comuna" />
        <CampoTexto<T>
          nombre={ruta("domicilio")}
          etiqueta="Domicilio"
          placeholder="Calle, número, depto."
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
        <CampoTexto<T>
          nombre={ruta("email")}
          etiqueta="Correo electrónico"
          type="email"
          helperText="Para la firma electrónica avanzada: ahí llega su enlace."
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
      </Grilla>
    </Box>
  );
}
