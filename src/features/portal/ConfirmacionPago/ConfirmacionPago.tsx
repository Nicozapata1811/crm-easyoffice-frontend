import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { PageHeading } from "../../../components/PageHeading";
import { SectionHeading } from "../../../components/SectionHeading";
import { tokens } from "../../../theme";
import { COBROS_DEMO, formatearPesos } from "../datosDemo";

/**
 * ASSUMPTION: pending validation with Easy Office. Easy Office has not chosen a
 * payment provider; Transbank and Mercado Pago were both mentioned. These
 * options come from the prototype and nothing here charges anything.
 */
const MEDIOS_PAGO = [
  { id: "webpay", nombre: "Webpay Plus", descripcion: "Tarjeta de crédito o débito · Transbank" },
  { id: "transferencia", nombre: "Transferencia", descripcion: "Confirmación manual, hasta 1 día hábil" },
];

export function ConfirmacionPago() {
  const navigate = useNavigate();
  const [medio, setMedio] = useState(MEDIOS_PAGO[0].id);
  const total = COBROS_DEMO.reduce((suma, cobro) => suma + cobro.monto, 0);

  return (
    <>
      <PageHeading
        titulo="Confirma y paga"
        bajada="El documento se envía a firma electrónica avanzada apenas se confirme el pago."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 3.25 }}>
          <SectionHeading texto="Medio de pago" primera />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {MEDIOS_PAGO.map((opcion) => {
              const elegido = opcion.id === medio;
              return (
                <Box
                  key={opcion.id}
                  role="radio"
                  aria-checked={elegido}
                  tabIndex={0}
                  onClick={() => setMedio(opcion.id)}
                  onKeyDown={(event) => event.key === "Enter" && setMedio(opcion.id)}
                  sx={{
                    border: "1px solid",
                    borderColor: elegido ? tokens.primary : tokens.borderStrong,
                    bgcolor: elegido ? tokens.primaryTint : "transparent",
                    borderRadius: "3px",
                    px: 2,
                    py: 1.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{opcion.nombre}</Typography>
                    <Typography sx={{ fontSize: 11.8, color: tokens.inkSoft, mt: 0.25 }}>
                      {opcion.descripcion}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      flex: "none",
                      border: "1.5px solid",
                      borderColor: elegido ? tokens.primary : tokens.borderStrong,
                      background: elegido
                        ? `radial-gradient(circle, ${tokens.primary} 0 5px, transparent 6px)`
                        : "none",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
          <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 2.25 }}>
            Ambiente de prueba · el proveedor de pago aún no está definido y no se realiza ningún cobro.
          </Typography>
        </Paper>

        <Paper sx={{ p: 2.75 }}>
          <Typography variant="h3" sx={{ fontSize: 14.5, mb: 1.75 }}>
            Resumen
          </Typography>
          {COBROS_DEMO.map((cobro) => (
            <Box
              key={cobro.concepto}
              sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, py: 1.125 }}
            >
              <span>{cobro.concepto}</span>
              <span>{formatearPesos(cobro.monto)}</span>
            </Box>
          ))}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 15,
              fontWeight: 700,
              borderTop: `1px solid ${tokens.border}`,
              mt: 0.75,
              pt: 1.75,
            }}
          >
            <span>Total</span>
            <span>{formatearPesos(total)}</span>
          </Box>

          <Typography sx={{ fontSize: 11.5, color: tokens.inkFaint, mt: 1.5, lineHeight: 1.5 }}>
            Valores de ejemplo. Easy Office aún no confirma los precios.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2.25 }}
            onClick={() => navigate("/tramites/0148")}
          >
            Pagar y enviar a firma
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => navigate("/tramites/domicilio-tributario/documento")}
          >
            Volver
          </Button>
        </Paper>
      </Box>
    </>
  );
}
