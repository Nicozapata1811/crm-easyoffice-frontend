import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { PageHeading } from "../../../components/PageHeading";
import { tokens } from "../../../theme";
import { CLIENTE_DEMO } from "../datosDemo";

const RESUMEN = [
  ["Servicio", "Domicilio tributario"],
  ["Folio", "N° 0148"],
  ["Requiere pago", "Sí"],
  ["Requiere firma", "Sí"],
  ["Firmantes", "1"],
];

/** Highlighted value filled in from the trámite's data. */
function Dato({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        bgcolor: tokens.goldTint,
        px: 0.5,
        borderBottom: `1px solid ${tokens.gold}`,
        fontWeight: 600,
      }}
    >
      {children}
    </Box>
  );
}

export function PrevisualizacionDocumento() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeading
        titulo="Revisa el documento"
        bajada="Verifica que los datos sean correctos. Una vez confirmado, se generará la versión final para firma."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, md: "52px 48px" },
            fontFamily: tokens.serif,
            boxShadow: "0 1px 3px rgba(20,30,25,.06)",
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              color: tokens.inkFaint,
              letterSpacing: ".03em",
              textAlign: "right",
              fontFamily: tokens.sans,
              mb: 3,
            }}
          >
            Plantilla v3 · Folio provisorio N° 0148
          </Typography>

          <Typography variant="h2" sx={{ textAlign: "center", mb: 0.5 }}>
            Declaración de Cambio de Domicilio Tributario
          </Typography>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 11.5,
              color: tokens.inkSoft,
              fontFamily: tokens.sans,
              mb: 4,
            }}
          >
            Servicio de Impuestos Internos — Formulario de aviso
          </Typography>

          <Box sx={{ "& p": { fontSize: 13.5, lineHeight: 1.85, textAlign: "justify", mb: 2 } }}>
            <p>
              En San Bernardo, con fecha 8 de septiembre de 2026, comparece{" "}
              <Dato>{CLIENTE_DEMO.representante}</Dato>, en representación de{" "}
              <Dato>{CLIENTE_DEMO.nombre}</Dato>, RUT <Dato>76.245.891-8</Dato>, quien viene en
              informar el cambio de domicilio tributario de la empresa.
            </p>
            <p>
              El nuevo domicilio tributario queda fijado en{" "}
              <Dato>Av. Portales 1450, oficina 302, San Bernardo</Dato>, correspondiente al rol de
              avalúo <Dato>4021-15</Dato>, dejándose constancia para los efectos legales y
              tributarios correspondientes.
            </p>
          </Box>

          <Box
            sx={{
              mt: 7,
              pt: 1.25,
              borderTop: `1px solid ${tokens.ink}`,
              width: 220,
              fontFamily: tokens.sans,
              fontSize: 11,
              color: tokens.inkSoft,
            }}
          >
            Firma representante legal
          </Box>
        </Paper>

        <Paper sx={{ p: 2.75 }}>
          <Typography variant="h3" sx={{ fontSize: 14.5, mb: 1.75 }}>
            Resumen del trámite
          </Typography>
          {RESUMEN.map(([clave, valor]) => (
            <Box
              key={clave}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12.8,
                py: 1.125,
                borderBottom: `1px solid ${tokens.border}`,
              }}
            >
              <Box component="span" sx={{ color: tokens.inkSoft }}>
                {clave}
              </Box>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {valor}
              </Box>
            </Box>
          ))}

          <Typography
            sx={{
              fontSize: 11.5,
              color: tokens.inkFaint,
              mt: 2,
              pt: 1.75,
              lineHeight: 1.5,
              borderTop: `1px dashed ${tokens.border}`,
            }}
          >
            Este documento aún no tiene validez legal. Se marca como definitivo solo tras el pago y
            la firma electrónica avanzada.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 2.5 }}>
            <Button variant="outlined" onClick={() => navigate("/tramites/domicilio-tributario/nuevo")}>
              Editar datos
            </Button>
            <Button variant="contained" onClick={() => navigate("/tramites/domicilio-tributario/pago")}>
              Confirmar
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
