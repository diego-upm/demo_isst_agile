-- Ejemplo de proceso y puesto para pruebas manuales.
-- Requiere que ya existan la empresa y el responsable RRHH de demo.

INSERT INTO proceso_headhunting (
    id, titulo, descripcion, estado, nivel_confidencialidad,
    nivel_experiencia_minimo,
    empresa_cliente_id, responsable_rrhh_id, created_at, updated_at
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Senior Backend Engineer',
    'Proceso inicial de ejemplo para validar el circuito RRHH.',
    'ACTIVE',
    'CONFIDENTIAL',
    '8 años',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    now(),
    now()
);

INSERT INTO puesto_tic (
    id, titulo, senioridad, modalidad, ubicacion, area, descripcion, tecnologias_requeridas, tipo_contrato, sector_requerido,
    proceso_headhunting_id, created_at, updated_at
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Backend Engineer',
    'SENIOR',
    'Híbrido',
    'Madrid',
    'Plataforma',
    'Diseño e implementación de servicios REST con Spring Boot.',
    'Java, Spring Boot, PostgreSQL',
    'Indefinido',
    'TECNOLOGIA_IT',
    '55555555-5555-5555-5555-555555555555',
    now(),
    now()
);
