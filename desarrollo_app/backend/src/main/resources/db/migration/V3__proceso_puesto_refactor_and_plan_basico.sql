ALTER TABLE proceso_headhunting
DROP COLUMN IF EXISTS tecnologias_requeridas,
DROP COLUMN IF EXISTS tipo_contrato,
DROP COLUMN IF EXISTS rango_salarial_minimo,
DROP COLUMN IF EXISTS rango_salarial_maximo;

ALTER TABLE puesto_tic
ADD COLUMN IF NOT EXISTS tecnologias_requeridas VARCHAR(500),
ADD COLUMN IF NOT EXISTS tipo_contrato VARCHAR(80),
ADD COLUMN IF NOT EXISTS sector_requerido VARCHAR(64);

ALTER TABLE lista_candidatos
ADD COLUMN IF NOT EXISTS puesto_tic_id UUID;

UPDATE lista_candidatos lc
SET puesto_tic_id = sub.id
FROM (
    SELECT DISTINCT ON (proceso_headhunting_id) id, proceso_headhunting_id
    FROM puesto_tic
    ORDER BY proceso_headhunting_id, created_at ASC
) sub
WHERE lc.proceso_id = sub.proceso_headhunting_id
  AND lc.puesto_tic_id IS NULL;

ALTER TABLE lista_candidatos
DROP CONSTRAINT IF EXISTS uk_lista_candidatos_proceso_profesional;

ALTER TABLE lista_candidatos
ADD CONSTRAINT fk_lista_candidatos_puesto
FOREIGN KEY (puesto_tic_id) REFERENCES puesto_tic(id) ON DELETE CASCADE;

ALTER TABLE lista_candidatos
ALTER COLUMN puesto_tic_id SET NOT NULL;

ALTER TABLE lista_candidatos
ADD CONSTRAINT uk_lista_candidatos_proceso_profesional_puesto
UNIQUE (proceso_id, profesional_id, puesto_tic_id);

CREATE INDEX IF NOT EXISTS idx_lista_candidatos_puesto ON lista_candidatos(puesto_tic_id);

UPDATE suscripcion
SET plan = 'BASICO'
WHERE plan = 'BRONZE';
