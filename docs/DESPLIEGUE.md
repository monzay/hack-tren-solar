# Despliegue de la demo (T014)

App en **Vercel Hobby** y base en **TiDB Cloud Starter** (compatible con MySQL). Es una demo para el jurado, con datos ficticios: no debe recibir denuncias reales.

> `docs/PLAN.md` preveía Railway. Su plan gratis da USD 1 por mes y se duerme sin uso, por eso acá se propone TiDB Cloud. La migración todavía no se probó contra TiDB.

## 1. Base de datos

1. Crear un cluster **Starter** en [tidbcloud.com](https://tidbcloud.com), sin límite de gasto.
2. Elegir una región que también tenga Vercel (por defecto, Vercel usa `iad1`, Virginia).
3. Crear la base `jujuy` y armar la URL:

```
mysql://USUARIO:CLAVE@HOST:4000/jujuy?sslaccept=strict&connection_limit=5
```

## 2. Tablas y datos (una sola vez)

⚠️ **El seed borra todas las tablas.** Revisar la URL antes de correrlo y no agregarlo al build.

Desde `web/`, en PowerShell:

```powershell
$env:DATABASE_URL="..."
$env:ENCRYPTION_KEY="..."        # la misma que en Vercel: openssl rand -base64 32
$env:SEED_PASSWORD="demo1234"
$env:SEED_ADMIN_PASSWORD="..."   # distinta y de 12 caracteres o más
npx prisma migrate deploy
npm run seed
```

Con otra `ENCRYPTION_KEY`, la app no puede leer los contactos.

## 3. Vercel

Importar el repositorio con **Root Directory `web`** y Node 22 o superior. Variables de Production:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la del paso 1 |
| `ENCRYPTION_KEY` | la del paso 2 |
| `JWT_SECRET` | `openssl rand -base64 32` (otro valor) |
| `JWT_EXPIRES_IN` | `8h` |
| `MIN_COUNT` | `3` recomendado. El valor por defecto del proyecto es `1` (decisión 19, FR-008) |
| `NEXT_PUBLIC_POLL_MS` | `5000` el día del pitch; `30000` el resto |
| `NEXT_PUBLIC_DEMO_PASSWORD` | igual a `SEED_PASSWORD` |

No cargar `SEED_PASSWORD` ni `SEED_ADMIN_PASSWORD`. Cambiar una variable `NEXT_PUBLIC_*` requiere volver a desplegar.

## 4. Verificación

- `/api/health` responde 200. Si la base no responde, devuelve 503.
- El mapa muestra datos con el `MIN_COUNT` elegido.
- Se puede crear un reporte y aparece en la bandeja de Salud.
- Entran todos los roles, y el contacto de un ticket se descifra.
- `/login` no muestra el usuario admin.

## Límites

Cada mapa abierto hace 2 pedidos por ciclo. Con 5 s, el millón de invocaciones mensuales de Vercel Hobby se agota en unas 694 horas de pestaña visible; con 30 s, en unas 4.160. Los límites de CPU y de TiDB no se midieron.

Las cuentas demo son públicas y los operadores pueden ver contactos: por eso la app avisa que no se carguen datos reales.
