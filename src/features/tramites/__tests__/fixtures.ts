/** All data here is synthetic: invented companies, valid-checksum fake RUTs. */

import type {
  Documento,
  FormularioDomicilio,
  FormularioTramite,
  Tramite,
  TramiteBackoffice,
} from "../../../types/tramites";

export const FORMULARIO: FormularioDomicilio = {
  disponible: true,
  motivo_no_disponible: "",
  fecha_min: "2026-10-16",
  fecha_max: "2026-11-15",
  planes: [
    {
      codigo: "anual",
      nombre: "Plan anual",
      duracion_meses: 12,
      ciclo_pago: "Anual",
      precio: "59990",
      precio_incluye_iva: true,
      precio_confirmado: false,
      firma_incluida: true,
      precio_firma: null,
    },
    {
      codigo: "semestral",
      nombre: "Plan semestral",
      duracion_meses: 6,
      ciclo_pago: "Semestral",
      precio: "39990",
      precio_incluye_iva: true,
      precio_confirmado: false,
      firma_incluida: false,
      precio_firma: "5000",
    },
  ],
  sucursales: [
    {
      id: 1,
      codigo: "LF",
      nombre: "La Florida",
      direccion: "Avenida de Ejemplo 1000, Oficina 101, La Florida",
      comuna: "La Florida",
      region: "Región Metropolitana de Santiago",
    },
    {
      id: 2,
      codigo: "VL",
      nombre: "Valparaíso",
      direccion: "Calle de Prueba 200, Oficina 202, Valparaíso",
      comuna: "Valparaíso",
      region: "Región de Valparaíso",
    },
  ],
  datos: {
    empresa: { rut: "76543210-3", razon_social: "Comercial Ficticia del Sur SpA", giro: "Venta de ejemplo" },
    representante: {
      rut: "12345678-5",
      nombres: "Camila Andrea",
      apellido_paterno: "Ejemplo",
      apellido_materno: "Prueba",
      domicilio: "Pasaje de Prueba 123",
      comuna: "Maipú",
      region: "Región Metropolitana de Santiago",
    },
    personeria: { fecha_instrumento: "2025-12-10", sitio_o_notaria: "www.tuempresaenundia.cl" },
    contacto: { email_aviso: "contacto@empresa-ficticia.example", movil_aviso: "912345678" },
  },
};

export const FORMULARIO_VACIO: FormularioDomicilio = {
  ...FORMULARIO,
  datos: {
    empresa: { rut: "76543210-3", razon_social: "Comercial Ficticia del Sur SpA", giro: "" },
    representante: {
      rut: "",
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      domicilio: "",
      comuna: "",
      region: "",
    },
    personeria: { fecha_instrumento: null, sitio_o_notaria: "" },
    contacto: { email_aviso: "", movil_aviso: "" },
  },
};

export const TRAMITE: Tramite = {
  id: 7,
  folio: "TRA-000007",
  tipo: "Domicilio tributario",
  tipo_codigo: "domicilio-tributario",
  estado: "pendiente",
  motivo: {
    codigo: "revision_borrador",
    nombre: "Revisión del borrador",
    texto_cliente: "Revisa el borrador del contrato y confírmalo para continuar.",
  },
  accion_cliente: "revisar_borrador",
  editable: true,
  datos: { plan: "semestral", sucursal: 1, fecha_inicio: "2026-10-20" },
  contrato: {
    folio: "LF-0001-2026",
    estado: "borrador",
    fecha_inicio: "2026-10-20",
    fecha_vencimiento: "2027-04-19",
    duracion_meses: 6,
    email_aviso: "contacto@empresa-ficticia.example",
    movil_aviso: "912345678",
    servicio: "Domicilio tributario",
    precio: "39990",
    ciclo_pago: "Semestral",
    sucursal: { id: 1, nombre: "La Florida", direccion: "Avenida de Ejemplo 1000, Oficina 101, La Florida" },
    servicios: [
      {
        nombre: "Domicilio tributario",
        precio: "39990",
        ciclo_pago: "Semestral",
        inmueble: {
          id: 1,
          tipo: "oficina",
          nombre: "La Florida",
          direccion: "Avenida de Ejemplo 1000, Oficina 101, La Florida",
        },
      },
    ],
  },
  venta: null,
  eventos: [
    { fecha: "2026-10-16T10:00:00-03:00", estado_nuevo: "iniciado", motivo_nuevo: "" },
    { fecha: "2026-10-16T10:00:05-03:00", estado_nuevo: "pendiente", motivo_nuevo: "revision_borrador" },
  ],
  created_at: "2026-10-16T10:00:00-03:00",
};

export const TRAMITE_A_PAGAR: Tramite = {
  ...TRAMITE,
  motivo: { codigo: "pago", nombre: "Pago", texto_cliente: "Falta el pago para continuar." },
  accion_cliente: "pagar",
  venta: {
    id: 31,
    folio: "VEN-000031",
    estado: "pendiente_pago",
    total: "44990",
    items: [
      {
        servicio: "domicilio-tributario",
        nombre: "Domicilio tributario · Plan semestral",
        precio_unitario: "39990",
        cantidad: 1,
        subtotal: "39990",
      },
      {
        servicio: "firma-electronica-avanzada",
        nombre: "Firma electrónica avanzada",
        precio_unitario: "5000",
        cantidad: 1,
        subtotal: "5000",
      },
    ],
  },
};

