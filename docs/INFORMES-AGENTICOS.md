# Informes agénticos para entidades

Estado: **diseño**. En la app hay solo una simulación con datos ficticios (`/informes`); la implementación completa queda para más adelante.

## 1. Qué es

Los tickets ciudadanos, junto con los datos oficiales, alimentan las **recomendaciones** (`ReglaRecomendacion`, `src/lib/estadisticas/recomendaciones.ts`). Hoy esas recomendaciones solo se muestran en la app (`/estadisticas` y el panel de zona del mapa).

El informe agéntico convierte cada recomendación con respaldo suficiente en un **informe formal para la entidad que corresponde** (Ministerio de Salud o Policía). Un modelo de lenguaje redacta el borrador y un analista lo aprueba antes de enviarlo.

```
tickets + datos oficiales
  → reglas (recomendaciones, ya existe)
  → ¿alcanza la evidencia? (periodicidad por evidencia)
  → agente redacta el borrador por entidad
  → ANALISTA revisa y aprueba
  → envío a la entidad + registro de trazabilidad
```

## 2. Periodicidad por evidencia

No hay informe diario ni mensual: un informe por calendario saldría vacío o sin respaldo. Se evalúa de forma periódica (por ejemplo, una vez por día), pero **solo se emite** cuando se cumplen todas estas condiciones para la combinación regla + zona + entidad:

| Criterio | Valor inicial | Para qué |
|---|---|---|
| Volumen mínimo | ≥ 30 hechos en 30 días | Que la recomendación no salga de pocos casos |
| Persistencia | La regla se cumple 2 semanas seguidas | Descartar picos aislados |
| Enfriamiento | No repetir el mismo informe antes de 14 días | No saturar a la entidad |
| Escalada | Si la variación empeora ≥ 50 puntos, se emite aunque no hayan pasado los 14 días | No esperar si el problema crece rápido |

Además, cada informe lleva un **nivel de respaldo**: bajo (menos que el mínimo), medio (desde el mínimo) o alto (desde el doble del mínimo).

Las recomendaciones que se cumplen pero no alcanzan estos criterios quedan **en observación**, con el motivo ("faltan 18 hechos", "lleva 1 de 2 semanas", "ya se envió hace 5 días").

La lógica está en `web/src/lib/informes/periodicidad.ts` (`evaluarEmision`, con tests). Los valores de `CRITERIOS_EMISION` pasarían a ser configurables por el ADMIN.

## 3. Destinatario

Por categoría, con la misma derivación de los tickets (decisión 9 del plan): abuso sexual → Salud y Policía (un informe para cada una); violencia de género e intrafamiliar → Salud (recursos de asistencia); resto → Policía.

**Pendiente:** acciones como "reforzar la iluminación" le corresponden al **Municipio**, que hoy no es un organismo del sistema. Hay que decidir si se agrega como tercer destinatario.

## 4. Agente

- **Modelo:** `claude-haiku-5-5` en desarrollo (rápido y barato). Probar `claude-sonnet-5-5` antes de la demo si la redacción no alcanza. No hace falta Opus: la regla ya hizo el análisis y el modelo solo redacta.
- **Costo estimado:** unos 2.000 tokens de entrada y 1.000 de salida por informe, es decir ~USD 0,014 con Haiku 5.5 y ~USD 0,028 con Sonnet 5.5.
- **Entrada (solo agregados):** regla, categoría, franja, zona, conteos, variación, serie de las últimas semanas, servicios de asistencia de la zona y destinatario. **Nunca** relatos, contactos, coordenadas ni tickets individuales.
- **Salida estructurada** validada con Zod: `hallazgo`, `evidencia[]`, `acciones[]`, `recursos[]`. Si la salida no valida, se reintenta una vez y si no se usa una plantilla fija.
- **Indicaciones:** describir el patrón con las cifras recibidas, no inventar datos, no juzgar personas ni perfilar, en español formal.
- **Clave:** `ANTHROPIC_API_KEY` en `web/.env`, solo del lado del servidor. Se agrega a `.env.example` y a `AGENTS.md` cuando se implemente.

## 5. Implementación completa (propuesta)

1. **Esquema Prisma:** modelo `Informe` con `organismo`, `reglaId`, `barrioId?`, `estado` (`BORRADOR → APROBADO → ENVIADO`, o `DESCARTADO`), `respaldo`, `motivo` (`NUEVO`/`ESCALADA`), `senal` (`Json`: los números usados), `contenido` (`Json`), `modelo`, `versionPrompt`, `creadoPor`, `aprobadoPor` y fechas. Lleva `sintetico` como el resto.
2. **Evaluación:** `POST /api/informes/evaluar` (ADMIN, o un cron de Vercel) corre las reglas por zona, aplica `evaluarEmision` y crea borradores.
3. **Redacción:** `src/lib/informes/agente.ts` llama al modelo con la salida estructurada. Sin SDK nuevo hasta que se apruebe: se puede usar `fetch` a la API de Anthropic.
4. **Revisión:** `GET /api/informes` y `PATCH /api/informes/:id` (`ANALISTA`, `ADMIN`) para editar, aprobar o descartar.
5. **Entrega a la entidad:** los operadores de cada organismo ven sus informes enviados en una pestaña de `/operador` (`GET /api/operador/informes`). Email o PDF quedan para después.
6. **Tests:** periodicidad (ya están), validación de la salida, que la entrada al modelo no tenga datos personales y acceso por rol.

## 6. Qué hay hoy (simulación)

- `web/src/app/informes/page.tsx` y `web/src/features/informes/`: pantalla para `ANALISTA` y `ADMIN`, con criterios de emisión, informes listos para revisar (filtrables por entidad, con aprobar y enviar o descartar) y recomendaciones en observación.
- `web/src/features/informes/datosSimulados.ts`: candidatos y borradores ficticios escritos a mano. El estado vive solo en el navegador: no hay API, ni base de datos, ni modelo.
- Enlace desde `/estadisticas` → Recomendaciones, visible para analistas y administradores.
