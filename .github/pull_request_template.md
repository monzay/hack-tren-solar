## Qué cambia

<!-- Resumen breve del cambio y por qué. -->

## Cómo se verificó

- [ ] `web`: `npx prisma validate`, lint, typecheck, test, build
- [ ] Probado manualmente (adjuntar captura si hay UI)
- [ ] Flujo ECC: plan aprobado (`/ecc:plan`), tests primero (`tdd-workflow`), revisión (`/code-review`)

## Checklist

- [ ] Una sola rama/objetivo por PR
- [ ] Sin secretos ni `.env` commiteados
- [ ] Variables nuevas agregadas a `web/.env.example` y a la tabla de `AGENTS.md`
- [ ] Migración Prisma incluida (si cambió el esquema)
- [ ] Privacidad: sin datos personales ni incidentes individuales en endpoints públicos
