CREATE TABLE role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE user_account (
    id UUID PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(120) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_account_role (
    user_account_id UUID NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_account_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE empresa_cliente (
    id UUID PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    cif VARCHAR(32) NOT NULL UNIQUE,
    sector VARCHAR(80),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE responsable_rrhh (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cargo VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    empresa_cliente_id UUID NOT NULL,
    user_account_id UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_responsable_empresa FOREIGN KEY (empresa_cliente_id) REFERENCES empresa_cliente(id),
    CONSTRAINT fk_responsable_user FOREIGN KEY (user_account_id) REFERENCES user_account(id)
);

CREATE TABLE suscripcion (
    id UUID PRIMARY KEY,
    plan VARCHAR(32) NOT NULL,
    estado VARCHAR(32) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    empresa_cliente_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_suscripcion_empresa FOREIGN KEY (empresa_cliente_id) REFERENCES empresa_cliente(id)
);

CREATE TABLE proceso_headhunting (
    id UUID PRIMARY KEY,
    titulo VARCHAR(160) NOT NULL,
    descripcion VARCHAR(2000) NOT NULL,
    estado VARCHAR(32) NOT NULL,
    nivel_confidencialidad VARCHAR(32) NOT NULL,
    tecnologias_requeridas VARCHAR(500),
    nivel_experiencia_minimo VARCHAR(120),
    tipo_contrato VARCHAR(80),
    rango_salarial_minimo INTEGER,
    rango_salarial_maximo INTEGER,
    empresa_cliente_id UUID NOT NULL,
    responsable_rrhh_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_proceso_empresa FOREIGN KEY (empresa_cliente_id) REFERENCES empresa_cliente(id),
    CONSTRAINT fk_proceso_responsable FOREIGN KEY (responsable_rrhh_id) REFERENCES responsable_rrhh(id)
);

CREATE TABLE puesto_tic (
    id UUID PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    senioridad VARCHAR(32) NOT NULL,
    modalidad VARCHAR(100),
    ubicacion VARCHAR(100),
    area VARCHAR(100),
    descripcion VARCHAR(1500),
    proceso_headhunting_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_puesto_proceso FOREIGN KEY (proceso_headhunting_id) REFERENCES proceso_headhunting(id) ON DELETE CASCADE
);

CREATE TABLE profesional_senior (
    id UUID PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tecnologias_clave VARCHAR(1000),
    titulaciones_academicas VARCHAR(1500),
    idiomas VARCHAR(1000),
    soft_skills VARCHAR(1000),
    anios_experiencia INTEGER,
    rango_salarial_esperado_min INTEGER,
    rango_salarial_esperado_max INTEGER,
    descripcion_personal VARCHAR(2000),
    area_negocio VARCHAR(64) NOT NULL,
    disponibilidad VARCHAR(32) NOT NULL,
    perfil_visible BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    user_account_id UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_profesional_user FOREIGN KEY (user_account_id) REFERENCES user_account(id),
    CONSTRAINT ck_profesional_area_negocio CHECK (area_negocio IN (
        'TECNOLOGIA_IT',
        'CIBERSEGURIDAD',
        'DATA_ANALYTICS',
        'INTELIGENCIA_ARTIFICIAL',
        'INGENIERIA',
        'TELECOMUNICACIONES',
        'FINANZAS',
        'LEGAL_COMPLIANCE',
        'RECURSOS_HUMANOS',
        'MARKETING_VENTAS',
        'OPERACIONES',
        'CONSULTORIA',
        'PRODUCTO',
        'SUPPLY_CHAIN_LOGISTICA',
        'ENERGIA',
        'SALUD_FARMA',
        'RETAIL_ECOMMERCE',
        'CONSTRUCCION_INFRAESTRUCTURA',
        'SECTOR_PUBLICO'
    ))
);

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

CREATE INDEX idx_responsable_empresa ON responsable_rrhh(empresa_cliente_id);
CREATE INDEX idx_suscripcion_empresa ON suscripcion(empresa_cliente_id);
CREATE INDEX idx_proceso_empresa ON proceso_headhunting(empresa_cliente_id);
CREATE INDEX idx_proceso_responsable ON proceso_headhunting(responsable_rrhh_id);
CREATE INDEX idx_puesto_proceso ON puesto_tic(proceso_headhunting_id);
CREATE INDEX idx_lista_candidatos_proceso ON lista_candidatos(proceso_id);
CREATE INDEX idx_lista_candidatos_profesional ON lista_candidatos(profesional_id);
CREATE INDEX idx_lista_candidatos_estado ON lista_candidatos(estado);
CREATE INDEX idx_lista_candidatos_solicitud_visibilidad ON lista_candidatos(solicitud_visibilidad);
