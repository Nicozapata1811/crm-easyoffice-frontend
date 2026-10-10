# CRM Easy Office — Frontend

Aplicación React que consume la API REST de CRM Easy Office. El backend vive en
un repositorio separado,
[crm-easyoffice-backend](https://github.com/Nicozapata1811/crm-easyoffice-backend).

Proyecto de Capstone, Duoc UC, Ingeniería en Informática (PTY4614).

---

## Qué hace y qué problema resuelve

Easy Office presta servicios de formalización a emprendedores y pequeñas
empresas. Hoy el proceso es manual: los clientes envían sus datos por WhatsApp,
un ejecutivo los transcribe en una plantilla, genera el documento, devuelve un
borrador, espera la confirmación y luego firma en lotes. Entre tres y cuatro
horas por servicio, la mayor parte en espera.

Esta aplicación es la cara visible de la plataforma que reemplaza ese flujo, y
atiende a dos audiencias distintas:

- **Portal de clientes** — autoatención. El usuario es un emprendedor que no
  conoce el trámite. Si el formulario no lo guía, el proceso vuelve a manos de
  un ejecutivo y el proyecto falla en su propósito.
- **Backoffice** — personal de Easy Office. Los roles confirmados son
  Administrador y Ejecutivo.

**Dentro del alcance del MVP:** portal de clientes para el flujo prioritario
(domicilio tributario) de extremo a extremo · backoffice para usuarios, roles,
clientes, empresas, trámites, estados y auditoría · pantalla de configuración de
tipos de trámite.

**Fuera del alcance:** el catálogo completo de 25 a 40 documentos · constitución
de empresas · integración con notaría · reemplazo del sitio web actual ·
aplicación móvil. La plataforma se enlaza desde el sitio actual de la empresa;
no lo reemplaza ni se incrusta en él.

---

## Tecnologías

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Framework | React 19 |
| Build | Vite |
| Ruteo | React Router |
| Estado del servidor | TanStack Query |
| Componentes | MUI |
| Formularios y validación | react-hook-form con zod |
| Pruebas | Vitest y Testing Library |
| Contenedores | Docker |

---

## Instalación local

Requisitos: Node.js 22.12 o superior (o 20.19+). El backend debe estar
corriendo en `http://localhost:8000`.

```bash
git clone git@github.com:Nicozapata1811/crm-easyoffice-frontend.git
cd crm-easyoffice-frontend
npm install
cp .env.example .env
npm run dev
```

La aplicación queda en http://localhost:5173.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm test` | Pruebas |
| `npm run typecheck` | Verificación de tipos |
| `npm run lint` | Linter |

También puede levantarse con Docker:

```bash
docker compose -f docker-compose.local.yml up
```

### Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `VITE_API_BASE_URL` | Ruta base de la API. Por defecto `/api` |
| `VITE_BACKEND_ORIGIN` | Origen al que el servidor de desarrollo redirige `/api` |

Vite incrusta las variables `VITE_` en el bundle al compilar, así que **ninguna
de ellas puede contener un secreto**. Una URL base no lo es. El archivo `.env`
no se versiona.

---

## Integrantes y roles

| Integrante | Rol principal |
|---|---|
| Fernando Esteban Cartagena Acuña | Coordinación del proyecto, ingeniería de requisitos, arquitectura e integraciones |
| Nicolás Eduardo Zapata Trujillo | Base de datos y desarrollo backend |
| Marcos José Álvarez Muñoz | Desarrollo frontend y UX/UI |

Los roles indican responsabilidades principales, no funciones exclusivas.

---

## Metodología de trabajo

Enfoque ágil basado en **Scrum**, adaptado a un equipo de tres integrantes y a
un semestre académico, con Product Backlog, historias de usuario, Sprint
Backlog, tablero Kanban, desarrollo iterativo, pruebas, revisiones y
retrospectivas.

Convenciones del repositorio:

- Una rama por historia de usuario: `feature/HU-24-formulario-domicilio-tributario`
- Cada commit referencia su issue: `refs #42`
- Nada llega a `main` sin un Pull Request revisado por otro integrante

Cadena de trazabilidad sobre la que se evalúa el proyecto:
`requerimiento → historia de usuario → issue → commit/PR → prueba → evidencia`

**Definition of Done:** criterios de aceptación cumplidos · PR revisado por otro
integrante · pruebas de la lógica nueva pasando · documentación actualizada ·
levanta desde cero con los comandos documentados · sin datos personales reales
ni secretos.

---

## Arquitectura de la solución

Single Page Application que consume la API REST del backend. No hay renderizado
en servidor: el backend expone la API y el panel de administración, y esta
aplicación entrega toda la interfaz.

```
src/
├── api/          cliente fetch, manejo de CSRF, configuración
├── types/        tipos de dominio, nombrados en español
├── lib/          validadores (RUT, rol de avalúo) y formateadores
├── components/   componentes compartidos entre audiencias
├── layouts/      PortalLayout, BackofficeLayout
├── routes/       árbol de rutas
└── features/
    ├── portal/      catálogo, domicilio tributario, documento, pago, estado, mis trámites
    └── backoffice/  panel operativo, clientes, detalle de trámite, tipos de trámite
```

La división es por audiencia primero y por funcionalidad después: portal y
backoffice comparten el cliente de API y los tipos de dominio, pero casi ninguna
pantalla.

**Autenticación.** Basada en sesión, con cookies `httpOnly`, no con JWT en
`localStorage`. Es una decisión de seguridad deliberada: un token en el
almacenamiento del navegador es legible por cualquier script de la página, y
esta aplicación maneja datos personales de clientes reales. Las peticiones se
envían con `credentials: "include"` y los métodos no seguros llevan el token
CSRF en la cabecera `X-CSRFToken`, siguiendo la convención de Django. El estado
de la aplicación no usa `localStorage` ni `sessionStorage`.

**Ingreso del personal y permisos.** El personal ingresa en
`/backoffice/ingresar`. La sesión se obtiene de `GET /api/auth/me/` y vive
solo en la caché de TanStack Query; al cerrar sesión la caché se vacía.
`RequireAuth` redirige a la pantalla de ingreso a quien no tiene sesión, y
`RequirePermission` decide según los `permisos` que devuelve `me`, no según el
nombre del rol, de modo que un rol nuevo creado en el backend funciona sin
cambiar el frontend.

**Cuentas de cliente (HU-03).** Los clientes crean su cuenta en `/registro` e
ingresan en `/ingresar`, con las mismas rutas de sesión que el personal. `me`
indica `tipo` (`cliente` o `staff`): `RequireCliente` protege las pantallas del
portal que requieren cuenta (el pago, el resultado del pago y "Mis compras") y
`RequireAuth` deja el backoffice solo al personal. El encabezado del portal
muestra al cliente de la sesión, o los enlaces para ingresar y crear cuenta.

**Pago con Klap Checkout Flex (HU-39, HU-57).** Easy Office aún no define el
proveedor de pago; Klap es una suposición marcada en el código.
1. "Confirma y paga" toma los precios de `GET /api/portal/servicios/`, rotulados
   como valores de ejemplo mientras no estén confirmados.
2. Al pagar, registra la venta, pide el pago y consulta la orden cada segundo
   (hasta 20 s) hasta que el backend la crea en Klap.
3. Con ese id carga el script que indica `checkout_script_url` y abre el modal
   de Klap (`KLAP_FLEX.init`). Los datos de la tarjeta nunca pasan por la
   aplicación.
4. Cada desenlace tiene su página: `/pagos/{orden}/aprobado`, `rechazado`,
   `cancelado`, `expirado`, `reembolsado` y `error`. Klap vuelve a
   `/resultado` (o a `/cancelado` si el cliente cierra el pago), que espera el
   estado que verifica el backend, no el que informa el modal, y redirige a la
   página que corresponde. Salvo en un pago aprobado o devuelto, la página
   ofrece reintentar.

"Mis compras" lista las ventas del cliente. En el backoffice, "Ventas" lista y
detalla las ventas con sus intentos de pago (`ventas.view_venta`). Para probar
el pago de punta a punta en local, sigue la guía "Pago con Klap en local" del
README del backend.

En desarrollo el servidor de Vite redirige `/api` hacia Django, de modo que el
navegador ve un solo origen y la cookie de sesión es de primera parte. En
producción se recomienda el mismo arreglo detrás de un único proxy inverso.

**Vocabulario de dominio.** Los tipos de dominio se nombran en español
(`tramite`, `tipoTramite`, `documento`, `plantilla`, `empresa`,
`representanteLegal`, `oficina`, `firmante`, `rolDeAvaluo`) porque el dominio es
legal y administrativo chileno. Componentes, hooks, utilidades y pruebas en
inglés. Los textos de interfaz están en español de Chile.

**Validación.** El RUT y el rol de avalúo se validan en el cliente para dar
retroalimentación inmediata; el backend vuelve a validarlos y su respuesta es la
autoritativa. La validación en el cliente comprueba la consistencia interna del
identificador: no lo verifica contra ningún registro público, y no existe tal
integración.

---

## Panel operativo

`/backoffice` muestra los indicadores de RF-14 (HU-41): total de clientes,
clientes nuevos en el período, servicios activos, por vencer y vencidos, ventas
totales, ventas por servicio, ventas por ejecutivo, trámites pendientes y
documentos pendientes de firma, con filtro por período.

Requiere el permiso `core.view_dashboard`, que hoy tiene solo el
Administrador (RN-31). HU-41 habla de un "supervisor", rol no confirmado, y si
el Ejecutivo puede ver el panel está pendiente de validar con Easy Office.

**Datos.** La pantalla lee `GET /api/panel/indicadores/` a través de
`dashboardService` (`src/features/backoffice/PanelOperativo/dashboardService.ts`).
Los totales de clientes son reales. Servicios, ventas, trámites y documentos
siguen siendo valores de ejemplo calculados por el backend, porque aún no
existen en el sistema. El backend los lista en `datos_de_ejemplo` y la pantalla
rotula solo esos.

**Exportar a Excel.** El botón descarga el `.xlsx` que genera el backend para el
período elegido (`GET /api/panel/indicadores/exportar/`), con un resumen y las
ventas por servicio y por ejecutivo.

---

## Clientes

`/backoffice/clientes` cubre HU-06, HU-07, HU-47, HU-49 y HU-51:

- **Listado.** Busca por RUT (con o sin puntos), nombre, razón social o folio, y
  filtra por tipo. La búsqueda queda en la URL, así que volver atrás conserva
  los resultados.
- **Ficha** (`/backoffice/clientes/:id`). Muestra los datos del cliente y, para
  empresas, sus representantes legales. Servicios, documentos e historial
  aparecerán cuando el sistema los registre.
- **Formulario** (`/nuevo` y `/:id/editar`). Registra a una persona natural o a
  una empresa y valida el RUT antes de enviar. Si el backend informa que el RUT
  ya es de un cliente (HU-52), el error aparece en el campo RUT. Al editar se
  puede desactivar al cliente, porque no se eliminan.

Leer requiere `clientes.view_cliente`, crear `clientes.add_cliente` y editar
`clientes.change_cliente`. Quien no ve el panel operativo, como hoy el
Ejecutivo, entra directo al listado de clientes. Para tener datos con qué
trabajar, el backend carga clientes ficticios con `seed_demo_clientes`.

---

## API

Contrato definido por el backend y documentado también en su README.

| Método y ruta | Uso en el frontend |
|---|---|
| `GET /api/auth/csrf/` | Obtiene el token CSRF, que se guarda en memoria |
| `POST /api/auth/login/` | Pantalla de ingreso. `400` significa credenciales inválidas |
| `POST /api/auth/logout/` | Botón "Cerrar sesión" |
| `GET /api/auth/me/` | Sesión actual: `id`, `email`, `name`, `tipo`, `cliente`, `rol`, `permisos`. `403` = sin sesión |
| `POST /api/portal/registro/` | Pantalla "Crea tu cuenta". `201` deja la sesión iniciada; `400` trae errores por campo o un `detail` genérico |
| `GET /api/portal/servicios/` | Precios de "Confirma y paga" |
| `POST /api/portal/ventas/` | Registrar la venta del trámite |
| `GET /api/portal/ventas/` | "Mis compras" |
| `POST /api/portal/ventas/{id}/pagar/` | Iniciar o retomar el pago. `409` si ya no está pendiente |
| `GET /api/portal/ordenes/{id}/` | Esperar la orden de Klap y mostrar el resultado del pago |
| `GET /api/ventas/?buscar=&estado=&page=` | Listado de ventas del backoffice |
| `GET /api/ventas/{id}/` | Detalle de una venta con sus órdenes y pagos |
| `GET /api/panel/indicadores/?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` | Panel operativo |
| `GET /api/panel/indicadores/exportar/?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` | Botón "Exportar a Excel" |
| `GET /api/clientes/?buscar=&tipo=&page=` | Listado de clientes |
| `POST /api/clientes/` | Registrar cliente |
| `GET /api/clientes/{id}/` | Ficha del cliente |
| `PATCH /api/clientes/{id}/` | Editar cliente |

Las respuestas están tipadas en `src/types/panel.ts`, `src/types/cliente.ts` y
`src/types/ventas.ts` con las mismas claves que documenta el backend.

---

## Estado actual

Sprint 2 (6 – 17 de octubre de 2026). Ya están:

- el portal de clientes según el prototipo;
- el ingreso del personal con rutas protegidas;
- el registro y el ingreso de clientes al portal (HU-03);
- el pago con Klap Checkout Flex en su ambiente de pruebas, "Mis compras" y las
  ventas en el backoffice (HU-39, HU-57);
- el panel operativo conectado al backend y exportable a Excel;
- la gestión de clientes: listado con búsqueda, ficha, registro y edición.

Los estados de los trámites, los roles más allá de Administrador y Ejecutivo,
la confirmación del proveedor de pago y de los precios, y el momento exacto de
la firma siguen sin definirse, y no
se inventan: las suposiciones se marcan en el código como
`// ASSUMPTION: pending validation with Easy Office`.

---

## Protección de datos

El repositorio es público. Ningún dato personal real entra en fixtures,
respuestas simuladas, capturas de pantalla ni pruebas; se usan datos sintéticos.
La Ley 21.719 sobre protección de datos personales entra en vigencia el 1 de
diciembre de 2026.
