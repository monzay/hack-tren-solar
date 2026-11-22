# AGENTS.md

Guía obligatoria para agentes de IA (Devin, Claude Code, Copilot) y personas que codifican en este repositorio.

**Antes de escribir código, leer en este orden:**
1. [docs/PLAN.md](docs/PLAN.md): decisiones, modelo de datos, API, pantallas y **orden de tareas (§7)**. Es la fuente de verdad.
2. [specs/001-tickets-ciudadanos/spec.md](specs/001-tickets-ciudadanos/spec.md): user stories y requisitos funcionales.
3. [CONTRIBUTING.md](CONTRIBUTING.md): ramas, commits, PR y merge.
4. [.specify/memory/constitution.md](.specify/memory/constitution.md): principios no negociables.
5. Con Claude Code: el flujo ECC de [CLAUDE.md](CLAUDE.md).

Si este archivo y `docs/PLAN.md` se contradicen, manda `docs/PLAN.md`, y hay que corregir este archivo en el mismo PR. Si las reglas de ECC (`.claude/rules/ecc/`) contradicen este archivo o el plan, mandan este archivo y el plan.

## Producto en una línea

Mapa de calor y estadísticas del delito en la **ciudad de San Salvador de Jujuy**, que combina datos oficiales con reportes ciudadanos (anónimos o con contacto) derivados a **Salud** o **Policía**.

## Alcance

- **Dentro:** ciudad de San Salvador de Jujuy; formulario público de tickets; derivación; panel de operadores; mapa KDE; estadísticas; panel ADMIN; precarga de datos ficticios.
- **Fuera:** resto de la provincia, empresas de seguridad (rol, directorio, contacto), adjuntos, pagos/MercadoPago, OSRM, categorías nuevas (acoso, violencia institucional, maltrato infantil).

## Stack

Una sola app **Next.js** en `web/` (decisión 21 del plan).

| Capa | Tecnología |
|---|---|
| App | **Next.js 16** (App Router, Turbopack) · **React 19** · TypeScript estricto |
| UI | Tailwind CSS v4 (tokens con `@theme` en `src/app/globals.css`) · shadcn/ui (Radix) · Lucide · Sonner |
| Mapa y gráficos | React-Leaflet 5 + `leaflet.heat` (solo cliente) · Recharts |
| Formularios y validación | React Hook Form + **Zod** (mismo esquema en el formulario y en el Route Handler) |
| API | Route Handlers en `src/app/api/**/route.ts` |
| Datos | **Prisma 6 + MySQL 8** |
| Auth | JWT con `jose` en cookie httpOnly · `bcryptjs` · `src/proxy.ts` |
| Tests | Vitest · Playwright para E2E de pantallas |
| Infra | Docker (`mysql:8`) en local · Vercel (app) · Railway (solo MySQL) · GitHub Actions |

No usar NestJS, Vite como app aparte, el Pages Router, TypeORM, PostgreSQL, Socket.IO, Axios ni Prisma 7.

**Next.js 16 cambió APIs y convenciones.** Antes de usar una API, leer la guía correspondiente en `web/node_modules/next/dist/docs/` (por ejemplo, `middleware.ts` ahora es `proxy.ts`, y `cacheComponents` está activado).

## Estructura objetivo

```
web/
  prisma/schema.prisma          # único esquema; migraciones en prisma/migrations
  prisma/seed.ts                # solo en T013
  src/
    proxy.ts                    # redirecciones optimistas por sesión (no autoriza por sí solo)
    app/
      layout.tsx  page.tsx      # / = mapa de calor
      reportar/  login/  operador/  estadisticas/  admin/
      api/                      # Route Handlers: tickets/ operador/ mapa/ estadisticas/
                                #   recomendaciones/ servicios/ admin/ auth/ health/
    components/ui/              # componentes shadcn/ui (generados, no editar a mano salvo estilo)
    components/                 # componentes compartidos (Mapa, Leyenda, Layout…)
    features/                   # mapa/ reportar/ operador/ estadisticas/ admin/ auth/
    lib/
      prisma.ts                 # cliente único de Prisma
      schemas/                  # esquemas Zod = contrato de la API
      auth/                     # sesión JWT, verificación de rol
      crypto/                   # AES-256-GCM para contactos
      geo/                      # punto en polígono, grilla, agregación
      rate-limit/               # contador en MySQL
    hooks/                      # useMapaCalor, useTickets… (polling)
docs/  specs/  .specify/  .github/  .claude/
```

Cada Route Handler: valida la entrada con Zod, verifica el rol, delega en una función de `lib/` o `features/` con su `*.test.ts`.

## Puesta en marcha

```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=jujuy mysql:8
cd web && npm ci && cp .env.example .env && npx prisma migrate dev && npm run dev
```

App y API en `http://localhost:3000` (API bajo `/api`).

### Variables de entorno (`web/.env`)

| Variable | Ejemplo / nota |
|---|---|
| `DATABASE_URL` | `mysql://root:root@localhost:3306/jujuy` |
| `JWT_SECRET` | cadena larga aleatoria |
| `JWT_EXPIRES_IN` | `8h` |
| `ENCRYPTION_KEY` | 32 bytes en base64 (`openssl rand -base64 32`) para cifrar contactos |
| `MIN_COUNT` | `1` |
| `NEXT_PUBLIC_POLL_MS` | `5000` (refresco del mapa y la bandeja) |

Toda variable nueva va a `web/.env.example` y a esta tabla. Solo las que lleva el navegador empiezan con `NEXT_PUBLIC_`; nunca un secreto.

## Comandos de verificación

Dentro de `web/`, antes de abrir el PR:

