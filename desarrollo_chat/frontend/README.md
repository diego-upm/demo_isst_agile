# AgileICT Frontend - versión inicial

Frontend inicial del MVP de AgileICT con React + Vite + TypeScript.

## Qué incluye

- Login de demo con dos roles: `RRHH` y `PROFESSIONAL`
- Rutas protegidas por rol
- Área RRHH separada de área Profesional Senior
- Cliente API preparado para conectar con backend Spring Boot
- Dockerfile para servir el build con Nginx
- Proxy Nginx configurable por variables de entorno para no depender de `localhost`

## Usuarios demo

### Responsable RRHH
- Email: `rrhh@agileict.local`
- Password: `demo1234`

### Profesional Senior
- Email: `pro@agileict.local`
- Password: `demo1234`

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Crear `.env` a partir de `.env.example`.

```env
VITE_API_BASE_URL=/api
VITE_APP_NAME=AgileICT
```

## Preparado para Docker

El contenedor frontend puede reenviar `/api` hacia backend usando:

- `BACKEND_UPSTREAM_HOST`
- `BACKEND_UPSTREAM_PORT`

Ejemplo pensado para Docker Compose local:

- `BACKEND_UPSTREAM_HOST=backend`
- `BACKEND_UPSTREAM_PORT=8080`

Ejemplo futuro en LAN:

- `BACKEND_UPSTREAM_HOST=192.168.1.50`
- `BACKEND_UPSTREAM_PORT=8080`
