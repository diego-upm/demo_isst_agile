package com.agileict.modules.candidatura.dto;

import com.agileict.shared.enums.AreaNegocioProfesional;
import com.agileict.shared.enums.DisponibilidadProfesional;
import com.agileict.shared.enums.EstadoListaCandidato;
import com.agileict.shared.enums.EstadoSolicitudVisibilidad;
import com.agileict.shared.enums.EstadoProceso;
import com.agileict.shared.enums.NivelConfidencialidad;
import com.agileict.modules.proceso.dto.PuestoTicResponse;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ListaCandidatosResponse(
        UUID candidaturaId,
        UUID procesoId,
        String procesoTitulo,
        String procesoDescripcion,
        EstadoProceso procesoEstado,
        NivelConfidencialidad procesoNivelConfidencialidad,
        String procesoNivelExperienciaMinimo,
        PuestoTicResponse puesto,
        UUID profesionalId,
        String displayName,
        String nombre,
        String apellidos,
        String email,
        String descripcionPersonal,
        String tecnologiasClave,
        String titulacionesAcademicas,
        String idiomas,
        String softSkills,
        Integer aniosExperiencia,
        Integer rangoSalarialEsperadoMin,
        Integer rangoSalarialEsperadoMax,
        AreaNegocioProfesional areaNegocio,
        String sector,
        boolean activo,
        DisponibilidadProfesional disponibilidad,
        EstadoListaCandidato estado,
        EstadoSolicitudVisibilidad solicitudVisibilidad,
        OffsetDateTime fechaInclusion,
        OffsetDateTime fechaActualizacion,
        boolean anonimo
) {
}