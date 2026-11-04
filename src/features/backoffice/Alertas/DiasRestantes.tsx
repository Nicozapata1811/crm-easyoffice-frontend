import { EstadoPill } from "../../../components/EstadoPill";
import { etiquetaDias, tonoDias } from "./dias";

export function DiasRestantes({
  dias,
  renovacionAutomatica,
}: {
  dias: number;
  renovacionAutomatica: boolean;
}) {
  return (
    <EstadoPill
      etiqueta={etiquetaDias(dias, renovacionAutomatica)}
      tono={tonoDias(dias, renovacionAutomatica)}
    />
  );
}
