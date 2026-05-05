package com.agileict.modules.profesional.dto;

import com.agileict.shared.enums.AreaNegocioProfesional;
import com.agileict.shared.enums.DisponibilidadProfesional;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateProfesionalSeniorMeRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 120) String apellidos,
        @Size(max = 1000) String tecnologiasClave,
        @Size(max = 1500) String titulacionesAcademicas,
        @Size(max = 1000) String idiomas,
        @Size(max = 1000) String softSkills,
        @NotNull @Min(0) @Max(60) Integer aniosExperiencia,
        @Min(0) Integer rangoSalarialEsperadoMin,
        @Min(0) Integer rangoSalarialEsperadoMax,
        @Size(max = 2000) String descripcionPersonal,
        @NotNull AreaNegocioProfesional areaNegocio,
        @NotNull DisponibilidadProfesional disponibilidad,
        @NotNull Boolean perfilVisible
) {
}