export const DOCUMENTO: Documento = {
  id: 3,
  version: 1,
  estado: "generado",
  plantilla: "PLT-01 v1",
  generado_en: "2026-10-16T10:00:05-03:00",
  sha256_docx: "a".repeat(64),
  sha256_pdf: "b".repeat(64),
  sha256_firmado: "",
  firmado_en: null,
  tiene_firmado: false,
  firmantes: [
    { orden: 1, rol: "cliente_representante", nombre: "Camila Andrea Ejemplo Prueba", firmado_en: null },
    { orden: 2, rol: "autorizante", nombre: "María José Propietaria Ejemplo", firmado_en: null },
  ],
};

export const TRAMITE_BACKOFFICE: TramiteBackoffice = {
  ...TRAMITE,
  motivo: { codigo: "firma", nombre: "Firma", texto_cliente: "Estamos gestionando la firma del contrato." },
  accion_cliente: null,
  editable: false,
  cliente: { id: 4, codigo: "CLI-000004", nombre: "Comercial Ficticia del Sur SpA", rut: "76543210-3" },
  detalle_pendiente: "",
  canal: "portal",
  eventos: [
    {
      fecha: "2026-10-16T10:00:00-03:00",
      estado_anterior: "",
      motivo_anterior: "",
      estado_nuevo: "iniciado",
      motivo_nuevo: "",
      detalle: "",
      usuario: "cliente@empresa-ficticia.example",
    },
  ],
};

/** The backoffice form of the warehouse case (PLT-02). */
export const FORMULARIO_BODEGA: FormularioTramite = {
  disponible: true,
  problemas: [],
  fecha_min: "2026-10-16",
  fecha_max: "2026-11-15",
  planes: [],
  duraciones: [1, 3, 4, 6, 12],
  duracion_por_defecto: 12,
  inmuebles: {
    sucursal: [
      {
        id: 1,
        tipo: "oficina",
        codigo: "LF",
        nombre: "La Florida",
        direccion: "Avenida de Ejemplo 1000, Oficina 101, La Florida",
        comuna: "La Florida",
        region: "Región Metropolitana de Santiago",
      },
    ],
    bodega: [
      {
        id: 9,
        tipo: "bodega",
        codigo: null,
        nombre: "Bodega de Ejemplo Norte",
        direccion: "Camino de Prueba 500, Bodega 1, Quilicura",
        comuna: "Quilicura",
        region: "Región Metropolitana de Santiago",
      },
      {
        id: 10,
        tipo: "bodega",
        codigo: null,
        nombre: "Bodega de Ejemplo Costa",
        direccion: "Avenida Ficticia 77, Bodega 12, Viña del Mar",
        comuna: "Viña del Mar",
        region: "Región de Valparaíso",
      },
    ],
  },
  lineas: [
    {
      servicio: "domicilio-tributario",
      nombre: "Domicilio tributario",
      precio_base: "59990",
      precio_confirmado: false,
      ciclo_pago_default: "anual",
      inmueble: "sucursal",
    },
    {
      servicio: "bodega",
      nombre: "Bodega",
      precio_base: null,
      precio_confirmado: false,
      ciclo_pago_default: null,
      inmueble: "bodega",
    },
  ],
  ciclos_pago: [
    { codigo: "mensual", nombre: "Mensual" },
    { codigo: "anual", nombre: "Anual" },
  ],
  datos: FORMULARIO.datos,
};

/** A warehouse case an executive started, waiting for the client's review. */
export const TRAMITE_BODEGA: TramiteBackoffice = {
  ...TRAMITE_BACKOFFICE,
  id: 8,
  folio: "TRA-000008",
  tipo: "Bodega virtual",
  tipo_codigo: "bodega",
  canal: "backoffice",
  editable: true,
  motivo: {
    codigo: "revision_borrador",
    nombre: "Revisión del borrador",
    texto_cliente: "Revisa el borrador del contrato y confírmalo para continuar.",
  },
  datos: {
    sucursal: 1,
    bodega: 10,
    fecha_inicio: "2026-10-20",
    duracion_meses: 6,
    lineas: [
      { servicio: "domicilio-tributario", ciclo_pago: "anual", precio: null },
      { servicio: "bodega", ciclo_pago: "mensual", precio: "20000" },
    ],
  },
  contrato: {
    ...TRAMITE_BACKOFFICE.contrato!,
    folio: "LF-0002-2026",
    servicios: [
      {
        nombre: "Domicilio tributario",
        precio: "59990",
        ciclo_pago: "Anual",
        inmueble: { id: 1, tipo: "oficina", nombre: "La Florida", direccion: "Avenida de Ejemplo 1000" },
      },
      {
        nombre: "Bodega",
        precio: "20000",
        ciclo_pago: "Mensual",
        inmueble: { id: 10, tipo: "bodega", nombre: "Bodega de Ejemplo Costa", direccion: "Avenida Ficticia 77" },
      },
    ],
  },
};
