import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { pagarConKlap } from "./checkoutKlap";
import { rutaPago } from "./estados";

export function usePagarVenta() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (ventaId: number) =>
      pagarConKlap(ventaId, {
        alTerminar: (orden) => navigate(rutaPago(orden.id, "resultado")),
        alCancelar: (orden) => navigate(rutaPago(orden.id, "cancelado")),
      }),
  });
}
