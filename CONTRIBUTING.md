# Reglas de ramas, merge y verificación

## Ramas

- `main` es la rama protegida y siempre debe estar desplegable.
- **Cada cambio va en su propia rama** creada desde `main` actualizado:

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feat/` | Funcionalidad nueva | `feat/mapa-calor` |
| `fix/` | Corrección de bug | `fix/login-token-expirado` |
| `docs/` | Documentación | `docs/agents-md` |
| `chore/` | Configuración, dependencias, CI | `chore/ci-backend` |
| `refactor/` | Cambios internos sin cambiar comportamiento | `refactor/servicio-incidentes` |

- Una rama = un objetivo. Si aparece otro cambio, abrir otra rama.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/es/): `tipo(ámbito): descripción`.

```
feat(backend): endpoint de heatmap agregado por zona
fix(frontend): filtro de período no reiniciaba el mapa
```

## Pull Requests

1. Abrir PR contra `main` usando la plantilla.
2. Título en formato Conventional Commits.
3. Describir qué cambia, cómo se verificó y capturas si hay cambios de UI.
4. Mantener el PR chico y enfocado (idealmente < 400 líneas cambiadas, sin contar lockfiles).

## Verificación obligatoria (antes de pedir revisión)

Dentro de `web/`:

`npx prisma validate` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`

Además:
- Si cambia el esquema Prisma, incluir la migración generada.
- Si cambia la API, actualizar el esquema Zod correspondiente en `web/src/lib/schemas/`.
- Si cambia la UI, probar en el navegador y adjuntar captura.
- Checklist de privacidad: sin datos personales, sin incidentes individuales en endpoints públicos, umbral `MIN_COUNT` respetado.

## Reglas de merge

- **CI en verde** (workflow `CI`) es requisito.
- **Al menos 1 aprobación** de otro integrante del equipo. El autor no aprueba su propio PR.
- Todos los comentarios de revisión resueltos.
- Rama actualizada con `main` (rebase o merge de `main`) y sin conflictos.
- Estrategia: **Squash and merge**, con el título del PR como mensaje.
- Borrar la rama después del merge.
- Prohibido: push directo a `main`, `force-push` a `main`, mergear con CI en rojo.

## Configuración sugerida en GitHub

Settings → Branches → regla para `main`:
- Require a pull request before merging (1 approval)
- Require status checks to pass: `web`
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Allow only squash merging
