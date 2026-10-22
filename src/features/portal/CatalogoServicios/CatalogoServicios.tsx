import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";

import { listarServicios } from "../../../api/portal";
import { listarTramites } from "../../../api/tramites";
import { PageHeading } from "../../../components/PageHeading";
import { formatearPesos } from "../../../lib/formato";
import { useSesion } from "../../auth/useSesion";
import type { Servicio } from "../../../types/ventas";
import { rutaDeServicio } from "./rutas";

/** Lower case without accents, so "vehiculo" finds "vehículo". */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** The route of a service the client can start now, if any. */
function rutaDisponible(servicio: Servicio): string | undefined {
  return servicio.se_vende_en_portal ? rutaDeServicio(servicio.codigo) : undefined;
}

export function CatalogoServicios() {
  const servicios = useQuery({
    queryKey: ["portal", "servicios"],
    queryFn: ({ signal }) => listarServicios(signal),
  });
  const [busqueda, setBusqueda] = useState("");

  const visibles = (servicios.data ?? []).filter((servicio) => servicio.visible_en_portal);
  const termino = normalizar(busqueda.trim());
  const encontrados = termino
    ? visibles.filter((servicio) =>
        normalizar(`${servicio.nombre} ${servicio.descripcion}`).includes(termino),
      )
    : visibles;
  const preciosDeEjemplo = visibles.some(
    (servicio) => servicio.precio_base !== null && !servicio.precio_confirmado,
  );

  // A bookable card with no route is an admin change the frontend cannot
  // serve yet: say so while developing instead of failing in production.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    for (const servicio of servicios.data ?? []) {
      if (servicio.visible_en_portal && servicio.se_vende_en_portal && !rutaDeServicio(servicio.codigo)) {
        console.warn(
          `El servicio "${servicio.codigo}" se vende en el portal, pero no tiene ruta en ` +
            "CatalogoServicios/rutas.ts: se muestra como Próximamente.",
        );
      }
    }
  }, [servicios.data]);

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
        <Box sx={{ mb: 4 }}>
          <TextField
            size="small"
            placeholder="Buscar trámite o documento"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            slotProps={{ htmlInput: { "aria-label": "Buscar servicio" } }}
            sx={{ width: 260 }}
          />
        </Box>
      </Box>

      {servicios.isPending ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress aria-label="Cargando servicios" />
        </Box>
      ) : servicios.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void servicios.refetch()}>
              Reintentar
            </Button>
          }
        >
          No pudimos cargar los servicios. Intenta de nuevo en unos minutos.
        </Alert>
      ) : visibles.length === 0 ? (
        <Typography sx={{ color: "text.secondary" }}>Pronto publicaremos nuestros servicios.</Typography>
      ) : encontrados.length === 0 ? (
        <Typography sx={{ color: "text.secondary" }}>
          No encontramos servicios para «{busqueda.trim()}».
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 1.75,
            }}
          >
            {encontrados.map((servicio) => (
              <TarjetaServicio key={servicio.codigo} servicio={servicio} />
            ))}
          </Box>
          {preciosDeEjemplo && (
            <Typography sx={{ fontSize: 11.5, color: "text.hint", mt: 2, lineHeight: 1.5 }}>
              Valores de ejemplo. Easy Office aún no confirma los precios.
            </Typography>
          )}
        </>
      )}

      <TramitesEnCurso />
    </>
  );
}

/** For a logged-in client: how many of their cases are under way. */
function TramitesEnCurso() {
  const { data: usuario } = useSesion();
  const esCliente = usuario?.tipo === "cliente";
  const tramites = useQuery({
    queryKey: ["portal", "tramites", "lista"],
    queryFn: ({ signal }) => listarTramites(signal),
    enabled: esCliente,
  });
  const enCurso = (tramites.data?.results ?? []).filter((tramite) => tramite.estado !== "completado").length;
  if (!esCliente || enCurso === 0) return null;

  return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          mt: 4.5,
          pt: 3,
          borderTop: 1, borderColor: "divider",
        }}
      >
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {enCurso === 1 ? "Tienes 1 trámite en curso —" : `Tienes ${enCurso} trámites en curso —`}
        </Typography>
        <Box
          component={RouterLink}
          to="/mis-tramites"
          sx={{
            fontSize: 12,
            px: 1.5,
            py: 0.75,
            borderRadius: 20,
            bgcolor: "primary.soft",
            color: "text.primary",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Ver mis trámites →
        </Box>
      </Box>
  );
}

/**
 * One service card. A service the client can start now is a link to its
 * flow; the rest are shown dimmed as "Próximamente" and do nothing.
 */
function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  const ruta = rutaDisponible(servicio);
  const enlace = ruta ? { component: RouterLink, to: ruta } : {};

  return (
    <Paper
      {...enlace}
      sx={{
        p: 2.5,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        color: "inherit",
        textDecoration: "none",
        opacity: ruta ? 1 : 0.5,
        cursor: ruta ? "pointer" : "default",
        transition: "border-color .15s",
        "&:hover": ruta ? { borderColor: "primary.main" } : undefined,
        "&:focus-visible": ruta ? { outline: "2px solid", outlineColor: "primary.strong" } : undefined,
      }}
    >
      {ruta ? (
        <Typography sx={{ fontSize: 11, color: "primary.strong", fontWeight: 600, mb: 1.25 }}>
          Disponible ahora
        </Typography>
      ) : (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            fontSize: 10,
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            px: 1,
            py: 0.375,
            borderRadius: 20,
            color: "text.secondary",
          }}
        >
          Próximamente
        </Box>
      )}

      <Typography variant="h3" sx={{ mb: 1, pr: ruta ? 0 : 11 }}>
        {servicio.nombre}
      </Typography>
      <Typography
        sx={{
          fontSize: 12.8,
          color: "text.secondary",
          mb: 1.75,
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {servicio.descripcion}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "text.hint",
          borderTop: 1, borderColor: "divider",
          pt: 1.5,
          mt: "auto",
        }}
      >
        {/* ASSUMPTION: pending validation with Easy Office. Prices are
            reference values, and whether they include VAT is unresolved
            (RN-44), so the card does not mention VAT. */}
        {servicio.precio_base === null ? (
          <>
            <span>Precio</span>
            <span>Por confirmar</span>
          </>
        ) : (
          <>
            <span>Precio referencial</span>
            <span>{formatearPesos(Number(servicio.precio_base))}</span>
          </>
        )}
      </Box>
    </Paper>
  );
}
