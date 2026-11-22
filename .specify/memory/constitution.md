# Constitución — Hackaton Tren Solar (Inteligencia territorial Jujuy)

## Principios

### I. Privacidad primero (Ley 25.326)
Ningún dato personal se publica ni se comparte con terceros privados. Los mapas nunca reciben coordenadas exactas. Los mapas y las estadísticas muestran solo datos agregados por celda o zona. Los datos de contacto se cifran en reposo y los ve únicamente el operador asignado.

### II. Sin perfilamiento
El sistema no predice culpabilidad ni perfila personas. Las recomendaciones son reglas de prevención situacional, explicables.

### III. Datos sintéticos identificados
Todo dato de demo lleva `sintetico = true` y la interfaz lo avisa.

### IV. Calidad verificable
Cada cambio va en su propia rama y PR, con CI verde (lint, typecheck, test, build, `prisma validate`), según `CONTRIBUTING.md` y `AGENTS.md`.

### V. Simplicidad para la entrega
Hacer primero lo que se va a mostrar en la demo (P0). Todo lo que no entra en el alcance queda documentado en `docs/PLAN.md`.

## Stack
Una sola app Next.js 16 (React 19 + Tailwind + Leaflet en las pantallas; Route Handlers + Prisma 6 + MySQL 8 en la API); JWT por roles en cookie httpOnly; tiempo real por polling.

**Version**: 1.0.0 | **Ratified**: 2026-11-22 | **Last Amended**: 2026-11-22
