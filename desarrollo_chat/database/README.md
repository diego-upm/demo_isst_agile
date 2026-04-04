# Database inicial de AgileICT

Esta carpeta deja preparada la base de datos para crecer por fases.

## Estructura

- `init/`: scripts manuales de inicialización
- `migrations/`: versión inicial del esquema relacional
- `seeds/dev/`: ejemplos de datos de apoyo para desarrollo

## Tablas principales incluidas

- `empresa_cliente`
- `responsable_rrhh`
- `suscripcion`
- `proceso_headhunting`
- `puesto_tic`
- `profesional_senior`

## Tablas de soporte incluidas

- `user_account`
- `role`
- `user_account_role`

## Idea de uso

- El backend usa Flyway con la misma migración base.
- Los datos demo iniciales se crean desde Spring Boot en perfiles `dev` y `docker`.
- Más adelante puedes añadir aquí nuevas migraciones para:
  - tabla intermedia proceso-profesional
  - visibilidad/autorizaciones
  - auditoría
  - notificaciones
  - estados e histórico
