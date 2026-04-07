package com.agileict.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegisterRrhhRequest(
        @NotNull UUID empresaClienteId,
        @NotBlank String responsableNombre,
        @NotBlank String responsableApellidos,
        @NotBlank @Email String responsableEmail,
        @NotBlank @Size(min = 8, max = 72) String password
) {
}
