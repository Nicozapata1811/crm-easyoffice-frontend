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
- **Backoffice** — personal de Easy Office: ejecutivos, supervisores y
  administradores.

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
    └── backoffice/  panel operativo, detalle de trámite, tipos de trámite
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

## Estado actual

Semana 5 de 18. Está construido el esqueleto: ruteo, un layout por audiencia y
una pantalla marcador por cada pantalla del prototipo. Ninguna pantalla está
implementada.

El prototipo que define estas pantallas es **una propuesta pendiente de
validación con la contraparte**, agendada para la semana 6. Los estados de los
trámites, los roles y sus permisos, el proveedor de pago y el momento exacto de
la firma siguen sin definirse, y no se inventan: las suposiciones se marcan en
el código como `// ASSUMPTION: pending validation with Easy Office`.

---

## Protección de datos

El repositorio es público. Ningún dato personal real entra en fixtures,
respuestas simuladas, capturas de pantalla ni pruebas; se usan datos sintéticos.
La Ley 21.719 sobre protección de datos personales entra en vigencia el 1 de
diciembre de 2026.
