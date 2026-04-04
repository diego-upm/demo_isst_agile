package com.agileict.modules.profesional.dto;

import com.agileict.shared.enums.DisponibilidadProfesional;

import java.util.UUID;

public record ProfesionalSeniorResponse(
        UUID id,
        String nombre,
        String apellidos,
        String email,
        String tecnologiasClave,
        Integer aniosExperiencia,
        DisponibilidadProfesional disponibilidad,
        boolean perfilVisible,
        boolean activo
) {
}
