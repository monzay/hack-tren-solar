# Tasks: Tickets ciudadanos

Cada tarea corresponde a un issue de GitHub y a una rama propia. Orden, ramas y dependencias: [`docs/PLAN.md` §7](../../docs/PLAN.md).

## P0, entrega de hoy
- [x] T001 Base Next.js: app en `web/`, Prisma 6 con MySQL 8, Vitest, `.env.example`, CI, ECC; se elimina `backend/`
- [ ] T002 Base de UI: shadcn/ui, tokens en `globals.css`, layout con navegación, helper `fetch`
- [x] T003 Esquema Prisma completo (`User`, `Barrio`, `CategoriaConfig`, `Incidente`, `Ticket`, `TicketDerivacion`, `ContactoTicket`, `NotaTicket`, `HistorialEstado`, `ServicioAsistencia`, `ReglaRecomendacion`) + rate limit, y migración
- [ ] T004 Auth JWT (cookie) por roles, `proxy.ts`, throttling en login, CRUD de usuarios (ADMIN)
- [ ] T005 Tickets: `POST /api/tickets` público, reglas por categoría, declaración jurada, cifrado, derivación
- [ ] T006 Mapa de calor agrupado (~100 m), estadísticas y recomendaciones
- [ ] T007 Endpoints de operador: bandeja, estados, notas, auditoría
- [ ] T008 Endpoints de admin: barrios, categorías, servicios, reglas, carga masiva, supresión
- [ ] T009 Frontend: mapa KDE, leyenda, filtros, panel lateral, refresco cada 5 s
- [ ] T010 Frontend: formulario público por pasos
- [ ] T011 Frontend: panel de operador
- [ ] T012 Frontend: estadísticas y panel admin
- [ ] T013 Precarga de datos ficticios (solo con la lógica completa)
- [ ] T014 Deploy: app en Vercel y MySQL en Railway
- [ ] T015 Pitch y guion de la demo

## P1, si alcanza el tiempo
- [ ] T016 Rol `CIUDADANO`: registro y análisis de toda la ciudad (`/estadisticas`)

## Fuera de alcance
Resto de la provincia (el alcance es la ciudad de San Salvador de Jujuy), empresas de seguridad (rol, directorio, solicitudes de contacto), adjuntos, pagos, OSRM.
