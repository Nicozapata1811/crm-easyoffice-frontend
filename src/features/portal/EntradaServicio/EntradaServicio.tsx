/**
 * Public entry point for deep links from the website: /{servicio}?plan=&origen=.
 *
 * Sends the visitor to the service's form with the query string intact, so
 * links already published on the site survive changes to internal routes.
 * An unknown service lands on the catalogue instead of an error page.
 */

import { Navigate, useLocation, useParams } from "react-router-dom";

const FORMULARIO_POR_SERVICIO: Partial<Record<string, string>> = {
  "domicilio-tributario": "/tramites/domicilio-tributario/nuevo",
};

export function EntradaServicio() {
  const { servicioSlug = "" } = useParams();
  const { search } = useLocation();
  const formulario = FORMULARIO_POR_SERVICIO[servicioSlug.toLowerCase()];

  return <Navigate replace to={formulario ? `${formulario}${search}` : "/"} />;
}
