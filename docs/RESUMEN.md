# Resumen de avance (22/11/2026)

Estado del proyecto para que cualquier integrante (persona o agente) pueda retomar. Fuente de verdad: [`PLAN.md`](PLAN.md).

## Qué cambió

| Antes | Ahora | Por qué |
|---|---|---|
| Backend NestJS + frontend Vite (2 apps) | **Una sola app Next.js 16 en `web/`** (pantallas + API en Route Handlers) | Más simple y rápido para la entrega; un solo deploy en Vercel (decisión 21) |
| PostgreSQL | **MySQL 8 + Prisma 6** | Ya estaba decidido en el plan; Prisma 7 pide adaptadores extra |
| Socket.IO | **Polling cada 5 s** | Vercel no mantiene conexiones abiertas; cumple SC-003 (< 5 s) (decisión 22) |
| Swagger + class-validator | **Esquemas Zod** compartidos entre formulario y API | Un solo contrato |
| Sin flujo común de agentes | **ECC** (`ecc@ecc`) a nivel proyecto, **sin hooks** | Plan → tests → revisión → verificación en cada tarea (decisión 23, ver `CLAUDE.md`) |

## Tareas

| Tarea | Estado |
|---|---|
| T001 Base Next.js + Prisma + Vitest + CI + ECC | ✅ Hecha: lint, typecheck, 7 tests y build en verde |
| T003 Esquema completo (9 enums, 13 modelos) + migración inicial | ✅ Hecha: `prisma validate` y build en verde. **Falta aplicar la migración en un MySQL real** |
| T002 Base de UI | ✅ Hecha |
| T004 a T013 y T015 | ✅ Hechas: API, pantallas, datos de demo y pitch; build de producción y prueba de punta a punta en verde |
| T014 Deploy | ⬜ Pendiente: requiere acceso a GitHub, Vercel y Railway |
| T016 Rol Ciudadano | ⬜ Opcional (P1) |

## Cómo levantarlo

```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=jujuy mysql:8
cd web && npm ci && cp .env.example .env && npx prisma migrate dev && npm run dev
```

App y API en `http://localhost:3000` (salud: `/api/health`).

En Windows, si el lint marca miles de errores `Delete ␍`, son saltos de línea CRLF: el repo ahora tiene `.gitattributes` que fuerza LF; volver a clonar o hacer `git rm --cached -r . && git reset --hard`.

## Próximos pasos (en orden)

1. Terminar **T002** y aplicar la migración de **T003** en MySQL.
2. **Fase 2 en paralelo:** T004 login y roles · T005 alta de tickets · T006 mapa y estadísticas.
3. **Fase 3:** T007 API de operador · T008 API de admin.
4. **Fase 4 (pantallas):** T009 mapa · T010 formulario · T011 operador · T012 estadísticas y admin.
5. T013 datos ficticios → T014 deploy (Vercel + Railway) → T015 pitch.

Estimado restante: **3,5 a 5 horas**. Si no alcanza el tiempo, priorizar lo que se ve en la demo: T005 + T010 (reportar), T006 + T009 (mapa), T007 + T011 (operador), T013 (datos).

## Cómo ir más rápido

- **Dividir el trabajo entre personas, no solo entre agentes:** con el plan cerrado, cada integrante toma una tarea ∥ de §7 en su máquina con Claude Code + ECC.
- **Red:** la mayor demora fue la red (cortes en npm y Docker). Usar una conexión estable, y `npm install --prefer-offline --fetch-retries=5`.
- **Una sola carpeta por persona:** copiar `node_modules` entre worktrees en Windows tarda varios minutos; mejor una rama por vez en el mismo checkout.
- **Recortar alcance:** el admin completo (T008/T012) y el rol Ciudadano (T016) pueden quedar mínimos o afuera si aprieta el tiempo.

## Decisiones abiertas (responder en `PLAN.md` §3)

1. **Barrios:** polígonos reales (OpenStreetMap) o aproximados ficticios. Supuesto actual: aproximados.
2. **Límite de la ciudad** para rechazar reportes de afuera (422): supuesto actual, la unión de los barrios.
3. **Datos oficiales:** supuesto actual, todo sintético (`sintetico = true`), sin datos reales del SNIC.
4. **Deploy:** quién tiene cuentas de Vercel y Railway.
