# Plan del proyecto: inteligencia territorial y reportes ciudadanos (Jujuy)

> Entrega: **hoy (22/11/2026)**. Sin requisitos formales del jurado.
> Herramientas: **Spec Kit** (`.specify/` + `specs/`) para especificar, **GitHub Issues** para el seguimiento y **ECC** (plugin `ecc@ecc`) como flujo de trabajo de los agentes (§8).
> Especificación detallada: [`specs/001-tickets-ciudadanos/spec.md`](../specs/001-tickets-ciudadanos/spec.md) · Tareas: [`tasks.md`](../specs/001-tickets-ciudadanos/tasks.md).
> Este documento es la **fuente de verdad para orquestar el código** (personas y agentes: Devin, Claude Code).

## 1. Visión

Una plataforma web que combina **datos oficiales agregados** (SNIC) con **reportes
ciudadanos** para construir un mapa de calor del delito en **San Salvador de Jujuy**, un dashboard
estadístico y recomendaciones de prevención situacional. Quien sufrió un delito o un
abuso puede reportarlo, de forma **anónima** o pidiendo que **alguien la contacte**.
El caso se deriva al **Ministerio de Salud** o a la **Policía** según la categoría.

## 2. Estado actual y punto de partida

| Pieza | Estado | Qué hacemos |
|---|---|---|
| Documentación, `AGENTS.md`, reglas de merge, CI | En `main` | Se mantiene; se actualiza a MySQL |
| Backend NestJS + Prisma + PostgreSQL (PR #2) | Eliminado | **Reemplazado por la app Next.js de `web/`** (decisión 21). Las funciones puras de agregación y sus tests ya están en `web/src/lib/geo/` |
| Ramas locales `fix/backend-review-findings` y `feat/frontend-react-vite` | Sin PR | **Se descartan.** Sus arreglos (rate limit en login, límite de body, resta de meses) pasan como requisitos de la reescritura |
| Tickets, operadores, mapa KDE, admin | No existe | Este plan |

## 3. Decisiones tomadas

| # | Tema | Decisión |
|---|---|---|
| 0 | Alcance territorial | **Ciudad de San Salvador de Jujuy** (todos sus barrios). El resto de la provincia queda para una fase posterior |
| 1 | Base de datos | **MySQL 8** con **Prisma** como ORM (reemplaza a PostgreSQL) |
| 2 | Código existente | Se reemplaza por completo donde haga falta |
| 3 | Empresas de seguridad | **Fuera de alcance** (ni rol, ni directorio, ni solicitudes de contacto). Quedan como fase 2 del modelo de negocio |
| 4 | Administración | Todas las entidades (usuarios, operadores, barrios, categorías y derivación, servicios de asistencia, reglas de recomendación, incidentes oficiales) se gestionan desde un **panel ADMIN** |
| 5 | Datos de demo | Precarga completa de **datos ficticios** (`sintetico = true`), que se agrega **recién cuando la lógica esté completa** (fase 5). Hasta entonces, los tests usan fixtures propios |
| 6 | Formulario | Público, sin cuenta |
| 7 | Datos según agravante | **Robo, hurto, hurto de vehículo, lesiones, homicidio, estafa:** nombre, un contacto y declaración jurada obligatorios. **Abuso sexual, violencia de género, violencia intrafamiliar:** se permite el modo **anónimo** |
| 8 | Roles | `PUBLICO` (sin cuenta) · `CIUDADANO` (P1: análisis de **toda la ciudad**, barrio por barrio) · `OPERADOR_SALUD` · `OPERADOR_POLICIA` (cada uno ve solo sus tickets) · `ANALISTA` (todo agregado) · `ADMIN` (gestiona todo y crea las cuentas de operadores) |
| 9 | Derivación | Automática por categoría y configurable por ADMIN: abuso sexual → **Salud y Policía**; violencia de género e intrafamiliar → **Policía** (con recursos de Salud); resto → **Policía** |
| 10 | Categorías | `HOMICIDIO`, `LESIONES`, `VIOLENCIA_GENERO`, `VIOLENCIA_INTRAFAMILIAR`, `ABUSO_SEXUAL`, `ROBO`, `HURTO`, `HURTO_VEHICULO`, `ESTAFA_ONLINE`. Acoso, violencia institucional y maltrato infantil quedan fuera |
| 11 | Ubicación | Se guarda el punto que marca la persona, visible solo para el operador asignado. Al público llega **agrupada** (ver §6.5) |
| 12 | Adjuntos | No |
| 13 | Víctima o testigo | Se pregunta |
| 14 | Contacto | Nombre, teléfono o email, horario preferido. Sin DNI |
| 15 | Anónimo → denuncia | Si marca "quiero denunciar", se piden datos y pasa a **con contacto** |
| 16 | Anónimo sin denuncia | Envío sin seguimiento ni respuesta |
| 17 | Estados | `NUEVO → CONTACTADO → DERIVADO → CERRADO`, con notas internas |
| 18 | Mapa | **Una sola capa** (oficial + ciudadano, mismo peso), estilo **densidad continua (KDE)** como la referencia de la UANL. Los reportes entran directo, sin validación |
| 19 | Umbral mínimo | Sin mínimo (`MIN_COUNT=1`, configurable; ver R1) |
| 20 | Retención | Borrado lógico; borrado físico si la persona pide la supresión |
| 21 | Stack (22/11/2026) | **Una sola app Next.js 16 (App Router) en `web/`**, que reemplaza a NestJS (backend) y a Vite (frontend). La API son Route Handlers en `src/app/api/`. Deploy completo en Vercel; Railway queda solo para MySQL |
| 22 | Tiempo real | **Sin Socket.IO** (Vercel no mantiene conexiones abiertas). El mapa y la bandeja de operadores vuelven a pedir datos cada `NEXT_PUBLIC_POLL_MS` (5 s), lo que cumple SC-003 (< 5 s) |
| 23 | Flujo de agentes | **ECC** instalado a nivel proyecto **sin hooks**. Cada tarea sigue `/ecc:plan` → `tdd-workflow` → `/code-review` → verificación (ver `CLAUDE.md`). Ante cualquier diferencia, este plan y `AGENTS.md` mandan sobre las reglas de ECC |
| 24 | Informes agénticos | Las recomendaciones con respaldo suficiente se convierten en informes para Salud o Policía, redactados por un modelo (`claude-haiku-5-5` en desarrollo) y aprobados por un ANALISTA. Se emiten **por evidencia, no por calendario** (≥ 30 hechos en 30 días, 2 semanas sostenidas, 14 días sin repetir salvo escalada). Hoy solo hay una simulación en `/informes`; diseño en [INFORMES-AGENTICOS.md](INFORMES-AGENTICOS.md) |

## 4. Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Sin umbral y con KDE a escala barrio, un reporte de abuso puede **señalar una casa** | Agrupar puntos cada ~100 m antes de enviarlos, nunca mostrar marcadores individuales, `MIN_COUNT` configurable |
| R2 | Reportes falsos que inflan o estigmatizan barrios | Declaración jurada, rate limit por IP, leyenda "incluye reportes ciudadanos no verificados" |
| R3 | El borrado lógico no cumple el derecho de supresión (Ley 25.326, art. 16) | Borrado físico a pedido |
| R4 | Abuso y violencia son datos sensibles (art. 7) | Contacto cifrado (AES-256-GCM), acceso solo del organismo asignado, auditoría |

## 5. Modelo de negocio

- **Ciudadanía (B2C):** gratis. Reportar, ver el mapa y (P1) el análisis de toda la ciudad.
- **Estado (B2G):** licencia del panel de operadores para Salud y Policía, y reportes agregados para políticas públicas. Es el cliente del MVP.
- **Fase 2 (fuera de alcance hoy):** empresas de seguridad de Jujuy (suscripción por zonas a datos agregados, solicitudes de contacto con consentimiento), aseguradoras e inmobiliarias.
- **Regla de oro:** ningún dato personal se comparte con privados.

## 6. Arquitectura y lógica de negocio

### 6.1 Stack

| Capa | Tecnología |
|---|---|
| App (`web/`) | **Next.js 16** (App Router, Turbopack) + **React 19** + TypeScript estricto |
| UI | Tailwind CSS v4 + tokens en `src/app/globals.css` (`@theme`), shadcn/ui (Radix), Lucide, Sonner |
| Mapa y gráficos | React-Leaflet 5 + `leaflet.heat` (solo en el cliente), Recharts |
| Formularios y validación | React Hook Form + **Zod** (los mismos esquemas validan el formulario y el Route Handler) |
| API | Route Handlers en `src/app/api/**/route.ts`, prefijo `/api` |
| Datos | **Prisma 6 + MySQL 8** |
| Auth | JWT firmado con `jose` en cookie httpOnly, contraseñas con `bcryptjs`, `src/proxy.ts` para redirecciones optimistas y verificación de rol en cada Route Handler |
| Tests | Vitest (unitarios e integración), Playwright (E2E de pantallas) |
| Infra | Docker (`mysql:8`) en local, **Vercel** (app completa), **Railway** (solo MySQL), GitHub Actions |

**MySQL con Prisma, a tener en cuenta:**
- `datasource db { provider = "mysql" }` y `DATABASE_URL="mysql://root:root@localhost:3306/jujuy"`.
- Local: `docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=jujuy mysql:8`.
- `prisma migrate dev` necesita una *shadow database*: usar el usuario root en local.
- Prisma no soporta tipos espaciales en MySQL: lat/lng como `Decimal(9,6)` y la agregación se calcula en `src/lib/geo`, no en SQL.
- Textos largos con `@db.Text`; polígonos de barrios como `Json` (GeoJSON).
- Prisma se queda en la versión 6: la 7 exige adaptadores de driver y `prisma.config.ts`, más trabajo sin beneficio para la entrega.
- CI: hoy solo valida el esquema; cuando haya tests contra la base, agregar el servicio `mysql:8`.

**Next.js 16, a tener en cuenta:**
- Leer `web/node_modules/next/dist/docs/` antes de usar una API: hay cambios respecto de versiones anteriores (por ejemplo, `middleware.ts` ahora se llama `proxy.ts`).
- `cacheComponents` está activado: los datos por pedido (cookies, base de datos) van dentro de `<Suspense>` o en Route Handlers.
- Leaflet usa `window`: los componentes de mapa llevan `"use client"` y se cargan con `next/dynamic` y `ssr: false`.

### 6.2 Modelo de datos (borrador para `schema.prisma`)

| Entidad | Campos clave |
|---|---|
| `User` | email, passwordHash, nombre, `role`, `organismo` (`SALUD` / `POLICIA` / null), activo, `barrioId?` |
| `Barrio` | nombre, localidad, poblacion, `poligono Json`, centroLat/Lng |
| `CategoriaConfig` | `categoria` (enum), permiteAnonimo, requiereContacto, `organismos` (Salud/Policía), recursos de urgencia |
| `Incidente` | oficial: categoria, fecha, franja, lat/lng, barrioId, fuente, `sintetico` |
| `Ticket` | categoria, modo (`ANONIMO` / `CON_CONTACTO`), rol (`VICTIMA` / `TESTIGO`), fecha, franja, lat/lng, barrioId, relato `@db.Text?`, quiereDenunciar, declaracionAceptada, estado, `sintetico`, `deletedAt` |
| `TicketDerivacion` | ticketId, organismo (un ticket de abuso sexual tiene dos) |
| `ContactoTicket` | ticketId, nombre/telefono/email/horario **cifrados**, `deletedAt` |
| `NotaTicket` | ticketId, autorId, texto |
| `HistorialEstado` | ticketId, de, a, autorId, fecha (auditoría) |
| `ServicioAsistencia` | nombre, tipo (comisaría, centro de salud, CAV, línea), teléfono, lat/lng, barrioId |
| `ReglaRecomendacion` | categoria, franja?, condición (tendencia/umbral), texto |

### 6.3 Alta del ticket (`POST /api/tickets`, público)

1. Valida con `CategoriaConfig`: si la categoría exige contacto, rechaza sin nombre, contacto y declaración jurada.
2. Valida que la ubicación esté dentro del ejido de San Salvador de Jujuy y asigna el `barrioId` (punto en polígono); fuera de la ciudad se rechaza con 422.
3. Rate limit de 5 tickets por IP por hora (contador guardado en MySQL, porque las funciones de Vercel no comparten memoria).
4. Si `quiereDenunciar`, el modo pasa a `CON_CONTACTO`.
5. Cifra el contacto y crea las derivaciones según la categoría. La bandeja del organismo lo muestra en el siguiente refresco (polling, decisión 22).
6. El mapa lo incluye en su siguiente refresco.
7. Respuesta: confirmación y recursos de urgencia (911, 144, 102). Sin código de seguimiento.

### 6.4 Operadores

- `GET /api/operador/tickets`: solo los derivados a su organismo, con filtros por estado y categoría.
- `GET /api/operador/tickets/:id`: detalle con el contacto descifrado; el acceso queda auditado.
- `PATCH /api/operador/tickets/:id/estado`: solo transiciones válidas hacia adelante (`NUEVO → CONTACTADO → DERIVADO → CERRADO`) y registra `HistorialEstado`.
- `POST /api/operador/tickets/:id/notas`.

### 6.5 Mapa de calor (referencia: captura UANL, "Mapa de calor. Colinas de San Bernabé")

- **Backend** `GET /api/mapa/calor?categoria&desde&hasta&franja&fuente`: une incidentes y tickets, los agrupa en una grilla de ~100 m y devuelve `[lat, lng, peso]` del centro de cada celda. **Nunca coordenadas exactas.**
- **Vista inicial:** toda la ciudad de San Salvador de Jujuy; al elegir un barrio se acerca a él.
- **Frontend:** `leaflet.heat` con un radio de ~150 m a zoom de barrio, sobre Carto Positron.
- **Rampa de 10 clases** de verde a rojo, con leyenda "Concentración Baja / Media / Alta" como en la referencia.
- **Elementos cartográficos:** contorno del barrio seleccionado, flecha de norte, escala gráfica y la fuente "Datos oficiales + reportes ciudadanos no verificados".
- **Puntos:** solo `ServicioAsistencia` (comisarías, centros de salud, CAV). Sin marcadores de hechos.
- **Filtros:** categoría, período, franja horaria y fuente.
- **Panel lateral:** conteo, tasa por 1.000 habitantes, variación porcentual contra el período anterior y recomendaciones situacionales del barrio.
- **Tiempo real:** la capa se vuelve a pedir cada `NEXT_PUBLIC_POLL_MS` (5 s) mientras la pestaña está visible.

### 6.6 Estadísticas (`CIUDADANO`, `ANALISTA`, `ADMIN`)

- `GET /api/estadisticas/tendencias`: serie mensual por categoría (solo meses completos, resta de meses sin desborde de día).
- `GET /api/estadisticas/barrios`: ranking de todos los barrios de la ciudad por tasa.
- `GET /api/estadisticas/franjas`: distribución por franja horaria.
- `GET /api/recomendaciones?barrioId`: reglas que se cumplen, explicables.

### 6.7 Administración (`ADMIN`)

CRUD de `User` (crea operadores y analistas), `Barrio`, `CategoriaConfig`, `ServicioAsistencia`, `ReglaRecomendacion` y carga masiva de `Incidente` (JSON hasta 5.000 filas, body de 5 MB). Supresión física de un ticket a pedido.

### 6.8 Quién ve qué

| Rol | Ve |
|---|---|
| `PUBLICO` | Mapa agregado, formulario, servicios de asistencia |
| `CIUDADANO` (P1) | Lo anterior + análisis de toda la ciudad: ranking de barrios, tendencias, franjas y recomendaciones (solo agregados) |
| `OPERADOR_SALUD` / `OPERADOR_POLICIA` | Solo tickets de su organismo, con el contacto |
| `ANALISTA` | Estadísticas y recomendaciones agregadas |
| `ADMIN` | Todo lo anterior + administración |

### 6.9 Seguridad transversal

Login con throttling (5 intentos/min, contador en MySQL), sesión en cookie httpOnly + `SameSite=Lax` (la app y la API comparten origen, no hace falta CORS), `ENCRYPTION_KEY` de 32 bytes en una variable de entorno, cada Route Handler valida su entrada con Zod y verifica el rol, nunca loguear datos de contacto. Sin Swagger: los esquemas Zod de `src/lib/schemas/` son el contrato de la API.

### 6.10 Pantallas (frontend)

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Mapa de calor + panel lateral + filtros | Público |
| `/reportar` | Formulario por pasos: categoría → ubicación en el mapa → detalle → contacto (si corresponde) → confirmación con recursos | Público |
| `/login` | Login | Público |
| `/operador` | Bandeja, detalle, estados y notas | Operadores |
| `/estadisticas` | Análisis de toda la ciudad: tendencias, ranking de barrios y franjas (Recharts) | Ciudadano (P1), Analista, Admin |
| `/admin/*` | CRUD de entidades | Admin |

## 7. Orquestación del código

Cada tarea = **un issue + una rama + un PR** con CI verde (`CONTRIBUTING.md`). Las fases se hacen en orden; dentro de cada fase, las tareas marcadas ∥ pueden correr en paralelo (por ejemplo, una persona con Claude Code en las pantallas y otra en la API). Todo vive en `web/`: "API" son Route Handlers en `src/app/api/` y "pantallas" son páginas en `src/app/`.

| Fase | Tarea | Rama | Depende de | Hecho cuando |
|---|---|---|---|---|
| 0 | T001 Base Next.js: app en `web/`, Prisma 6 con MySQL, Vitest, `.env.example`, CI, ECC; se elimina `backend/` | `chore/stack-nextjs` | — | `prisma validate`, lint, typecheck, test y build en verde |
| 0 ∥ | T002 Base de UI: shadcn/ui, tokens de diseño en `globals.css`, layout con navegación, helper `fetch` para la API | `feat/ui-base` | T001 | lint, typecheck y build en verde |
| 1 | T003 Esquema Prisma completo (§6.2) + tabla de rate limit, y primera migración | `feat/prisma-schema` | T001 | `migrate dev` aplica en MySQL limpio |
| 2 | T004 Auth JWT (cookie) por roles, `proxy.ts`, throttling, CRUD de usuarios (ADMIN) | `feat/auth-roles` | T003 | tests de acceso por rol |
| 2 ∥ | T005 Tickets: alta pública, reglas por categoría, cifrado, derivación | `feat/tickets` | T003 | tests de validación por categoría y derivación |
| 2 ∥ | T006 Mapa de calor, estadísticas y recomendaciones (§6.5 y §6.6) | `feat/mapa-estadisticas` | T003 | tests de agrupación (~100 m, sin coordenadas exactas) |
| 3 | T007 API de operador: bandeja, estados, notas, auditoría | `feat/operador` | T004, T005 | tests de transiciones y de acceso por organismo |
| 3 ∥ | T008 API de admin: barrios, categorías, servicios, reglas, carga masiva, supresión | `feat/admin-api` | T004 | tests de integración por rol |
| 4 ∥ | T009 Pantalla de mapa KDE, leyenda, filtros, panel lateral, refresco cada 5 s | `feat/front-mapa` | T002, T006 | se ve como la referencia, con datos de prueba |
| 4 ∥ | T010 Formulario público por pasos | `feat/front-reportar` | T002, T005 | crea tickets anónimos y con contacto |
| 4 ∥ | T011 Panel de operador | `feat/front-operador` | T002, T007 | cambia estados y agrega notas |
| 4 ∥ | T012 Estadísticas y panel admin | `feat/front-admin` | T002, T006, T008 | CRUD completo desde la UI |
| 5 | T013 **Precarga de datos ficticios**: barrios con polígonos, incidentes, tickets, servicios, reglas, usuarios demo | `feat/seed-demo` | todas las anteriores | `npm run seed` deja la demo lista |
| 6 | T014 Deploy: app en Vercel (Root Directory `web`) y MySQL en Railway | `chore/deploy` | T013 | URL pública funcionando |
| 6 ∥ | T015 Pitch y guion de la demo | `docs/pitch` | — | guion en `docs/` |
| P1 | T016 Rol `CIUDADANO`: registro y acceso a `/estadisticas` de toda la ciudad | `feat/ciudadano` | T013 | ve todos los barrios, solo agregados |
| P1 | T017 Informes agénticos: modelo `Informe`, evaluación por evidencia, agente redactor, revisión y entrega (ver [INFORMES-AGENTICOS.md](INFORMES-AGENTICOS.md) §5) | `feat/informes-agenticos` | T013 | informe aprobado visible para el organismo, sin datos personales en la entrada al modelo |

**Reglas para agentes (Devin, Claude Code):**
- Leer `AGENTS.md`, este plan y la spec antes de empezar una tarea.
- Con Claude Code, seguir el flujo ECC de `CLAUDE.md` (`/ecc:plan` → `tdd-workflow` → `/code-review` → verificación).
- No crear datos de demo antes de T013; los tests usan fixtures.
- No agregar nada de empresas de seguridad.
- Nunca enviar coordenadas exactas ni datos de contacto a endpoints públicos.
- Si una decisión de este plan no alcanza, preguntar antes de inventar.

## 8. Herramientas UX/UI para Claude Code

Se instalan en la máquina de quien ejecuta Claude Code. Si el marketplace oficial no aparece en `/plugin`, agregarlo con `/plugin marketplace add anthropics/claude-plugins-official`.

| Herramienta | Para qué | Instalación |
|---|---|---|
| **ECC** (`ecc@ecc`) | Flujo plan → tests → revisión → verificación, con agentes y skills | Ya declarado en `.claude/settings.json`; cada persona corre una vez `npx ecc-universal@2.2.3 install --guided --harness claude --claude-scope project --claude-hooks off --yes` (ver `CLAUDE.md`) |
| Plugin `frontend-design` (oficial de Anthropic) | Interfaces cuidadas, sin estética genérica | `/plugin install frontend-design@claude-plugins-official` |
| Plugin `playwright` (Microsoft) | Que Claude abra la app, saque capturas y verifique la UI | `/plugin install playwright@claude-plugins-official` |
| Plugin `figma` | Leer diseños y tokens desde Figma | `/plugin install figma@claude-plugins-official` |
| MCP de shadcn/ui | Buscar y agregar componentes del registro | `npx shadcn@latest mcp init --client claude` (dentro de `web/`) |

Librerías del proyecto (§6.1): shadcn/ui, Radix, Recharts, React Hook Form + Zod, Sonner, `leaflet.heat`, Lucide.

## 9. Seguimiento

Las tareas T001–T016 de §7 son los issues [#19–#34](https://github.com/Matias-Churquina/Hackaton-Tren-Solar/issues) (T001 = #19 … T016 = #34). Los issues #3–#16 del plan anterior quedaron cerrados.
