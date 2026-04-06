package com.agileict.modules.candidatura.dto;

import com.agileict.shared.enums.DisponibilidadProfesional;
import com.agileict.shared.enums.EstadoListaCandidato;
import com.agileict.shared.enums.EstadoSolicitudVisibilidad;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ListaCandidatosResponse(
        UUID candidaturaId,
        UUID procesoId,
        String procesoTitulo,
        UUID profesionalId,
        String displayName,
        String email,
        String tecnologiasClave,
        Integer aniosExperiencia,
        DisponibilidadProfesional disponibilidad,
        EstadoListaCandidato estado,
        EstadoSolicitudVisibilidad solicitudVisibilidad,
        OffsetDateTime fechaInclusion,
        OffsetDateTime fechaActualizacion,
        boolean anonimo
) {
}