CREATE TABLE lista_candidatos (
    id UUID PRIMARY KEY,
    proceso_id UUID NOT NULL,
    profesional_id UUID NOT NULL,
    estado VARCHAR(32) NOT NULL,
    solicitud_visibilidad VARCHAR(32) NOT NULL,
    fecha_inclusion TIMESTAMPTZ NOT NULL,
    fecha_actualizacion TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_lista_candidatos_proceso FOREIGN KEY (proceso_id) REFERENCES proceso_headhunting(id) ON DELETE CASCADE,
    CONSTRAINT fk_lista_candidatos_profesional FOREIGN KEY (profesional_id) REFERENCES profesional_senior(id) ON DELETE CASCADE,
    CONSTRAINT uk_lista_candidatos_proceso_profesional UNIQUE (proceso_id, profesional_id)
);

CREATE INDEX idx_lista_candidatos_proceso ON lista_candidatos(proceso_id);
CREATE INDEX idx_lista_candidatos_profesional ON lista_candidatos(profesional_id);
CREATE INDEX idx_lista_candidatos_estado ON lista_candidatos(estado);
CREATE INDEX idx_lista_candidatos_solicitud_visibilidad ON lista_candidatos(solicitud_visibilidad);