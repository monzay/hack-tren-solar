# Pitch y guion de la demo

> Duración objetivo: **4 minutos** (1 de problema y solución, 2 de demo en vivo, 1 de modelo de negocio y cierre).
> Todos los datos que se muestran en la demo son **ficticios** (`sintetico = true`) y se dice en voz alta.
> Nombre del producto: **[a definir]**.

## 1. Pitch de 1 minuto (versión corta)

> En San Salvador de Jujuy sabemos cuántos delitos se **denuncian**, pero no cuántos **ocurren**.
> Las estadísticas oficiales salen del SNIC y el propio DiPEC reconoce que tienen un subregistro importante.
> Muchas víctimas no denuncian, sobre todo en casos de abuso y violencia, y los barrios menos patrullados quedan invisibles.
>
> **[Nombre]** es una plataforma pública que suma datos oficiales y reportes ciudadanos, anónimos o con contacto, en un solo mapa de calor de la ciudad.
> Cada reporte se deriva automáticamente al Ministerio de Salud o a la Policía según el tipo de hecho, y el mapa se actualiza en el momento.
> Con eso, el sistema sugiere medidas de prevención situacional, como iluminación, corredores seguros o asistencia a víctimas, sin perfilar a nadie y sin exponer datos personales.

## 2. Guion completo (4 minutos)

### 2.1 Problema (40 s)

- **Dato:** la información oficial proviene del **SNIC** y refleja solo **delitos denunciados** (por ejemplo, Jujuy tuvo 3,7 homicidios cada 100.000 habitantes en 2025).
- **Subregistro:** el DiPEC advierte que las estadísticas basadas en denuncias "adolecen de un importante subregistro, que varía en el tiempo".
- **Sesgo:** las zonas más patrulladas generan más denuncias; las desatendidas no aparecen.
- **Víctimas:** en abuso sexual y violencia de género, muchas personas no denuncian por miedo o porque no saben a dónde ir.
- **No hay datos abiertos de delito** en el portal provincial.

### 2.2 Solución (20 s)

Tres piezas:
1. **Reporte ciudadano:** formulario público, sin cuenta; anónimo en abuso y violencia, con contacto y declaración jurada en robo, hurto, lesiones o estafa.
2. **Derivación:** cada reporte llega al organismo que corresponde (Salud, Policía o ambos) para orientar a la persona.
3. **Inteligencia territorial:** mapa de calor, tendencias y recomendaciones de prevención situacional para toda la ciudad.

### 2.3 Demo en vivo (2 min)

| # | Pantalla | Qué se hace | Qué se dice |
|---|---|---|---|
| 1 | `/` Mapa | Mostrar San Salvador de Jujuy completa y filtrar por "Robo", franja "noche" | "Una sola capa: datos oficiales + reportes ciudadanos. Nunca mostramos puntos exactos, agrupamos cada 100 metros." |
| 2 | `/` Panel lateral | Elegir un barrio | "Conteo, tasa por mil habitantes, variación contra el período anterior y recomendaciones: más iluminación y paradas seguras en la franja nocturna." |
| 3 | `/reportar` (celular) | Cargar un reporte anónimo de violencia de género | "Sin cuenta, anónimo. Al final ve los recursos de urgencia: 911, 144." |
| 4 | `/reportar` | Marcar "quiero denunciar" y dejar un teléfono | "Si quiere denunciar, pedimos un contacto para que alguien la oriente. El contacto se guarda cifrado." |
| 5 | `/` Mapa | Volver al mapa | "El reporte ya sumó en el mapa, en tiempo real." |
| 6 | `/operador` | Entrar como operador de Policía, abrir el ticket y pasarlo a `CONTACTADO` con una nota | "El operador solo ve los tickets de su organismo; cada acceso al contacto queda auditado." |
| 7 | `/estadisticas` | Mostrar ranking de barrios y tendencia mensual | "Esto lo puede ver cualquier vecino que se registre, siempre agregado." |

**Plan B:** si falla la red o el deploy, correr la demo en local con los datos precargados (T013) y tener capturas de cada paso.

### 2.4 Privacidad y ética (20 s)

- Ningún endpoint público devuelve coordenadas exactas, relatos ni contactos.
- Contactos cifrados (AES-256-GCM) y visibles solo para el organismo asignado.
- Sin perfilamiento: recomendaciones **situacionales** (lugar y horario), nunca sobre personas.
- Cumple la Ley 25.326: datos sensibles protegidos y borrado físico a pedido.
- Leyenda visible: "incluye reportes ciudadanos no verificados".

### 2.5 Modelo de negocio (30 s)

- **Ciudadanía:** gratis. Reportar, ver el mapa y el análisis de la ciudad.
- **Estado (cliente del MVP):** licencia del panel de operadores para el Ministerio de Salud y la Policía, y reportes agregados para el Ministerio de Seguridad y la Municipalidad.
- **Fase 2:** servicios de datos agregados para empresas de seguridad, aseguradoras e inmobiliarias. **Nunca** datos personales.

### 2.6 Cierre (10 s)

> "Hoy el mapa del delito en Jujuy muestra dónde se denuncia. Nosotros queremos mostrar dónde pasa, y ayudar a que las víctimas lleguen a quien las puede ayudar."

## 3. Estructura de diapositivas (opcional)

1. Portada: nombre, equipo, "Inteligencia territorial para la prevención del delito en San Salvador de Jujuy".
2. El problema: denuncias ≠ delitos (subregistro, sesgo de patrullaje, víctimas que no denuncian).
3. La solución en 3 piezas: reportar, derivar, prevenir.
4. Demo (pasar a la app).
5. Privacidad por diseño.
6. Modelo de negocio.
7. Próximos pasos: resto de la provincia, integración con 911, SAME y encuestas de victimización, fase 2.
8. Cierre y contacto.

## 4. Preguntas probables del jurado

| Pregunta | Respuesta corta |
|---|---|
| ¿Qué pasa con los reportes falsos? | Declaración jurada obligatoria en delitos contra la propiedad, límite de 5 reportes por IP por hora y leyenda de "no verificados". |
| ¿No estigmatiza barrios? | Mostramos tasas por población y tendencias, con recomendaciones de prevención y no de castigo. |
| ¿Se puede identificar a una víctima? | No: agrupamos cada ~100 m, no hay marcadores individuales y el contacto está cifrado. |
| ¿Es una denuncia formal? | No. Es un reporte; si la persona quiere denunciar, un operador la orienta. |
| ¿De dónde salen los datos de la demo? | Son ficticios, generados con patrones plausibles, y están marcados como tales. |
| ¿Quién paga? | El Estado (Salud, Policía, Seguridad, Municipio). La ciudadanía, nunca. |
| ¿Cómo escala? | Resto de la provincia (Palpalá, Perico, Humahuaca), más fuentes oficiales y fase 2 con privados, siempre con datos agregados. |

## 5. Fuentes

- Sistema Nacional de Información Criminal (SNIC), Ministerio de Seguridad de la Nación.
- DiPEC Jujuy, advertencia sobre subregistro en estadísticas de delitos.
- INDEC, Encuesta Nacional de Victimización 2017.
- Ley 25.326 de Protección de los Datos Personales.
- Investigación del equipo sobre fuentes de datos, sesgos y prevención situacional en Jujuy.
