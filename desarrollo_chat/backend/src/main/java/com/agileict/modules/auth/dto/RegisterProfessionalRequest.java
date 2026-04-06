package com.agileict.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record RegisterProfessionalRequest(
        @NotBlank String nombre,
        @NotBlank String apellidos,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        String tecnologiasClave,
        String titulacionesAcademicas,
        String idiomas,
        String softSkills,
        Integer aniosExperiencia,
        @Min(0) Integer rangoSalarialEsperadoMin,
        @Min(0) Integer rangoSalarialEsperadoMax,
        String descripcionPersonal
) {
}
