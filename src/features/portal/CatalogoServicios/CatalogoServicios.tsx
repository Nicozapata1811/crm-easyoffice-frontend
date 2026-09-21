import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { PageHeading } from "../../../components/PageHeading";
import { tokens } from "../../../theme";
import { SERVICIOS_DEMO } from "../datosDemo";

export function CatalogoServicios() {
  const navigate = useNavigate();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <PageHeading
            titulo="¿Qué trámite necesitas hoy?"
            bajada="Elige un servicio para comenzar. Tus datos se completan desde trámites anteriores."
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1.25, mb: 4 }}>
          <TextField size="small" placeholder="Buscar trámite o documento" sx={{ width: 260 }} />
          <Button variant="outlined">Buscar</Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 1.75,
        }}
      >
        {SERVICIOS_DEMO.map((servicio) => (
          <Paper
            key={servicio.id}
            onClick={() => servicio.ruta && navigate(servicio.ruta)}
            sx={{
              p: 2.5,
              position: "relative",
              opacity: servicio.disponible ? 1 : 0.5,
              cursor: servicio.ruta ? "pointer" : "default",
              transition: "border-color .15s",
              "&:hover": servicio.ruta ? { borderColor: tokens.primary } : undefined,
            }}
          >
            {servicio.disponible ? (
              <Typography
                sx={{ fontSize: 11, color: tokens.stamp, fontWeight: 600, mb: 1.25 }}
              >
                Disponible ahora
              </Typography>
            ) : (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: 10,
                  bgcolor: tokens.bg,
                  border: `1px solid ${tokens.border}`,
                  px: 1,
                  py: 0.375,
                  borderRadius: 20,
                  color: tokens.inkSoft,
                }}
              >
                Próximamente
              </Box>
            )}

            <Typography variant="h3" sx={{ mb: 1, pr: servicio.disponible ? 0 : 11 }}>
              {servicio.nombre}
            </Typography>
            <Typography sx={{ fontSize: 12.8, color: tokens.inkSoft, mb: 1.75, lineHeight: 1.5 }}>
              {servicio.descripcion}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: tokens.inkFaint,
                borderTop: `1px solid ${tokens.border}`,
                pt: 1.5,
              }}
            >
              <span>{servicio.metaEtiqueta}</span>
              <span>{servicio.metaValor}</span>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mt: 4.5,
          pt: 3,
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        <Typography sx={{ fontSize: 12.5, color: tokens.inkSoft }}>
          Tienes 2 trámites en curso —
        </Typography>
        <Box
          component={RouterLink}
          to="/mis-tramites"
          sx={{
            fontSize: 12,
            px: 1.5,
            py: 0.75,
            borderRadius: 20,
            bgcolor: tokens.primaryTint,
            color: tokens.primaryDark,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Ver mis trámites →
        </Box>
      </Box>
    </>
  );
}
