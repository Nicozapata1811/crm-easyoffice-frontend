export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

/**
 * The entities the log records, for the "Entidad" filter. The API offers no
 * list, so this is a copy of AUDITADAS in the backend's
 * core/auditoria/registro.py: add an entity there, add it here. One missing
 * from here still shows in the table and works from the URL or a row's link.
 */
const ENTIDADES: Record<string, string> = {
  "clientes.persona": "Persona",
  "clientes.empresa": "Empresa",
  "clientes.cliente": "Cliente",
  "clientes.representantelegal": "Representante legal",
  "clientes.cuentacliente": "Cuenta de cliente",
  "configuracion.configempresa": "Configuración de la empresa",
  "configuracion.cuentapago": "Cuenta de pago",
  "configuracion.marca": "Marca",
  "inmuebles.oficina": "Inmueble",
  "inmuebles.autorizante": "Autorizante",
  "contratos.duracioncontrato": "Duración de contrato",
  "contratos.contrato": "Contrato",
  "contratos.serviciocontratado": "Servicio contratado",
  "contratos.alertavencimiento": "Alerta de vencimiento",
  "tramites.tipotramite": "Tipo de trámite",
  "tramites.motivopendiente": "Motivo de pendiente",
  "tramites.tramite": "Trámite",
  "documentos.plantilladocumento": "Plantilla de documento",
  "documentos.versionplantilla": "Versión de plantilla",
  "documentos.documento": "Documento",
  "documentos.firmante": "Firmante",
  "documentos.solicitudfirma": "Solicitud de firma",
  "ventas.ciclopago": "Ciclo de pago",
  "ventas.servicio": "Servicio",
  "ventas.planservicio": "Plan de servicio",
  "ventas.venta": "Venta",
  "ventas.itemventa": "Ítem de venta",
  "ventas.ordenpago": "Orden de pago",
  "ventas.pago": "Pago",
  "users.user": "Usuario",
  "auth.group": "Rol",
  "mfa.authenticator": "Segundo factor",
  "authtoken.token": "Token de API",
};

export const OPCIONES_ENTIDAD: OpcionFiltro[] = Object.entries(ENTIDADES)
  .map(([valor, etiqueta]) => ({ valor, etiqueta }))
  .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));

/** The name for a row: ours, or the API's when the list does not have it yet. */
export function etiquetaEntidad(entidad: string, entidadNombre: string): string {
  const etiqueta = ENTIDADES[entidad] ?? entidadNombre;
  return etiqueta ? etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1) : "—";
}
