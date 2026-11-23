# CLAUDE.md

Instrucciones para Claude Code. Las reglas del proyecto están en `AGENTS.md` y el plan en `docs/PLAN.md`: se importan acá y son obligatorias.

@AGENTS.md
@docs/PLAN.md

## Prioridad entre reglas

1. `docs/PLAN.md` (decisiones, alcance, orden de tareas)
2. `AGENTS.md` (stack, privacidad, reglas de código)
3. Este archivo
4. Las reglas de ECC en `.claude/rules/ecc/` (estilo y buenas prácticas generales)

Ajustes a ECC para este proyecto (la entrega es hoy):
- **Cobertura:** no se exige el 80% de ECC. Sí son obligatorios los tests de cada criterio "Hecho cuando" de §7 y los de privacidad (SC-002 y SC-004).
- **E2E:** solo los flujos críticos (reportar un ticket, bandeja del operador), con Playwright.
- **Investigación previa:** no hace falta buscar en GitHub ni escribir un PRD: el plan y la spec ya existen. Sí hay que leer la documentación de Next en `web/node_modules/next/dist/docs/` antes de usar una API.
- **Subagentes:** usarlos solo cuando aporten (revisión con contexto limpio, tareas independientes). No lanzar agentes en paralelo por costumbre.
- **Commits:** Conventional Commits con ámbito, como pide `CONTRIBUTING.md` (`feat(api): …`).

## Instalar ECC (una vez por persona)

El plugin ya está declarado en `.claude/settings.json`. Para dejarlo igual que el resto del equipo, **sin hooks automáticos**:

```bash
npx ecc-universal@2.2.3 install --guided --harness claude --claude-scope project --claude-hooks off --yes
```

Los hooks se apagan en la configuración de usuario de cada persona (`pluginConfigs` en `~/.claude/settings.json`): el repo no puede apagarlos por vos. Con hooks, ECC reformatea archivos solo, reescribe comandos y envía texto de la conversación a un LLM externo. Verificar con `/plugin list` que `ecc@ecc` aparece habilitado.

## Cómo trabajar una tarea con ECC

1. **Elegir la tarea.** Decir qué tarea de `docs/PLAN.md` §7 vas a hacer y confirmar que sus dependencias ya están en `main`.
2. **Rama.** Crear la rama de la tabla §7 desde `main` actualizado. Una tarea por rama y por PR.
3. **Planificar.** `/ecc:plan "T00X <título de la tarea>"`. El plan lista archivos a crear o tocar, tests a escribir y riesgos, y **espera aprobación** antes de tocar código. Para revisar el plan en el navegador: `/ecc:plan-canvas`.
4. **Tests primero.** Skill `ecc:tdd-workflow`: test que falla (RED) → código mínimo (GREEN) → refactor. Si el build se rompe: `/ecc:build-fix`.
5. **Revisión.** `/ecc:code-review` con contexto limpio. Corregir los hallazgos CRITICAL y HIGH con un test de regresión.
6. **Privacidad.** En tareas que tocan tickets, contactos, sesión o endpoints públicos (T004, T005, T006, T007, T008): `/ecc:security-scan` o skill `ecc:security-review`, más el checklist de privacidad de `AGENTS.md`.
7. **Verificación.** Dentro de `web/`: `npx prisma validate` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` (o `/ecc:quality-gate`).
8. **PR.** Abrir el PR con `gh pr create` usando `.github/pull_request_template.md`.
9. **Sesiones largas.** `/ecc:save-session` al cortar y `/ecc:resume-session` al retomar.

Skills de ECC útiles para este stack: `ecc:nextjs-turbopack`, `ecc:prisma-patterns`, `ecc:mysql-patterns`, `ecc:api-design`, `ecc:react-patterns`, `ecc:react-testing`, `ecc:e2e-testing`, `ecc:frontend-patterns`.

## Otras herramientas recomendadas

| Herramienta | Uso en este repo | Instalación |
|---|---|---|
| Plugin `frontend-design` | Diseñar pantallas (§6.10 del plan) con buena calidad visual, respetando los tokens de `globals.css` y shadcn/ui | `/plugin install frontend-design@claude-plugins-official` |
| Plugin `playwright` | Abrir `http://localhost:3000`, sacar capturas y verificar cada pantalla antes del PR | `/plugin install playwright@claude-plugins-official` |
| Plugin `figma` | Leer diseños y tokens si hay archivo de Figma | `/plugin install figma@claude-plugins-official` |
| MCP de shadcn/ui | Agregar componentes del registro (`button`, `dialog`, `form`, `table`…) | `npx shadcn@latest mcp init --client claude` dentro de `web/` |

Si el marketplace no aparece: `/plugin marketplace add anthropics/claude-plugins-official`.

## Verificación de UI

- Toda pantalla nueva se prueba con Playwright en 390 px (celular) y 1280 px (escritorio), y la captura va en el PR.
- El mapa se compara con la referencia de §6.5 del plan (rampa verde→rojo, leyenda, norte, escala, fuente).
- Revisar en DevTools → Network que ninguna respuesta pública tenga coordenadas exactas ni datos de contacto.

## No hacer

- No pushear a `main` ni mergear PRs.
- No crear datos de demo antes de T013.
- No agregar nada de empresas de seguridad ni del resto de la provincia.
- No instalar dependencias fuera del stack de `AGENTS.md` sin preguntar.
- No desactivar lint, tests ni reglas de TypeScript para que pase el CI.
- No activar los hooks de ECC en el proyecto sin acordarlo con el equipo.
