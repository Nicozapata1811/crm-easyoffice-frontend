import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { tokens } from "../../../theme";
import { CLIENTE_DEMO, LINEA_TIEMPO_DEMO } from "../datosDemo";

const DOT = {
  done: { bg: tokens.success, border: tokens.success, color: "#fff", glifo: "✓" },
  current: { bg: tokens.gold, border: tokens.gold, color: "#3A2E0C", glifo: "2" },
  pending: { bg: tokens.surface, border: tokens.borderStrong, color: tokens.inkFaint, glifo: "3" },
};

export function EstadoTramite() {
  return (
    <Box sx={{ maxWidth: 760, mx: "auto" }}>
      <PageHeading
        titulo="Trámite N° 0148"
        bajada="Domicilio tributario · Enviado a firma electrónica avanzada"
      />

      <Paper sx={{ display: "flex", alignItems: "center", gap: 2, p: 3, mb: 3.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: tokens.goldTint,
            color: tokens.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 19,
            fontFamily: tokens.serif,
            flex: "none",
          }}
        >
          ✎
        </Box>
        <Box>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            Pendiente de firma
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.inkSoft }}>
            Notificamos a {CLIENTE_DEMO.representante} por correo para firmar. Vence en 5 días.
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3.25, mb: 2.5 }}>
        <SectionHeading texto="Línea de tiempo" primera />
        <Box sx={{ px: 0.5 }}>
          {LINEA_TIEMPO_DEMO.map((hito, index) => {
            const ultimo = index === LINEA_TIEMPO_DEMO.length - 1;
            const estilo = DOT[hito.estado];
            return (
              <Box key={hito.titulo} sx={{ display: "flex", gap: 2, pb: ultimo ? 0 : 3.25, position: "relative" }}>
                {!ultimo && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 11,
                      top: 26,
                      bottom: 0,
                      width: "1px",
                      bgcolor: tokens.borderStrong,
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    zIndex: 1,
                    bgcolor: estilo.bg,
                    border: `1.5px solid ${estilo.border}`,
                    color: estilo.color,
                  }}
                >
                  {estilo.glifo}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13.8,
                      fontWeight: 600,
                      mb: 0.375,
                      color: hito.estado === "pending" ? tokens.inkFaint : tokens.ink,
                    }}
                  >
                    {hito.titulo}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: tokens.inkSoft }}>{hito.meta}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 3.25 }}>
        <SectionHeading texto="Firmantes" primera />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
            fontSize: 13,
          }}
        >
          <span>{CLIENTE_DEMO.representante} — Representante legal</span>
          <EstadoPill etiqueta="Pendiente" tono="progreso" />
        </Box>
      </Paper>
    </Box>
  );
}
