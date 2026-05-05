package com.agileict.modules.candidatura.dto;

import com.agileict.shared.enums.EstadoListaCandidato;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoCandidaturaRequest(
        @NotNull EstadoListaCandidato estado
) {
}