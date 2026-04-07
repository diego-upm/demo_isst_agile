package com.agileict.modules.candidatura.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CrearCandidaturaRequest(
        @NotNull UUID profesionalId
) {
}