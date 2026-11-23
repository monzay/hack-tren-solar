# Optimización de agentes: prototipo funcional en 60 minutos

> Objetivo: **demo funcional en 1 hora**, no producto completo. La presentación es una **simulación**: todos los datos son ficticios (`sintetico = true`) y no se incluyen textos legales. Este documento **recorta** el alcance de [`PLAN.md`](PLAN.md) y reparte el trabajo entre agentes de **Claude Code** según el modelo.
> Las reglas de [`AGENTS.md`](../AGENTS.md) siguen vigentes (privacidad, ~100 m, sin coordenadas exactas, `sintetico = true`, una rama por tarea, el usuario mergea).
> **Supuesto de stack:** el de `main` (NestJS + Prisma, React + Vite). Si la implementación del compañero usa otro (por ejemplo, Next.js), se mantienen los agentes, los contratos y los tiempos y solo cambian las rutas de archivos.

## 1. Atajos para llegar en una hora

| # | Atajo | Ahorro |
|---|---|---|
| 1 | **Reutilizar el backend de `main`** (PR #2) en vez del reset T001: cambiar `provider` a `mysql`, conservar auth JWT, `agregacion.ts`, `reglas.ts`, Swagger y Socket.IO | ~20 min |
| 2 | **Contratos de API y esquema fijados en el minuto 0–10** (§3), así backend y frontend trabajan en paralelo sin esperarse | Evita bloqueos |
| 3 | **Un agente = una rama = un `git worktree`**, con archivos que no se pisan (§4) | Evita conflictos |
| 4 | Demo **local** con Docker MySQL. Deploy solo si sobra tiempo | ~10 min |
| 5 | Admin **sin UI**: entidades por seed y Swagger | ~15 min |
| 6 | Modelo barato (Haiku) para tareas mecánicas, el caro (Opus) solo para diseño, integración y revisión de privacidad | Costo y velocidad |

## 2. Alcance de la demo

**Entra (P0-demo)**
- `/` Mapa KDE de toda la ciudad (`leaflet.heat`), con filtros de categoría y franja horaria, leyenda verde→rojo, fuente visible y puntos de asistencia.
- `/reportar` Formulario público: anónimo (abuso sexual, violencia de género e intrafamiliar) o con contacto (resto, con una casilla de declaración simulada, sin texto legal). Derivación automática por categoría.
- `/operador` Login y bandeja filtrada por organismo; cambio de estado `NUEVO → CONTACTADO → DERIVADO → CERRADO` y nota interna.
- `/estadisticas` Barras por categoría, línea por mes, variación frente al período anterior y recomendaciones situacionales.
- Seed sintético (al final, con la lógica completa).

**Queda afuera de la demo:** textos legales (declaración jurada y aviso de privacidad), panel admin con UI (T008/T012 → Swagger), rol `CIUDADANO` (T016), auditoría detallada (solo `actualizadoPor`), deploy (T014), polígonos de barrios dibujados (se usan centroides).

## 3. Contratos (los fija Opus en el minuto 0–10 y no se cambian)

**Esquema Prisma mínimo (MySQL):** `Usuario(rol, organismo)`, `Barrio(nombre, lat, lng)`, `Incidente(categoria, fecha, franja, lat, lng, barrioId, fuente OFICIAL|CIUDADANO, sintetico)`, `Ticket(categoria, modo ANONIMO|CONTACTO, rolPersona VICTIMA|TESTIGO, lat, lng, barrioId, fecha, franja, relato?, contactoCifrado?, declaracion, estado, organismos, sintetico, eliminadoEn?)`, `NotaTicket`, `ServicioAsistencia`.

| Método y ruta | Rol | Respuesta (nunca coordenadas exactas ni contacto) |
|---|---|---|
| `GET /api/mapa/calor?categoria&franja&desde&hasta` | Público | `[{ lat, lng, peso }]` redondeado a ~100 m, oficial + ciudadano |
| `GET /api/estadisticas?categoria&desde&hasta` | Público | `{ porCategoria, porMes, porFranja, variacionPct }` |
| `GET /api/recomendaciones?barrioId` | Público | `[{ texto, motivo }]` |
| `GET /api/asistencia` | Público | Comisarías, centros de salud, CAV |
| `POST /api/tickets` | Público | `{ id, derivadoA: ['POLICIA' \| 'SALUD'] }` |
| `POST /api/auth/login` | — | `{ token, rol, organismo }` |
| `GET /api/operador/tickets` | Operador | Solo su organismo, con el contacto descifrado |
| `PATCH /api/operador/tickets/:id` | Operador | `{ estado, nota? }` |

Socket.IO: evento `mapa:actualizado` **sin payload personal**. El front vuelve a pedir `/api/mapa/calor`.

## 4. Agentes por modelo

| Agente | Modelo | Por qué ese modelo | Tarea | Rama | Archivos propios |
|---|---|---|---|---|---|
| **A0 Arquitecto / integrador** | `opus` | Decisiones, contratos, merge y riesgos de privacidad | Esquema Prisma MySQL, contratos §3, `docker-compose.yml`, `.env.example`; luego integra y revisa | `chore/demo-base` | `backend/prisma/`, `docker-compose.yml`, `docs/` |
| **A1 Backend tickets** | `sonnet` | Lógica con reglas y tests | `POST /api/tickets` (validación por categoría, cifrado AES-256-GCM, derivación), endpoints de operador | `feat/tickets` | `backend/src/tickets/`, `backend/src/operador/` |
| **A2 Backend mapa** | `sonnet` | Agregación y estadística | `/mapa/calor` (grilla ~100 m), `/estadisticas`, `/recomendaciones`; adapta `agregacion.ts` y `reglas.ts` | `feat/mapa-estadisticas` | `backend/src/mapa/`, `backend/src/estadisticas/`, `backend/src/recomendaciones/` |
| **A3 Front mapa y estadísticas** | `sonnet` + plugin `frontend-design` | UI cuidada como la referencia | Base Vite + Tailwind + shadcn, layout, `/` y `/estadisticas` | `feat/front-mapa` | `frontend/src/pages/Mapa*`, `frontend/src/pages/Estadisticas*`, `frontend/src/components/mapa/` |
| **A4 Front reportar y operador** | `sonnet` | Formularios con reglas | `/reportar` (React Hook Form + Zod) y `/operador` | `feat/front-reportar-operador` | `frontend/src/pages/Reportar*`, `frontend/src/pages/Operador*` |
| **A5 Contenido y seed** | `haiku` | Tarea mecánica | Recursos 911/144/102, servicios de asistencia, README "cómo correr la demo"; **seed sintético solo en el minuto 40** | `feat/seed-demo` | `backend/prisma/seed.ts`, `README.md` |
| **A6 QA** | `haiku` | Correr checks y reportar | Lint, build y tests de cada rama; capturas a 390 y 1280 px con plugin `playwright`; busca en Network coordenadas exactas o contactos | — (solo lee) | — |
| **A7 Pitch** | `haiku` | Texto | Ajusta `docs/PITCH.md` a lo que realmente quedó en pantalla | `docs/pitch` | `docs/PITCH.md` |

**Regla de escalamiento:** si un agente Sonnet o Haiku necesita cambiar el esquema o un contrato, **no lo cambia**: le pregunta a A0 (Opus).

## 5. Cronograma (60 min)

| Minuto | Opus (A0) | Sonnet (A1–A4) | Haiku (A5–A7) |
|---|---|---|---|
| 0–10 | Esquema MySQL, contratos, Docker, `.env.example`. PR `chore/demo-base` | Leen `AGENTS.md`, este doc y la spec. A3 arma la base del front con mocks de §3 | A5 arma recursos de asistencia y el README de la demo |
| 10–40 | Revisa PRs a medida que llegan y resuelve dudas de contrato | A1, A2, A3 y A4 en paralelo, cada uno en su worktree y con tests | A6 corre checks de cada PR. A5 prepara el seed (sin correrlo) |
| 40–48 | Integra: mergea en orden A0 → A1 → A2 → A3 → A4, front contra API real | Arreglan lo que rompa la integración | A5 corre el seed: 4 barrios, ~300 incidentes y tickets, usuarios demo |
| 48–55 | Revisión final de privacidad (respuestas públicas y Socket.IO) | Ajustes visuales | A6: capturas a 390 y 1280 px y verificación en Network |
| 55–60 | Visto bueno | — | A7 ajusta el pitch. Ensayo de la demo |

## 6. Cómo lanzarlos en Claude Code

Un worktree y una terminal por agente:

```bash
git worktree add ../ts-tickets -b feat/tickets main
cd ../ts-tickets && claude --model sonnet
```

O como subagentes del proyecto, en `.claude/agents/<nombre>.md` (Claude Code usa el campo `model`):

```markdown
---
name: backend-tickets
description: Implementa POST /api/tickets y los endpoints de operador según docs/AGENTES.md §3. Usar para la lógica de tickets.
model: sonnet
---
Leé AGENTS.md, docs/PLAN.md §6 y docs/AGENTES.md. Trabajá solo en backend/src/tickets y backend/src/operador.
No cambies el esquema ni los contratos: si hace falta, consultá al arquitecto.
Nunca devuelvas coordenadas exactas ni contacto en rutas públicas. Escribí tests de validación por categoría y de derivación.
```

Cada agente tiene el mismo esqueleto. Solo cambian `name`, `model` (`opus`, `sonnet` o `haiku` según §4) y la carpeta propia.

**Prompt de arranque para A0 (Opus):**
> Leé `AGENTS.md`, `docs/PLAN.md` y `docs/AGENTES.md`. Implementá solo §3: esquema Prisma para MySQL, `docker-compose.yml` con MySQL 8 y `.env.example`. Reutilizá el backend de `main`. Abrí el PR `chore/demo-base` y no toques carpetas de otros agentes.

## 7. Checklist de "demo lista"

- [ ] `docker compose up -d && npm run seed` deja datos sintéticos marcados.
- [ ] El mapa muestra densidad, sin marcadores de hechos y con la fuente visible.
- [ ] Se puede reportar un caso anónimo y otro con contacto; el mapa se actualiza.
- [ ] El operador de Policía no ve los tickets de Salud, y al revés.
- [ ] En Network no aparecen coordenadas exactas ni contactos en rutas públicas.
- [ ] Capturas a 390 y 1280 px.
