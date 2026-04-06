ALTER TABLE profesional_senior
    ADD COLUMN IF NOT EXISTS titulaciones_academicas VARCHAR(1500),
    ADD COLUMN IF NOT EXISTS idiomas VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS soft_skills VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS rango_salarial_esperado_min INTEGER,
    ADD COLUMN IF NOT EXISTS rango_salarial_esperado_max INTEGER,
    ADD COLUMN IF NOT EXISTS descripcion_personal VARCHAR(2000);