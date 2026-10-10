import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { pagarConKlap } from "./checkoutKlap";

export const rutaResultado = (ordenId: number) => `/pagos/${ordenId}/resultado`;

export function usePagarVenta() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (ventaId: number) =>
      pagarConKlap(ventaId, (orden) => navigate(rutaResultado(orden.id))),
  });
}