`npx prisma validate` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`

Otros: `npx prisma migrate dev --name <nombre>` (cambio de esquema), `npm run seed` (desde T013).

## Flujo de trabajo por tarea

1. Elegir la próxima tarea de `docs/PLAN.md` §7 **cuyas dependencias estén mergeadas**. Si trabajan dos personas, cada una toma tareas distintas (las marcadas ∥) y lo avisa en el issue.
2. `git checkout main && git pull && git checkout -b <rama de la tabla §7>`.
3. Planificar (con Claude Code: `/ecc:plan`) y esperar aprobación.
4. Implementar **solo** esa tarea, con tests primero. Si aparece otro cambio, va en otra rama.
5. Revisar (`/code-review`) y correr la verificación.
6. Commits en Conventional Commits (`feat(web): …`, `feat(api): …`), PR contra `main` con la plantilla, enlazando el issue.
7. Marcar la tarea en `specs/001-tickets-ciudadanos/tasks.md` en el mismo PR.

**Hecho** = criterio de la columna "Hecho cuando" de §7 + CI verde + docs actualizadas.

## Reglas de código

### Generales
1. TypeScript estricto, sin `any` salvo justificación en el PR.
2. Textos de UI, mensajes de error y nombres de dominio en **español** (`Ticket`, `Barrio`, `organismo`); código de infraestructura en inglés si es convención del framework.
3. Dependencias estables y justificadas en el PR. Nada que no esté en el stack sin preguntar.
4. Sin código muerto, sin `console.log` en commits.

### API y datos
5. **Prisma es el único acceso a datos.** Sin SQL crudo salvo justificación. Cambios de esquema solo en `schema.prisma` con su migración. No editar migraciones ya mergeadas.
6. **MySQL:** lat/lng como `Decimal(9,6)`; textos largos con `@db.Text`; polígonos como `Json`. Sin tipos espaciales: punto en polígono y grilla se calculan en `src/lib/geo`.
7. Prefijo `/api`. Cada Route Handler valida con un esquema Zod de `src/lib/schemas/` y responde errores en español con el código HTTP correcto (400, 401, 403, 404, 422, 429).
8. Auth: sesión JWT (`jose`) en cookie httpOnly, `Secure` en producción y `SameSite=Lax`. Roles: `CIUDADANO`, `OPERADOR_SALUD`, `OPERADOR_POLICIA`, `ANALISTA`, `ADMIN` (lo público va sin sesión). **Cada Route Handler protegido verifica el rol**; `proxy.ts` solo redirige. Contraseñas con bcryptjs.
9. Login con throttling de 5 intentos por minuto; `POST /api/tickets` con 5 por IP por hora. Los contadores se guardan en MySQL (las funciones de Vercel no comparten memoria).
10. Tiempo real por polling cada `NEXT_PUBLIC_POLL_MS`: la bandeja de operadores y el mapa vuelven a pedir datos; el endpoint de la bandeja solo devuelve tickets del organismo de la sesión.
11. Fechas: meses completos y resta de meses sin desborde de día (ver `ultimosMeses` en `src/lib/geo/agregacion.ts`).

### Privacidad (Ley 25.326), no negociable
12. Ningún endpoint público devuelve **coordenadas exactas, datos de contacto, relatos ni tickets individuales**. El mapa recibe puntos agrupados en una grilla de ~100 m.
13. Datos de contacto cifrados con AES-256-GCM (`src/lib/crypto`); solo se descifran en `GET /api/operador/tickets/:id` para el organismo derivado, y el acceso se audita.
14. Nunca loguear datos de contacto ni relatos.
15. Sin perfilamiento: las recomendaciones son reglas situacionales explicables, sin predicción sobre personas.
16. Todo dato ficticio lleva `sintetico = true`.
17. Los datos sensibles se leen solo en el servidor (Route Handlers o Server Components); nunca se pasan a un Client Component más campos de los que la pantalla muestra.

### Datos de demo
18. **No crear seed ni datos de demo antes de T013.** Los tests usan fixtures propios dentro del `*.test.ts`.

### Pantallas
19. Componentes en `PascalCase.tsx`, un componente por archivo. Lógica de datos en hooks (`useMapaCalor`, `useTickets`…). Server Components por defecto; `"use client"` solo donde haya estado, eventos o Leaflet.
20. Estilos solo con Tailwind + tokens de `globals.css`; componentes base de shadcn/ui. Íconos de Lucide.
21. Formularios con React Hook Form + Zod, reutilizando los esquemas de `src/lib/schemas/`.
22. Mapa: `leaflet.heat` con rampa de 10 clases de verde a rojo, leyenda Baja/Media/Alta, norte, escala y fuente "Datos oficiales + reportes ciudadanos no verificados" (ver `docs/PLAN.md` §6.5). Sin marcadores de hechos. Se carga con `next/dynamic` y `ssr: false`.
23. Accesible: labels en todos los inputs, contraste AA, navegable con teclado, responsive (mobile first: el formulario se usa desde el celular).
24. El formulario muestra siempre los recursos de urgencia (911, 144, 102) y aclara que **no es una denuncia formal**.

## Git

- Nunca commitear ni pushear a `main`; nunca `force-push` a `main`.
- Nunca commitear `.env`, claves ni datos reales de personas.
- Mantener la documentación al día: si cambia un comando, endpoint o variable, actualizar este archivo o `docs/`.

## Cuándo preguntar

Si `docs/PLAN.md` no cubre una decisión de producto, privacidad o modelo de datos, **preguntar antes de inventar** y dejar la respuesta registrada en `docs/PLAN.md` §3.
