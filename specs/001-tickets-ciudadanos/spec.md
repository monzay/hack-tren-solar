# Feature Specification: Tickets ciudadanos y derivación a Salud y Policía

**Feature Branch**: `001-tickets-ciudadanos`
**Created**: 2026-11-22
**Status**: Draft
**Input**: "Cada usuario puede generar un ticket sobre si fue víctima de algún delito o abuso, de manera anónima o pidiendo que alguien lo contacte. Los tickets alimentan el mapa de calor y el dashboard."

Decisiones y contexto de negocio: [`docs/PLAN.md`](../../docs/PLAN.md).

## User Scenarios & Testing

### User Story 1 - Reportar un hecho (Priority: P1)
Una persona sin cuenta reporta un hecho que sufrió o presenció: elige la categoría, marca la ubicación en el mapa e indica la fecha y la franja horaria, si fue víctima o testigo, y un relato opcional.

**Independent Test**: enviar el formulario y ver que el ticket se crea y que la zona correspondiente suma intensidad en el heatmap.

**Acceptance Scenarios**:
1. **Given** la categoría `ABUSO_SEXUAL`, **When** la persona elige "anónimo", **Then** el ticket se crea sin datos de contacto y se muestra una confirmación con los recursos de urgencia (911, 144, 102).
2. **Given** la categoría `ROBO`, **When** la persona intenta enviar sin nombre, sin contacto o sin aceptar la declaración jurada, **Then** el sistema rechaza el envío e indica qué falta.
3. **Given** un ticket anónimo, **When** la persona marca "quiero registrar una denuncia", **Then** se le piden los datos de contacto y el ticket pasa a modo `CON_CONTACTO`.

### User Story 2 - Atender tickets con contacto (Priority: P1)
Un operador de Salud o de Policía ve los tickets derivados a su organismo, contacta a la persona y registra los cambios de estado y las notas.

**Independent Test**: loguearse como `OPERADOR_POLICIA` y ver solo tickets de Policía, pasarlos de `NUEVO` a `CONTACTADO` y agregar una nota.

**Acceptance Scenarios**:
1. **Given** un ticket nuevo de `ROBO`, **Then** se deriva a `POLICIA` y aparece en la bandeja de los operadores de Policía en menos de 5 segundos (polling), sin exponerlo a otros organismos.
2. **Given** un ticket de `ABUSO_SEXUAL`, **Then** lo ven tanto `OPERADOR_SALUD` como `OPERADOR_POLICIA`.
3. **Given** un `OPERADOR_SALUD`, **When** pide un ticket derivado solo a Policía, **Then** recibe un 403.

### User Story 3 - Mapa y dashboard con reportes ciudadanos (Priority: P1)
El mapa de calor y las tendencias combinan los incidentes oficiales y los tickets en una sola capa.

**Acceptance Scenarios**:
1. **Given** incidentes y tickets en la misma celda de ~100 m, **Then** el heatmap suma ambos y nunca devuelve coordenadas exactas ni datos personales.
2. **Then** el mapa muestra la leyenda "incluye reportes ciudadanos no verificados".

### User Story 4 - Ciudadano con cuenta (Priority: P2)
Un `CIUDADANO` registrado ve el análisis de toda la ciudad de San Salvador de Jujuy: ranking de barrios, tendencias, franjas de más riesgo y recomendaciones.

**Acceptance Scenarios**:
1. **Given** un ciudadano con sesión iniciada, **Then** ve las estadísticas de todos los barrios de la ciudad, solo agregadas y sin datos individuales.

### Edge Cases
- Envíos masivos desde una misma IP: rate limit (429).
- Ubicación fuera de San Salvador de Jujuy: se rechaza (422).
- Pedido de supresión de datos: borrado lógico (`deletedAt`) inmediato, más supresión física de los datos de contacto cuando la persona lo pide (Ley 25.326, art. 16).

## Requirements

### Functional Requirements
- **FR-001**: `POST /api/tickets` es público y no requiere cuenta.
- **FR-002**: Las categorías son las del sistema (`HOMICIDIO`, `LESIONES`, `VIOLENCIA_GENERO`, `VIOLENCIA_INTRAFAMILIAR`, `ROBO`, `HURTO`, `HURTO_VEHICULO`, `ESTAFA_ONLINE`) más `ABUSO_SEXUAL`.
- **FR-003**: Se permite el modo anónimo solo en `ABUSO_SEXUAL`, `VIOLENCIA_GENERO` y `VIOLENCIA_INTRAFAMILIAR`. El resto exige nombre, un contacto (teléfono o email) y la declaración jurada de veracidad.
- **FR-004**: Derivación automática: `ABUSO_SEXUAL` → `SALUD` y `POLICIA`; el resto → `POLICIA`.
- **FR-005**: El ticket con contacto tiene los estados `NUEVO`, `CONTACTADO`, `DERIVADO` y `CERRADO`, con notas internas y registro de quién hizo cada cambio y cuándo.
- **FR-006**: Los datos de contacto se guardan cifrados (AES-256-GCM, clave en una variable de entorno) y solo los descifran los operadores del organismo destino.
- **FR-007**: La ubicación exacta se guarda para uso operativo; el heatmap recibe puntos agrupados en una grilla de ~100 m (nunca coordenadas exactas) y las estadísticas usan barrios.
- **FR-008**: Heatmap, conteo por zona y tendencias incluyen los tickets (una sola capa). `MIN_COUNT` es configurable y vale 1 por defecto.
- **FR-009**: Rate limit de 5 tickets por IP por hora.
- **FR-010**: Sin adjuntos en el MVP.
- **FR-011**: El seed genera tickets sintéticos (`sintetico = true`).
- **FR-012** (P1): Rol `CIUDADANO` con registro y acceso al análisis agregado de toda la ciudad.

### Key Entities
- **Ticket**: categoría, modo (`ANONIMO` | `CON_CONTACTO`), rol de quien reporta (`VICTIMA` | `TESTIGO`), fecha del hecho, franja, lat/lng, zona, relato, quiere denunciar, declaración aceptada, estado, organismos destino, `sintetico`, `deletedAt`.
- **ContactoTicket**: nombre, teléfono, email y horario preferido (cifrados), relación 1:1 con Ticket.
- **NotaTicket**: texto, autor (operador), fecha.

## Success Criteria
- **SC-001**: Reportar un hecho toma menos de 1 minuto.
- **SC-002**: Ningún endpoint público devuelve datos personales (cubierto por tests).
- **SC-003**: El ticket aparece en el heatmap en menos de 5 segundos después de enviarse.
- **SC-004**: Un operador solo ve los tickets de su organismo (cubierto por tests).

## Assumptions
- Ministerio de Salud y Policía de Jujuy son operadores de demo, sin convenio real todavía.
- Las empresas de seguridad quedan fuera de alcance (fase 2 del modelo de negocio).
- App única en Next.js 16 con Prisma 6 y MySQL 8. Entidades y orden de trabajo: `docs/PLAN.md` §6 y §7.
