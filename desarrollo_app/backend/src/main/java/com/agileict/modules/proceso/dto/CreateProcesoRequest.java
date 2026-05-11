package com.agileict.modules.proceso.dto;

import java.util.List;
import java.util.UUID;

import com.agileict.shared.enums.NivelConfidencialidad;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateProcesoRequest(
        @NotNull UUID empresaClienteId,
        @NotNull UUID responsableRrhhId,
        @NotBlank String titulo,
        @NotBlank String descripcion,
        @NotNull NivelConfidencialidad nivelConfidencialidad,
        String nivelExperienciaMinimo,
        @NotEmpty @Valid List<PuestoTicRequest> puestos
) {
}
