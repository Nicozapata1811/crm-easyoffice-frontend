import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

import { formatearFechaHoraChile } from "../../../lib/formato";
import type { EntradaAuditoria } from "../../../types/auditoria";
import { SectionHeading } from "../../../components/SectionHeading";
import { detalleDe } from "./cambios";
import { etiquetaEntidad } from "./entidades";
import { etiquetaAccion, etiquetaOrigen, etiquetaUsuario } from "./etiquetas";
import { urlDeRegistro, urlDeUsuario } from "./filtrosUrl";

function Linea({ campo, texto }: { campo: string; texto: string }) {
  return (
    <Typography sx={{ fontSize: 14, mb: 0.75, overflowWrap: "anywhere" }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {campo}:
      </Box>{" "}
      {texto}
    </Typography>
  );
}

interface DetalleEntradaProps {
  entrada: EntradaAuditoria;
  alCerrar: () => void;
}

export function DetalleEntrada({ entrada, alCerrar }: DetalleEntradaProps) {
  const { titulo, lineas } = detalleDe(entrada);
  const entidad = etiquetaEntidad(entrada.entidad, entrada.entidad_nombre);

  return (
    <Dialog open onClose={alCerrar} fullWidth maxWidth="sm">
      <DialogTitle>
        {etiquetaAccion(entrada.accion)} · {entidad}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Linea campo="Fecha y hora" texto={formatearFechaHoraChile(entrada.fecha_hora)} />
          <Linea campo="Usuario" texto={etiquetaUsuario(entrada)} />
          <Linea campo="Canal" texto={etiquetaOrigen(entrada.origen)} />
          <Linea campo="Registro" texto={entrada.registro_nombre ?? "—"} />
          <Linea campo="Dirección IP" texto={entrada.direccion_ip ?? "—"} />
        </Box>
        <SectionHeading texto={titulo} primera />
        {lineas.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Esta acción no guarda datos adicionales.
          </Typography>
        ) : (
          lineas.map((linea) => <Linea key={linea.campo} {...linea} />)
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        {entrada.entidad && entrada.registro_id !== null && (
          <Button
            component={RouterLink}
            to={urlDeRegistro(entrada.entidad, entrada.registro_id)}
            onClick={alCerrar}
          >
            Ver solo este registro
          </Button>
        )}
        {entrada.usuario !== null && (
          <Button component={RouterLink} to={urlDeUsuario(entrada.usuario)} onClick={alCerrar}>
            Ver solo este usuario
          </Button>
        )}
        <Button onClick={alCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
