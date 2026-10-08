import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { TAMANO_PAGINA_CLIENTES } from "../../../api/clientes";
import { EstadoPill } from "../../../components/EstadoPill";
import { PageHeading } from "../../../components/PageHeading";
import { formatearRut } from "../../../lib/rut";
import { tokens } from "../../../theme";
import type { TipoCliente } from "../../../types/cliente";
import { PERMISOS } from "../../auth/permisos";
import { tienePermiso, useSesion } from "../../auth/useSesion";
import { ETIQUETA_TIPO } from "./etiquetas";
import { useClientes } from "./useClientes";

const ESPERA_BUSQUEDA_MS = 300;

export function ListaClientes() {
  const navigate = useNavigate();
  const { data: usuario } = useSesion();
  const [params, setParams] = useSearchParams();
  const buscar = params.get("buscar") ?? "";
  const tipo = (params.get("tipo") ?? "") as TipoCliente | "";
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);
  const [texto, setTexto] = useState(buscar);

  const { data, isPending, isError, isFetching } = useClientes({
    buscar,
    tipo: tipo || undefined,
    pagina,
  });

  const actualizar = (cambios: Record<string, string>) =>
    setParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales);
        for (const [clave, valor] of Object.entries(cambios)) {
          if (valor) siguientes.set(clave, valor);
          else siguientes.delete(clave);
        }
        return siguientes;
      },
      { replace: true },
    );

  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(espera.current), []);

  const escribir = (valor: string) => {
    setTexto(valor);
    clearTimeout(espera.current);
    espera.current = setTimeout(
      () => actualizar({ buscar: valor.trim(), pagina: "" }),
      ESPERA_BUSQUEDA_MS,
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 2 }}>
        <PageHeading titulo="Clientes" bajada="Busca por RUT, nombre, razón social o folio." />
        {tienePermiso(usuario, PERMISOS.crearCliente) && (
          <Button
            variant="contained"
            component={RouterLink}
            to="/backoffice/clientes/nuevo"
            sx={{ alignSelf: "flex-start" }}
          >
            Nuevo cliente
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
        <TextField
          label="Buscar"
          type="search"
          size="small"
          value={texto}
          onChange={(event) => escribir(event.target.value)}
          placeholder="12.345.678-5, nombre o razón social"
          sx={{ flex: "1 1 320px", maxWidth: 480 }}
        />
        <TextField
          select
          label="Tipo"
          size="small"
          value={tipo}
          onChange={(event) => actualizar({ tipo: event.target.value, pagina: "" })}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="persona">Personas</MenuItem>
          <MenuItem value="empresa">Empresas</MenuItem>
        </TextField>
        {isFetching && !isPending && (
          <CircularProgress size={20} aria-label="Actualizando" sx={{ alignSelf: "center" }} />
        )}
      </Box>

      {isError && <Alert severity="error">No pudimos cargar los clientes. Intenta nuevamente.</Alert>}
      {isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress aria-label="Cargando clientes" />
        </Box>
      )}

      {data && (
        <Paper sx={{ overflowX: "auto" }}>
          <Table aria-label="Clientes">
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>RUT</TableCell>
                <TableCell>Nombre o razón social</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.results.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  hover
                  onClick={() => navigate(`/backoffice/clientes/${cliente.id}`)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap", color: tokens.inkSoft }}>
                    {cliente.folio}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatearRut(cliente.rut)}</TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/backoffice/clientes/${cliente.id}`}
                      onClick={(event) => event.stopPropagation()}
                      sx={{ fontWeight: 600 }}
                    >
                      {cliente.nombre}
                    </Link>
                  </TableCell>
                  <TableCell>{ETIQUETA_TIPO[cliente.tipo]}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "inherit" }}>{cliente.email || "—"}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: tokens.inkFaint }}>
                      {cliente.telefono}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <EstadoPill
                      etiqueta={cliente.activo ? "Activo" : "Inactivo"}
                      tono={cliente.activo ? "completo" : "espera"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {data.results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 5, textAlign: "center", color: tokens.inkSoft }}>
                    {buscar || tipo
                      ? "No encontramos clientes con esos criterios."
                      : "Aún no hay clientes registrados."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={data.count}
            page={pagina - 1}
            rowsPerPage={TAMANO_PAGINA_CLIENTES}
            rowsPerPageOptions={[TAMANO_PAGINA_CLIENTES]}
            onPageChange={(_, nueva) => actualizar({ pagina: nueva > 0 ? String(nueva + 1) : "" })}
          />
        </Paper>
      )}
    </Box>
  );
}
