package com.agileict.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(
        @NotBlank String nombre,
        @NotBlank String cif,
        String sector
) {
}
