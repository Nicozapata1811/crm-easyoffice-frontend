import Box from "@mui/material/Box";

import { formatearPesos } from "../lib/formato";

/**
 * What a sale charges, split as the backend computed it: net, VAT and
 * total. The three always come from the API; nothing is computed here.
 */
export function DesgloseVenta({
  neto,
  iva,
  total,
}: {
  neto: string;
  iva: string;
  total: string;
}) {
  const fila = { display: "flex", justifyContent: "space-between", gap: 2 } as const;
  return (
    <Box sx={{ borderTop: 1, borderColor: "divider", mt: 0.75, pt: 1.25 }}>
      <Box sx={{ ...fila, fontSize: 13, color: "text.secondary", py: 0.25 }}>
        <span>Neto</span>
        <span>{formatearPesos(Number(neto))}</span>
      </Box>
      <Box sx={{ ...fila, fontSize: 13, color: "text.secondary", py: 0.25 }}>
        <span>IVA (19 %)</span>
        <span>{formatearPesos(Number(iva))}</span>
      </Box>
      <Box sx={{ ...fila, fontSize: 15, fontWeight: 700, pt: 0.75 }}>
        <span>Total</span>
        <span>{formatearPesos(Number(total))}</span>
      </Box>
    </Box>
  );
}
