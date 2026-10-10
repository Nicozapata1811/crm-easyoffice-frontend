import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { listarMediosPago } from "../../../api/portal";

/** The enabled payment methods and the client's choice, the first by default. */
export function useMediosPago() {
  const medios = useQuery({
    queryKey: ["portal", "medios-pago"],
    queryFn: ({ signal }) => listarMediosPago(signal),
  });
  const [eleccion, setEleccion] = useState<string>();
  const elegido = eleccion ?? medios.data?.[0]?.codigo ?? "";
  return { medios, elegido, elegir: setEleccion };
}
