import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { pagar } from "./checkout";
import { rutaPago } from "./estados";

export function usePagarVenta() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ ventaId, proveedor }: { ventaId: number; proveedor: string }) =>
      pagar(ventaId, proveedor, {
        alTerminar: (orden) => navigate(rutaPago(orden.id, "resultado")),
        alCancelar: (orden) => navigate(rutaPago(orden.id, "cancelado")),
      }),
  });
}
