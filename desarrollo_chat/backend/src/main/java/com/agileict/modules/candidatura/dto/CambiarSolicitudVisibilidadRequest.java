package com.agileict.modules.candidatura.dto;

import com.agileict.shared.enums.EstadoSolicitudVisibilidad;
import jakarta.validation.constraints.NotNull;

public record CambiarSolicitudVisibilidadRequest(
        @NotNull EstadoSolicitudVisibilidad solicitudVisibilidad
) {
}