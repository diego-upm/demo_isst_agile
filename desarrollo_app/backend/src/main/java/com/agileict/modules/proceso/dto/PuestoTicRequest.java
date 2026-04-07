package com.agileict.modules.proceso.dto;

import com.agileict.shared.enums.SenioridadPuesto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PuestoTicRequest(
        @NotBlank String titulo,
        @NotNull SenioridadPuesto senioridad,
        String modalidad,
        String ubicacion,
        String area,
        String descripcion
) {
}
