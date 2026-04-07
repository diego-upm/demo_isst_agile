-- Ejemplo de proceso y puesto para pruebas manuales.
-- Requiere que ya existan la empresa y el responsable RRHH de demo.

INSERT INTO proceso_headhunting (
    id, titulo, descripcion, estado, nivel_confidencialidad,
    tecnologias_requeridas, nivel_experiencia_minimo, tipo_contrato,
    rango_salarial_minimo, rango_salarial_maximo,
    empresa_cliente_id, responsable_rrhh_id, created_at, updated_at
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Senior Backend Engineer',
    'Proceso inicial de ejemplo para validar el circuito RRHH.',
    'ACTIVE',
    'CONFIDENTIAL',
    'Java, Spring Boot, PostgreSQL',
    '8 años',
    'Indefinido',
    55000,
    70000,
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    now(),
    now()
);

INSERT INTO puesto_tic (
    id, titulo, senioridad, modalidad, ubicacion, area, descripcion,
    proceso_headhunting_id, created_at, updated_at
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    'Backend Engineer',
    'SENIOR',
    'Híbrido',
    'Madrid',
    'Plataforma',
    'Diseño e implementación de servicios REST con Spring Boot.',
    '55555555-5555-5555-5555-555555555555',
    now(),
    now()
);
