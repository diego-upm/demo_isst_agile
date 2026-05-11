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

## Pruebas de funcionalidad (TC)

Los scripts de prueba se encuentran en `../agileict_12_tc_scripts/`. Son 12 scripts PowerShell independientes, uno por caso de prueba, que validan la funcionalidad del backend contra la API REST.

### Requisitos previos

1. Backend levantado (local o Docker) con el perfil `dev` activo para disponer de los usuarios demo.
2. PowerShell 5.1 o superior.
3. Variables de entorno opcionales:
   - `BASE_URL` — URL base del backend (por defecto `http://localhost:8080`).

### Cómo ejecutar un script

```powershell
cd desarrollo_app/agileict_12_tc_scripts
.\TC-01_autenticacion_rrhh.ps1
```

Para ejecutar todos los scripts en secuencia:

```powershell
cd desarrollo_app/agileict_12_tc_scripts
Get-ChildItem TC-*.ps1 | Sort-Object Name | ForEach-Object {
    Write-Host "`n=== $($_.Name) ===" -ForegroundColor Cyan
    & $_.FullName
}
```

Con una URL distinta (por ejemplo Docker):

```powershell
$env:BASE_URL = "http://localhost:8080"
.\TC-07_creacion_proceso_valido.ps1
```

### Resultado esperado por script

| Script | Objetivo | Resultado esperado |
|--------|----------|--------------------|
| TC-01_autenticacion_rrhh.ps1 | Login RRHH y acceso a `/rrhh/me` | PASS 200 |
| TC-02_login_invalido.ps1 | Rechazo de credenciales inválidas | PASS 400/401/403 |
| TC-03_autorizacion_por_rol.ps1 | Profesional no accede a recurso RRHH | PASS 401/403 |
| TC-04_registro_profesional.ps1 | Alta de profesional senior | PASS 201 |
| TC-05_registro_empresa_rrhh.ps1 | Alta de empresa y RRHH | PASS 201 |
| TC-06_consulta_suscripcion_activa.ps1 | Comprobación previa de empresa/suscripción | PASS o SKIP si falta endpoint específico |
| TC-07_creacion_proceso_valido.ps1 | Crear proceso con puesto TIC | PASS 201 |
| TC-08_validacion_proceso_incompleto.ps1 | Proceso incompleto debe fallar | PASS 400/422 |
| TC-09_listado_profesionales_rrhh.ps1 | Listado de profesionales visibles | PASS 200 |
| TC-10_edicion_perfil_profesional.ps1 | Consultar y actualizar perfil propio | PASS 200 |
| TC-11_solicitud_visibilidad.ps1 | Regla de visibilidad | SKIP si no hay endpoint |
| TC-12_cierre_proceso_candidato.ps1 | Cierre de proceso con candidato | SKIP si no hay endpoint |

### Salidas posibles

- `[PASS]` — El endpoint respondió con el código HTTP esperado. Prueba superada.
- `[FAIL]` — El endpoint respondió con un código inesperado. Se imprime el cuerpo de la respuesta para diagnóstico.
- `[SKIP]` — El caso de prueba valida una regla de negocio o flujo de aceptación que aún no tiene endpoint REST implementado. Debe validarse manualmente en la UI o cuando se implemente el endpoint.

### Arquitectura de los scripts

Cada script es autónomo e incluye:

- **`Invoke-Api`** — función genérica que envía peticiones HTTP y captura la respuesta (incluidos errores 4xx/5xx).
- **`Assert-Status`** — compara el código HTTP recibido con los esperados; imprime PASS/FAIL y termina con `exit 0` o `exit 1`.
- **`Login`** — realiza el flujo de autenticación y devuelve el token JWT.
- **`Skip-Test`** — marca el TC como SKIP cuando el endpoint no existe y termina con `exit 0`.

Los scripts que necesitan datos existentes (TC-07, TC-09, TC-10, TC-12) usan los **usuarios demo** creados por `DemoDataInitializer` bajo el perfil `dev`:
- RRHH: `rrhh@agileict.local` / `demo1234`
- Profesional: `pro@agileict.local` / `demo1234`

Los scripts de registro (TC-04, TC-05) generan datos únicos mediante un timestamp Unix (`$Uniq`) para evitar colisiones en ejecuciones repetidas.

## Nota

Esta versión está pensada como base incremental. La lógica de matching, la autorización de visibilidad, el historial detallado del proceso y las notificaciones se dejan preparadas para fases siguientes.
