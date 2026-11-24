# Guion de la demo en vivo (complementa a PITCH.md, el pitch oficial del equipo)

Duración objetivo: **3 minutos de pitch + 3 minutos de demo**. Todos los datos de la demo son **sintéticos**.

## Pitch (3 min)

**1. El problema (40 s)**
En Jujuy no hay estadísticas del delito abiertas y detalladas. La fuente oficial, el SNIC, publica cifras por provincia y departamento, con mucho subregistro: muchos delitos no se denuncian. Y quien sufre un abuso o violencia de género muchas veces no se anima a ir a una comisaría.

**2. La solución (60 s)**
Una plataforma para **San Salvador de Jujuy** que hace tres cosas:
- **Reportar en menos de un minuto**, desde el celular, de forma **anónima** en abuso y violencias, o pidiendo que te contacten. No reemplaza la denuncia, pero la facilita.
- **Derivar** cada caso al organismo que corresponde: **Salud y Policía** en abuso sexual, **Policía** en el resto. Cada operador ve solo lo suyo.
- **Un mapa de calor y estadísticas** que unen datos oficiales con reportes ciudadanos, con **recomendaciones de prevención situacional** explicables: iluminación, paradas seguras, patrullaje preventivo. Sin perfilar personas.

**3. Privacidad primero (30 s)**
Ley 25.326: el mapa nunca muestra un punto exacto, agrupa en celdas de unos 100 metros. Los datos de contacto se guardan cifrados y solo los ve el organismo asignado, con cada acceso registrado. Y si la persona lo pide, se borra todo.

**4. Modelo de negocio (30 s)**
Gratis para la ciudadanía. El cliente es el **Estado**: licencia del panel de operadores para Salud y Policía, y reportes agregados para políticas públicas. En una segunda fase: aseguradoras e inmobiliarias, siempre con datos agregados, **nunca datos personales**.

**5. Cierre (20 s)**
Más reportes significa menos subregistro, y menos subregistro significa mejores decisiones de prevención. Empezamos por San Salvador de Jujuy; el modelo escala al resto de la provincia.

## Guion de la demo (3 min)

Antes de empezar: `npm run seed` hecho, la app abierta en el celular (o en modo celular del navegador) y en la computadora.

| # | Pantalla | Qué mostrar | Qué decir |
|---|---|---|---|
| 1 | `/` Mapa | Vista de toda la ciudad, leyenda Baja/Media/Alta, filtro **Robo** | "Esto es San Salvador de Jujuy: datos oficiales y reportes ciudadanos en una sola capa." |
| 2 | `/` Mapa | Elegir **Alto Comedero**: zoom, contorno, panel con tasa por mil, variación y una **recomendación** | "Los robos subieron en los últimos meses, y el sistema sugiere una acción concreta y explica por qué." |
| 3 | `/reportar` (celular) | Categoría **Abuso sexual** → marcar ubicación → detalle → **Anónimo** → enviar | "Sin cuenta, sin nombre. Al terminar, siempre los números de urgencia." |
| 4 | `/reportar` | Categoría **Robo** → intentar anónimo | "En robo se piden datos de contacto y declaración jurada, para evitar reportes falsos." |
| 5 | `/login` → `/operador` | Entrar como `salud@demo.ar`: el reporte de abuso **aparece solo** en la bandeja (refresco cada 5 s) | "El caso llegó a Salud. La Policía también lo ve, porque abuso sexual se deriva a ambos." |
| 6 | `/operador/:id` | Abrir el ticket, pasar a **Contactado**, agregar una nota | "Cada cambio queda registrado, y el acceso al contacto también." |
| 7 | `/estadisticas` | Entrar como `analista@demo.ar`: tendencias, ranking de barrios, franjas | "Para quien diseña políticas: dónde, cuándo y qué está creciendo." |
| 8 | `/admin` | Entrar como `admin@demo.ar`: categorías (anonimato y derivación configurables) | "Todo es configurable por el Estado, sin tocar código." |

Usuarios demo (contraseña `demo1234`): `admin@demo.ar`, `salud@demo.ar`, `policia@demo.ar`, `analista@demo.ar`, `ciudadano@demo.ar`.

## Preguntas probables del jurado

- **¿Y los reportes falsos?** Declaración jurada en delitos contra la propiedad, límite de 5 reportes por IP por hora, y la leyenda "reportes ciudadanos no verificados".
- **¿No estigmatiza barrios?** Se muestra la tasa por mil habitantes (no solo el conteo absoluto), agregada, y las recomendaciones son situacionales, nunca sobre personas.
- **¿Por qué alguien reportaría?** Porque es anónimo cuando hace falta, rápido, y le da los recursos de ayuda al instante.
- **¿Qué falta para producción?** Convenio con Salud y Policía de Jujuy, datos reales del SNIC y el resto de la provincia.
