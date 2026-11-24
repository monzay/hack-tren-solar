# Reglas para agentes trabajando en paralelo (ola 1)

Varios agentes trabajan **a la vez en la misma carpeta** `d:/Users/joel/Desktop/hack/Hackaton-Tren-Solar`. Cada uno tiene archivos asignados. Prioridad: **terminar rápido y que funcione para la demo**.

## Obligatorio

1. **Tocá solo tus archivos.** Si necesitás un cambio en un archivo ajeno o en un contrato, NO lo edites: anotalo en tu informe final.
2. **Contratos congelados (solo lectura):** `web/src/lib/schemas/index.ts` (endpoints, entradas y respuestas), `web/src/lib/dominio.ts` (enums, etiquetas, constantes), `web/src/lib/http.ts` (`ruta`, `leerJson`, `leerQuery`, `ErrorHttp`, `ipDe`), `web/src/lib/prisma.ts`, `web/src/lib/api.ts` (`apiFetch`, `ApiError`), `web/src/hooks/usePolling.ts`, `web/prisma/schema.prisma`, `web/package.json`.
3. **Firmas compartidas:** `lib/auth/sesion.ts` (`obtenerSesion`, `requiereSesion`), `lib/crypto.ts` (`cifrar`, `descifrar`), `lib/rate-limit.ts` (`consumir`), `lib/geo/poligono.ts` (`puntoEnPoligono`). Si no sos el dueño, importalas y usalas aunque todavía lancen "Pendiente": el dueño las implementa en paralelo. El dueño NO cambia la firma.
4. **Prohibido:** `npm install`, `npm run build`, `npm run dev`, levantar servidores, comandos de git que escriban (commit, checkout, stash, reset, add). Opus integra y commitea.
5. **Verificación rápida, solo de lo tuyo:**
   - `cd web && npx tsc --noEmit` → corregí SOLO errores en tus archivos (los de otros agentes pueden aparecer a medio hacer: ignoralos).
   - `npx eslint <tus rutas>`
   - `npx vitest run <tus tests>` solo si escribiste tests.
6. **Tests: solo los indicados en tu tarea** (privacidad y reglas de negocio). Nada de tests de UI.
7. Leé `AGENTS.md` (reglas de privacidad 12–17 y de pantallas 19–24) y la sección de tu tarea en `docs/PLAN.md`. Textos en español rioplatense.

## Next.js 16 (cambió respecto de lo que conocés)

- Ante la duda, leé `web/node_modules/next/dist/docs/` (route handlers: `01-app/01-getting-started/15-route-handlers.md`, proxy: `16-proxy.md`, cookies: `01-app/03-api-reference/04-functions/cookies.md`).
- Route Handler: `export const GET = ruta(async (req: Request) => Response.json(datos));`
- Con parámetros: `ruta(async (req: Request, ctx: { params: Promise<{ id: string }> }) => { const { id } = await ctx.params; ... })`.
- `cookies()` de `next/headers` es async: `const c = await cookies()`.
- `cacheComponents` activado: en páginas, lo que lee cookies o la base va dentro de `<Suspense>`; lo más simple es que la página sea un Client Component que pide a la API con `apiFetch`.
- Leaflet: componente `"use client"` cargado con `next/dynamic(() => import(...), { ssr: false })` desde otro Client Component.

## Datos

- Prisma `Decimal` → `Number(valor)` antes de responder.
- Fechas en las respuestas como ISO string.
- Base local: MySQL en `localhost:3307` (ya migrada, vacía). `web/.env` ya existe con `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`.
- Usuarios demo (los crea el seed, contraseña `demo1234`): `admin@demo.ar`, `salud@demo.ar`, `policia@demo.ar`, `analista@demo.ar`, `ciudadano@demo.ar`.

## Informe final (tu último mensaje es lo único que lee Opus)

- Archivos creados o modificados.
- Resultado de tsc/eslint/vitest sobre tus archivos.
- Pedidos de cambio en contratos o archivos ajenos.
- Supuestos que tomaste.
