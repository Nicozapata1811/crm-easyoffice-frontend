import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useParams } from "react-router-dom";

import { ApiError } from "../../../api/client";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { formatearFecha, formatearFechaHora } from "../../../lib/formato";
import { formatearRut } from "../../../lib/rut";
import { tokens } from "../../../theme";
import type { FichaCliente as Ficha } from "../../../types/cliente";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { ETIQUETA_TIPO } from "./etiquetas";
import { useCliente } from "./useClientes";

export function FichaCliente() {
  const clienteId = Number(useParams().clienteId);
  const { data: usuario } = useSesion();
  const { data: ficha, isPending, error } = useCliente(clienteId);

  if (error || !Number.isInteger(clienteId)) {
    const noExiste = !Number.isInteger(clienteId) || (error instanceof ApiError && error.status === 404);
    return (
      <Alert severity="error" sx={{ maxWidth: 720, mx: "auto" }}>
        {noExiste ? "No encontramos este cliente." : "No pudimos cargar la ficha. Intenta nuevamente."}
      </Alert>
    );
  }
  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="Cargando ficha" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: "auto" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2 }}>
        <PageHeading
          titulo={nombreDe(ficha)}
          bajada={`${ficha.folio} · ${ETIQUETA_TIPO[ficha.tipo]} · RUT ${formatearRut(rutDe(ficha))}`}
        />
        <Box sx={{ display: "flex", gap: 1.5, alignSelf: "flex-start" }}>
          <Button component={RouterLink} to="/backoffice/clientes">
            Volver al listado
          </Button>
          {tienePermiso(usuario, PERMISOS.editarCliente) && (
            <Button variant="contained" component={RouterLink} to="editar">
              Editar
            </Button>
          )}
        </Box>
      </Box>

      <Paper component="section" aria-label="Datos del cliente" sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <SectionHeading texto="Datos del cliente" primera />
          <EstadoPill
            etiqueta={ficha.activo ? "Activo" : "Inactivo"}
            tono={ficha.activo ? "completo" : "espera"}
          />
        </Box>
        <Datos filas={filasDe(ficha)} />
      </Paper>

      {ficha.empresa && (
        <Paper component="section" aria-label="Representantes legales" sx={{ p: 4, mb: 3 }}>
          <SectionHeading texto="Representantes legales" primera />
          {ficha.representantes.length === 0 ? (
            <Typography sx={{ color: tokens.inkSoft }}>Sin representantes registrados.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>RUT</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Vigente desde</TableCell>
                  <TableCell>Vigente hasta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ficha.representantes.map((representante) => (
                  <TableRow key={representante.id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatearRut(representante.rut)}
                    </TableCell>
                    <TableCell>{representante.nombre}</TableCell>
                    <TableCell>{formatearFecha(representante.vigente_desde)}</TableCell>
                    <TableCell>
                      {representante.vigente_hasta
                        ? formatearFecha(representante.vigente_hasta)
                        : "Sin término"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <Paper component="section" aria-label="Servicios, documentos e historial" sx={{ p: 4 }}>
        <SectionHeading texto="Servicios, documentos e historial" primera />
        <Typography sx={{ color: tokens.inkSoft }}>
          Aparecerán aquí cuando el sistema registre servicios contratados (HU-48), documentos y
          el historial de cambios (RF-15).
        </Typography>
      </Paper>
    </Box>
  );
}

function Datos({ filas }: { filas: [string, string][] }) {
  return (
    <Box
      component="dl"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
        columnGap: 3,
        rowGap: 1.25,
        m: 0,
        "& dt": { color: tokens.inkSoft, fontSize: 14 },
        "& dd": { m: 0, mb: { xs: 1, sm: 0 } },
      }}
    >
      {filas.map(([etiqueta, valor]) => (
        <Box key={etiqueta} sx={{ display: "contents" }}>
          <dt>{etiqueta}</dt>
          <dd>{valor || "—"}</dd>
        </Box>
      ))}
    </Box>
  );
}

function nombreDe({ persona, empresa }: Ficha): string {
  if (empresa) return empresa.razon_social;
  if (!persona) return "";
  return [persona.nombres, persona.apellido_paterno, persona.apellido_materno].filter(Boolean).join(" ");
}

function rutDe({ persona, empresa }: Ficha): string {
  return (empresa ?? persona)?.rut ?? "";
}

function filasDe(ficha: Ficha): [string, string][] {
  const registro: [string, string][] = [
    ["Registrado", formatearFechaHora(ficha.created_at)],
    ["Última modificación", formatearFechaHora(ficha.updated_at)],
  ];
  if (ficha.empresa) {
    const { rut, razon_social, nombre_fantasia, giro, email, telefono } = ficha.empresa;
    return [
      ["RUT", formatearRut(rut)],
      ["Razón social", razon_social],
      ["Nombre de fantasía", nombre_fantasia],
      ["Giro", giro],
      ["Correo", email],
      ["Teléfono", telefono],
      ...registro,
    ];
  }
  const { rut, nombres, apellido_paterno, apellido_materno, email, telefono } = ficha.persona!;
  return [
    ["RUT", formatearRut(rut)],
    ["Nombres", nombres],
    ["Apellido paterno", apellido_paterno],
    ["Apellido materno", apellido_materno],
    ["Correo", email],
    ["Teléfono", telefono],
    ...registro,
  ];
}
