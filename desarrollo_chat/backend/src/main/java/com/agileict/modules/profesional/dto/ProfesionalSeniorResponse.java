package com.agileict.modules.profesional.dto;

import com.agileict.shared.enums.DisponibilidadProfesional;

import java.util.UUID;

public record ProfesionalSeniorResponse(
        UUID id,
        String nombre,
        String apellidos,
        String email,
        String tecnologiasClave,
        String titulacionesAcademicas,
        String idiomas,
        String softSkills,
        Integer aniosExperiencia,
        Integer rangoSalarialEsperadoMin,
        Integer rangoSalarialEsperadoMax,
        String descripcionPersonal,
        DisponibilidadProfesional disponibilidad,
        boolean perfilVisible,
        boolean activo
) {
}
