package com.agileict.modules.proceso.dto;

import com.agileict.shared.enums.NivelConfidencialidad;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateProcesoRequest(
        @NotNull UUID empresaClienteId,
        @NotNull UUID responsableRrhhId,
        @NotBlank String titulo,
        @NotBlank String descripcion,
        @NotNull NivelConfidencialidad nivelConfidencialidad,
        String tecnologiasRequeridas,
        String nivelExperienciaMinimo,
        String tipoContrato,
        Integer rangoSalarialMinimo,
        Integer rangoSalarialMaximo,
        @Valid List<PuestoTicRequest> puestos
) {
}
