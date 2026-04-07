# AgileICT backend inicial

Backend Spring Boot preparado para un MVP modular de AgileICT.

## Qué trae

- Seguridad básica con Spring Security + JWT
- Perfiles y roles iniciales:
  - `ROLE_RRHH`
  - `ROLE_PROFESSIONAL`
  - `ROLE_ADMIN`
- Estructura modular por dominio:
  - auth
  - empresa
  - responsable
  - suscripcion
  - proceso
  - profesional
- Flyway para versionado de esquema
- PostgreSQL como base relacional
- Dockerfile multi-stage

## Endpoints principales

### Públicos
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register-professional`
- `POST /api/v1/auth/register-company`

### Protegidos
- `GET /api/v1/empresas`
- `GET /api/v1/rrhh/me`
- `GET /api/v1/suscripciones`
- `GET /api/v1/procesos`
- `POST /api/v1/procesos`
- `GET /api/v1/profesionales`
- `GET /api/v1/profesionales/me`

## Usuarios demo

Se generan automáticamente en perfiles `dev` y `docker`:

- RRHH: `rrhh@agileict.local` / `demo1234`
- Profesional: `pro@agileict.local` / `demo1234`
- Admin: `admin@agileict.local` / `demo1234`

## Variables de entorno

Copia `.env.example` a tu configuración real o añádelas al `docker-compose` de la raíz:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`

## Nota

Esta versión está pensada como base incremental. La lógica de matching, la autorización de visibilidad, el historial detallado del proceso y las notificaciones se dejan preparadas para fases siguientes.
