package com.agileict.modules.proceso.dto;

import com.agileict.shared.enums.EstadoProceso;
import com.agileict.shared.enums.NivelConfidencialidad;

import java.util.List;
import java.util.UUID;

public record ProcesoHeadhuntingResponse(
        UUID id,
        String titulo,
        String descripcion,
        EstadoProceso estado,
        NivelConfidencialidad nivelConfidencialidad,
        String tecnologiasRequeridas,
        String nivelExperienciaMinimo,
        String tipoContrato,
        Integer rangoSalarialMinimo,
        Integer rangoSalarialMaximo,
        UUID empresaClienteId,
        UUID responsableRrhhId,
        List<PuestoTicResponse> puestos
) {
}
