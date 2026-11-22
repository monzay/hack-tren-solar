# Hackatón Tren Solar

Plataforma de inteligencia territorial para la prevención del delito en San Salvador de Jujuy:
mapa de calor de incidentes agregados, reportes ciudadanos derivados a Salud y Policía,
panel de tendencias y recomendaciones de prevención situacional.

- `web/` — app Next.js 16 (pantallas + API) con Prisma 6 y MySQL 8
- `docs/` — plan y documentación del proyecto
- `specs/` — especificación (Spec Kit)
- `.claude/` — plugin ECC y sus reglas para Claude Code

```bash
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=jujuy mysql:8
cd web && npm ci && cp .env.example .env && npx prisma migrate dev && npm run dev
```

Ver [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) y [CONTRIBUTING.md](CONTRIBUTING.md).
